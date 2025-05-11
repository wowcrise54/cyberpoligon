import requests
import logging
from .create_task import BASE_URL, PROJECT_ID, HEADERS, extract_id, get_inventory, get_environment, get_repositories

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

def create_template(name: str, description: str, playbook_path: str, tag: str, app: str) -> dict:
    repo_id        = extract_id(get_repositories())
    inventory_id   = extract_id(get_inventory())
    environment_id = extract_id(get_environment())

    payload = {
        "name":          name,
        "app": app,
        "description":   description,
        "repository_id": repo_id,
        "playbook":      playbook_path,     # ✔ правильное имя поля
        "inventory_id":  inventory_id,
        "environment_id": environment_id,
        "arguments": "[]",
        "task_params": {
            "tags": [tag],
        }
    }

    resp = requests.post(f"{BASE_URL}/project/{PROJECT_ID}/templates",
                     headers=HEADERS, json=payload)
    if resp.status_code >= 400:
        logger.error("Semaphore %s → %s", resp.status_code, resp.text)
        resp.raise_for_status()
    resp.raise_for_status()
    return resp.json()


def delete_template(template_id: int) -> None:
    """
    Удаляет шаблон в Semaphore по ID.
    Бросает HTTPError, если статус >= 400.
    """
    resp = requests.delete(
        f"{BASE_URL}/project/{PROJECT_ID}/templates/{template_id}",
        headers=HEADERS,
    )
    if resp.status_code >= 400:
        logging.error("Semaphore DELETE %s → %s", resp.status_code, resp.text)
    resp.raise_for_status()