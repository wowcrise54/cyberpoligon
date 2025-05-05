import requests
from .create_task import BASE_URL, PROJECT_ID, HEADERS, extract_id, get_inventory, get_environment, get_repositories

def create_template(name: str, description: str, playbook_path: str) -> dict:
    """
    Создаёт шаблон в Semaphore и возвращает JSON с данными нового шаблона.
    """
    # Получаем нужные ID
    inventory = get_inventory()
    environment = get_environment()
    repos = get_repositories()
    repo_id = extract_id(repos)
    inventory_id = extract_id(inventory)
    environment_id = extract_id(environment)

    payload = {
        "name": name,
        "description": description,
        "repository_id": repo_id,
        "playbook_path": playbook_path,
        "inventory_id": inventory_id,
        "environment_id": environment_id,
    }
    url = f"{BASE_URL}/project/{PROJECT_ID}/templates"
    resp = requests.post(url, headers=HEADERS, json=payload)
    resp.raise_for_status()
    return resp.json()