from typing import Optional
import os
from semaphore_api.create_task import run_playbook_by_name
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

class RunPlaybookRequest(BaseModel):
    project_id: int
    template_id: int
    debug: bool = False
    dry_run: bool = False
    extra_vars: dict = {}
    limit: str = ""

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
    
@app.api_route("/run_playbook", methods=["GET", "POST"])
def run_playbook_endpoint(template_name: str):
    try:
        result = run_playbook_by_name(template_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))