import requests
import logging
import os
from pathlib import Path
from .create_task import BASE_URL, PROJECT_ID, HEADERS, extract_id, get_inventory, get_environment, get_repositories
from jinja2 import Environment, meta
import json

BASE_DIR = Path("/app")

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

def create_template(name: str, description: str, playbook_path: str, tag: str, app: str) -> dict:
    repo_id        = extract_id(get_repositories())
    inventory_id   = extract_id(get_inventory())
    environment_id = extract_id(get_environment())

    vars_list   = extract_playbook_vars(playbook_path)
    survey_vars = build_survey_vars(vars_list)

    payload = {
        "name":          name,
        "app": app,
        "description":   description,
        "repository_id": repo_id,
        "playbook":      playbook_path,     # ✔ правильное имя поля
        "inventory_id":  inventory_id,
        "environment_id": environment_id,
        "arguments": "[]",
        "survey_vars":    survey_vars,
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

def extract_playbook_vars(playbook_path: str) -> list[str]:
    """
    Парсит Jinja-шаблон и возвращает список всех {{ var }}.
    Если playbook_path — относительный, то он берётся от /app.
    """
    p = Path(playbook_path)
    if not p.is_absolute():
        # Добавляем /app в начало
        p = BASE_DIR / p

    if not p.exists():
        raise FileNotFoundError(f"Playbook not found: {p}")

    content = p.read_text(encoding="utf-8")
    env     = Environment()
    ast     = env.parse(content)
    return sorted(meta.find_undeclared_variables(ast))

def build_survey_vars(var_names: list[str]) -> list[dict]:
    """
    Формирует список объектов survey_vars для Semaphore UI.
    """
    survey = []
    for v in var_names:
        survey.append({
            "name":        v,
            "title":       v.replace('_', ' ').capitalize(),
            "description": "",
            "required":    True,
            "type":        "",
            "values":      []
        })
    return survey