from pathlib import Path
import yaml

INV = Path("/app/ansible/inventory/inventory.yml")

def load_inventory() -> dict[str, str]:
    """
    возвращает {alias: ip}
    """
    data = yaml.safe_load(INV.read_text(encoding="utf-8"))
    pairs = {}

    def walk(node: dict):
        if not node:
            return
        for h, vars_ in (node.get("hosts") or {}).items():
            pairs[h] = vars_.get("ansible_host", h)
        for k, v in node.items():
            if k not in ("hosts", "vars") and isinstance(v, dict):
                walk(v)

    for top in data.values():
        walk(top)
    return pairs

def alias_by_ip(ip: str) -> str | None:
    pairs = load_inventory()
    for alias, _ip in pairs.items():
        if _ip == ip:
            return alias
    return None