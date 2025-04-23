from typing import Optional
import os
from semaphore_api.create_task import *
from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tf_generator import run_terraform
from fastapi.middleware.cors import CORSMiddleware
from zvirt_client import get_vms
from f import format_vms
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно ограничить конкретными доменами, например, ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель данных с необязательным параметром
class VMConfig(BaseModel):
    name: str
    cpu_cores: int
    memory_gb: int
    os_type: Optional[str] = None
    disk_size_gb: Optional[int] = None  # Необязательный параметр
    template_id: str

class PlaybookRequest(BaseModel):
    template_name: str

@app.post("/create_vm/")
async def create_vm(config: VMConfig):
    try:
        print("Полученные данные для Terraform:", config.dict())

        # Запуск Terraform с переданными переменными
        result = run_terraform(config.dict())
        return {"message": "VM created successfully", "terraform_output": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/vms/")
async def list_vms():
    try:
        # Запускаем get_vms, которая внутри себя запустит Ansible playbook
        # и вернёт сформированный JSON
        formatted_vms = get_vms(playbook_path="ansible/test.yml", output_path="json/vms_formatted.json")
        return formatted_vms
    except Exception as e:
        return {"error": str(e)}

@app.get("/vms/raw/")
async def get_vms_raw():
    try:
        # Указываем путь к JSON-файлу
        output_path = "json/vms_formatted.json"
        
        # Проверяем наличие файла
        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Файл {output_path} не найден.")
        
        # Считываем данные из файла
        with open(output_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        
        # Возвращаем содержимое файла как JSON
        return JSONResponse(content=data)
    except Exception as e:
        print(f"Ошибка в get_vms_raw: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при чтении данных")
    
@app.post("/run_playbook")
async def create_playbook_task(req: PlaybookRequest):
    """
    Создаём задачу запуска плейбука и сразу возвращаем task_id.
    """
    template_name = req.template_name
    try:
        template_id = find_template_id_by_name(template_name)
        if not template_id:
            raise HTTPException(status_code=404, detail="Шаблон не найден")

        # подготавливаем полезную нагрузку
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
    """
    Возвращаем статус (pending|running|success|failure) и, если завершено, логи.
    """
    try:
        # Получим мета-инфо и вывод
        status_info = get_task_status(task_id)      # новый метод в create_task.py
        output = None
        if status_info.get("status") in ("success", "failure"):
            output = get_task_output(task_id)
        return {"status": status_info["status"], "output": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))