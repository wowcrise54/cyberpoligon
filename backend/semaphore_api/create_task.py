import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Конфигурация для доступа к API Semaphore (захардкоженные параметры)
BASE_URL = "http://192.168.220.198:3000/api"  # адрес сервера Semaphore
PROJECT_ID = 1
TOKEN = os.getenv("SEMAPHORE_TOKEN")  # токен доступа к API Semaphore

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def get_inventory():
    url = f"{BASE_URL}/project/{PROJECT_ID}/inventory"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def get_environment():
    url = f"{BASE_URL}/project/{PROJECT_ID}/environment"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def get_repositories():
    url = f"{BASE_URL}/project/{PROJECT_ID}/repositories"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def get_template(template_id: int):
    url = f"{BASE_URL}/project/{PROJECT_ID}/templates/{template_id}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def create_task(payload: dict):
    url = f"{BASE_URL}/project/{PROJECT_ID}/tasks"
    response = requests.post(url, headers=HEADERS, json=payload)
    response.raise_for_status()
    return response.json()

def get_task_output(task_id: int):
    url = f"{BASE_URL}/project/{PROJECT_ID}/tasks/{task_id}/output"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def get_templates():
    url = f"{BASE_URL}/project/{PROJECT_ID}/templates"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def find_template_id_by_name(template_name: str):
    """
    Ищет шаблон по имени и возвращает его id.
    Если шаблон не найден, возвращает None.
    """
    templates = get_templates()
    for template in templates:
        if template.get("name") == template_name:
            return template.get("id")
    return None

def extract_id(data, default=1):
    """
    Если data - список, возвращает id первого элемента, иначе пытается вызвать .get("id").
    """
    if isinstance(data, list):
        if len(data) > 0 and isinstance(data[0], dict):
            return data[0].get("id", default)
        else:
            return default
    elif isinstance(data, dict):
        return data.get("id", default)
    return default

def run_playbook_by_name(template_name: str):
    """
    Объединяет вызовы API для запуска плейбука по имени шаблона и возвращает результат.
    """
    template_id = find_template_id_by_name(template_name)
    if not template_id:
        raise Exception(f"Шаблон с именем '{template_name}' не найден.")
    
    # Получаем необходимые данные
    inventory = get_inventory()
    environment = get_environment()
    repositories = get_repositories()
    
    # Формирование данных для создания задачи (запуска плейбука)
    task_payload = {
        "template_id": template_id,
        "environment_id": extract_id(environment),
        "inventory_id": extract_id(inventory),
        "repository_ids": [repo.get("id") for repo in repositories if isinstance(repo, dict)]
    }

    # Создание задачи (запуска плейбука)
    task_response = create_task(task_payload)
    task_id = task_response.get("id")
    if not task_id:
        raise Exception("Не удалось создать задачу (отсутствует ID задачи).")

    # Небольшая задержка, чтобы задача успела запуститься
    time.sleep(5)
    output = get_task_output(task_id)
    
    return {"task_id": task_id, "output": output}

def get_task_status(task_id: int):
    url = f"{BASE_URL}/project/{PROJECT_ID}/tasks/{task_id}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()  # в JSON ожидаем поле "status"