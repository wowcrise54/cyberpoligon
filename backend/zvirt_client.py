import os
import json
# import ansible_runner

def get_vms(playbook_path="ansible/test.yml", output_path="json/vms_formatted.json"):
    """
    Запустить Ansible playbook, который внутри себя уже форматирует данные
    в vms_formatted.json, а затем прочитать этот файл и вернуть данные.
    """
    try:
        # Запуск Ansible Runner
        runner = ansible_runner.run(
            private_data_dir=".",
            playbook=playbook_path
        )

        # Проверяем код возврата
        if runner.rc != 0:
            raise Exception(f"Ошибка выполнения плейбука: {runner.stdout}")

        # Проверяем, что файл с форматированными данными существует
        if not os.path.exists(output_path):
            raise FileNotFoundError("Файл с форматированными данными не найден.")

        # Читаем и возвращаем отформатированные данные
        with open(output_path, "r", encoding="utf-8") as infile:
            formatted_vms = json.load(infile)
        return formatted_vms

    except Exception as e:
        print(f"Ошибка при выполнении get_vms: {e}")
        raise