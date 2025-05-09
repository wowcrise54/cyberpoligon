import requests
from .create_task import BASE_URL, PROJECT_ID, HEADERS, extract_id, get_inventory, get_environment, get_repositories

def create_template(name: str, description: str, playbook_path: str) -> dict:
    repo_id        = extract_id(get_repositories())
    inventory_id   = extract_id(get_inventory())
    environment_id = extract_id(get_environment())

    payload = {
        "name":          name,
        "description":   description,
        "repository_id": repo_id,
        "playbook":      playbook_path,     # ✔ правильное имя поля
        "inventory_id":  inventory_id,
        "environment_id": environment_id,
        "arguments": "[]",                  # либо уберите, если не нужны
    }

    url = f"{BASE_URL}/project/{PROJECT_ID}/templates"
    resp = requests.post(url, headers=HEADERS, json=payload)
    resp.raise_for_status()
    return resp.json()