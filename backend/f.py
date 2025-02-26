import os
import requests
from typing import List, Dict
import json

def format_vms(input_path="vms_raw.json", output_path="vms_formatted.json"):
    """
    Форматировать данные виртуальных машин до нужного формата, исключая os_type='znode', и сохранить в файл.
    """
    try:
        with open(input_path, "r", encoding="utf-8") as infile:
            raw_vms = json.load(infile)  # Читаем сырые данные

        print("Сырые данные виртуальных машин:", json.dumps(raw_vms, indent=4, ensure_ascii=False))

        # Проверяем наличие ключа "ovirt_vms"
        if "ovirt_vms" not in raw_vms:
            raise ValueError("Ключ 'ovirt_vms' отсутствует в данных.")

        # Преобразуем данные в нужный формат
        formatted_vms = []
        for vm in raw_vms.get("ovirt_vms", []):
            os_type = vm.get("os", {}).get("type", "unknown")
            
            # Пропускаем ВМ с os_type="znode"
            if os_type == "znode":
                print(f"ВМ с id={vm.get('id')} исключена из списка (os_type='znode').")
                continue
            
            vm_data = {
                "id": vm.get("id"),
                "name": vm.get("name"),
                "os_type": os_type,
                "cpu_cores": vm.get("cpu", {}).get("topology", {}).get("cores", 0),
                "memory_gb": round(vm.get("memory", 0) / (1024 ** 3), 2),
                "status": vm.get("status", "unknown")
            }
            formatted_vms.append(vm_data)

        print("Форматированные данные виртуальных машин:", json.dumps(formatted_vms, indent=4, ensure_ascii=False))

        # Сохраняем форматированные данные в выходной файл
        with open(output_path, "w", encoding="utf-8") as outfile:
            json.dump(formatted_vms, outfile, indent=4, ensure_ascii=False)

        print(f"Форматированные данные виртуальных машин сохранены в файл: {output_path}")
        return formatted_vms
    except Exception as e:
        print(f"Ошибка при форматировании данных: {e}")
        raise
