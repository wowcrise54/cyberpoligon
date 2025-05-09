# backend/main.py

from typing import Optional
import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from semaphore_api.create_task import create_task, find_template_id_by_name, get_task_status, get_task_output, get_inventory, get_environment, get_repositories, extract_id
from tf_generator import run_terraform
from zvirt_client import get_vms
from f import format_vms

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


@app.post("/create_vm/")
async def create_vm(config: VMConfig):
    try:
        result = run_terraform(config.dict())
        return {"message": "VM created successfully", "terraform_output": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/vms/")
async def list_vms():
    try:
        formatted_vms = get_vms(playbook_path="ansible/test.yml", output_path="json/vms_formatted.json")
        return formatted_vms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/vms/raw/")
async def get_vms_raw():
    try:
        output_path = "json/vms_formatted.json"
        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Файл {output_path} не найден.")
        with open(output_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/run_playbook")
async def create_playbook_task(req: PlaybookRequest):
    try:
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
        }

        task = create_task(payload)
        return {"task_id": task["id"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/run_playbook/status")
async def playbook_status(task_id: int):
    try:
        status_info = get_task_status(task_id)
        output = None
        if status_info.get("status") in ("success", "failure"):
            output = get_task_output(task_id)
        return {"status": status_info["status"], "output": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))