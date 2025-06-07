# backend/main.py
import uuid
from typing import Optional, List
import os
import json
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from utils.inventory_reader import alias_by_ip

from semaphore_api.create_task import (
    create_task,
    find_template_id_by_name,
    get_task_status,
    get_task_output,
    get_inventory,
    get_environment,
    get_repositories,
    extract_id,
)
from tf_generator import run_terraform
from zvirt_client import get_vms        # <<< Оставляем вызов get_vms
from database.session import get_session
from database.db_config import async_session_maker
from database.users.models import VirtualMachine
# импортируем роутер для /api/auth
from database.router import router as users_router

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATUS_MAP = {
    "waiting": "pending",   # ← теперь фронт видит familiar "pending"
    "error":   "failure",   # (у Semaphore нет 'failure', он шлёт 'error')
}


# ---------------------------------------------------------------------------
# Фоновая задача: каждую минуту запускаем playbook
# test.yml, обновляем СГ в базе
# ---------------------------------------------------------------------------

async def sync_vms_once():
    """Запускает Ansible playbook и синхронизирует
    таблицу ``virtual_machine``."""
    formatted_vms = get_vms(
        playbook_path="ansible_zvirt/test.yml",
        output_path="json/vms_formatted.json",
    )

    async with async_session_maker() as session:
        for vm in formatted_vms:
            zvirt_uuid = uuid.UUID(vm["id"])
            vm_data = vm.copy()
            vm_data.pop("id")
            vm_data["zvirt_id"] = zvirt_uuid

            stmt = select(VirtualMachine).where(VirtualMachine.zvirt_id == zvirt_uuid)
            res = await session.execute(stmt)
            existing_vm = res.scalars().first()

            if existing_vm:
                existing_vm.name = vm_data["name"]
                existing_vm.os_type = vm_data["os_type"]
                existing_vm.cpu_cores = vm_data["cpu_cores"]
                existing_vm.memory_gb = vm_data["memory_gb"]
                existing_vm.status = vm_data["status"]
                existing_vm.address = vm_data["address"]
            else:
                session.add(VirtualMachine(**vm_data))

        await session.commit()


async def sync_vms_loop():
    """Запускает ``sync_vms_once`` каждые 60 секунд."""
    while True:
        try:
            await sync_vms_once()
        except Exception as exc:  # pragma: no cover - для логов
            print(f"VM sync error: {exc}")
        await asyncio.sleep(60)


@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(sync_vms_loop())

# прокидываем все роуты авторизации под /api
app.include_router(users_router, prefix="/api")


class VMConfig(BaseModel):
    name: str
    cpu_cores: int
    memory_gb: int
    os_type: Optional[str] = None
    disk_size_gb: Optional[int] = None
    template_id: str


class PlaybookRequest(BaseModel):
    template_name: str
    vm_id: str 
    variables: dict[str, str] = {}    # здесь на выходе то, что задаст юзер


class VMResponse(BaseModel):
    """
    Схема ответа для /vms/.
    Поле `id` соответствует zvirt_id (UUID в виде строки).
    """
    id: str
    name: str
    os_type: Optional[str]
    cpu_cores: int
    memory_gb: int
    status: str
    address: Optional[str]

    class Config:
        orm_mode = True


@app.post("/api/create_vm/")
async def create_vm(config: VMConfig):
    try:
        result = run_terraform(config.dict())
        return {"message": "VM created successfully", "terraform_output": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/vms/", response_model=List[VMResponse])
async def list_vms(session: AsyncSession = Depends(get_session)):
    """Возвращает все записи из таблицы ``virtual_machine``."""
    try:
        stmt_all = select(VirtualMachine)
        res_all = await session.execute(stmt_all)
        vms_in_db = res_all.scalars().all()

        result_list = []
        for vm_obj in vms_in_db:
            result_list.append({
                "id": str(vm_obj.zvirt_id),
                "name": vm_obj.name,
                "os_type": vm_obj.os_type,
                "cpu_cores": vm_obj.cpu_cores,
                "memory_gb": vm_obj.memory_gb,
                "status": vm_obj.status,
                "address": vm_obj.address,
            })
        return result_list

    except Exception as exc:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/vms/raw/")
async def get_vms_raw():
    """
    Возвращает «сырые» данные из JSON-файла ansible-плейбука,
    если он успел записаться в json/vms_formatted.json
    """
    try:
        output_path = "json/vms_formatted.json"
        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Файл {output_path} не найден.")
        with open(output_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/run_playbook")
async def create_playbook_task(req: PlaybookRequest,
                               session: AsyncSession = Depends(get_session)):
    try:

        stmt = select(VirtualMachine).where(
            VirtualMachine.zvirt_id == uuid.UUID(req.vm_id)
        )
        res = await session.execute(stmt)
        vm = res.scalar_one_or_none()
        if not vm:
            raise HTTPException(status_code=404, detail="VM not found")

        alias = alias_by_ip(vm.address) or vm.name
        req.variables["target_host"] = alias        # 💡 добавили в переменные

        # --- остальной код прежний ---
        template_id = find_template_id_by_name(req.template_name)
        if not template_id:
            raise HTTPException(status_code=404, detail="Шаблон не найден")

        inventory = get_inventory()
        environment = get_environment()
        repos = get_repositories()
        payload = {
            "template_id": template_id,
            "environment_id": extract_id(environment),
            "inventory_id": extract_id(inventory),
            "repository_ids": [r["id"] for r in repos if isinstance(r, dict)],
            "environment":   json.dumps(req.variables or {}),
        }

        task = create_task(payload)
        return {"task_id": task["id"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/run_playbook/status")
async def playbook_status(task_id: int):
    info = get_task_status(task_id)
    raw = info["status"]
    status = STATUS_MAP.get(raw, raw)  # нормализация

    output = None
    if status in ("success", "failure"):
        output = get_task_output(task_id)

    return {"status": status, "output": output}
