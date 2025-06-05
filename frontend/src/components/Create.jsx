import React, { useState, useEffect } from "react";
import { TextInput, Text, Button, Select } from "@gravity-ui/uikit";
import "./User.css";

const Create = () => {

    useEffect(() => {
            document.title = "Создание виртуальной машины";
        }, []);

    const [name, setName] = useState("");
    const [cpuCores, setCpuCores] = useState("");
    const [memory, setMemory] = useState("");
    const [storage, setStorage] = useState("");
    const [osType, setOsType] = useState("");

    // Маппинг типов ОС и их шаблонов
    const osConfigs = {
        "Ubuntu Server": { template_id: "31f5b1f2-5d26-4de6-80a4-53f9477a428a" },
        "Windows 10": { template_id: "354e5d36-b733-4ca8-a385-5b1d655ea407" },
        "Debian 12": { template_id: "3b749f0a-2781-4eb4-82ec-2d4b5e8f1655" },
        "Astra": { template_id: "c047ebd7-744a-4a3f-b9a0-633660d58c48" },
        "Windows Server": {template_id: "f77b7ea6-f51f-4cb9-89e5-7230ff7c1ab3"},
        "Blank": {template_id: "00000000-0000-0000-0000-000000000000"},
    };

    const handleCreateVM = async () => {
        // Проверяем, существует ли выбранный тип ОС в маппинге
        const osConfig = osConfigs[osType];
        if (!osConfig || !osConfig.template_id) {
            alert("Выберите корректный тип ОС!");
            return;
        }

        // Формируем данные для отправки
        const requestData = {
            name,
            cpu_cores: parseInt(cpuCores) || 0,
            memory_gb: parseInt(memory) || 0,
            disk_size_gb: storage ? parseInt(storage) : undefined,
            template_id: osConfig.template_id, // Передаём только template_id
        };

        console.log("Отправляемые данные:", requestData);

        try {
            const response = await fetch("https://192.168.0.100/api/create_vm/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Виртуальная машина создаётся!");
                console.log("Результат:", result);
            } else {
                alert(`Ошибка: ${JSON.stringify(result.detail)}`);
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            alert("Не удалось подключиться к серверу.");
        }
    };

    return (
        <div className="create">
            <Text variant="display-1">Форма создания виртуальной машины</Text>

            <div className="option">
                <Text variant="body-2">Название<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    size="l"
                    placeholder="Название виртуальной машины"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="option">
                <Text variant="body-2">Операционная система<Text variant="body-2" color="danger">*</Text></Text>
                <Select
                    size="l"
                    placeholder="Выберите ОС"
                    value={osType} // Указываем текущее значение
                    onUpdate={(value) => setOsType(value)} // Устанавливаем значение в osType
                >
                    <Select.Option value="Ubuntu Server">Ubuntu Server</Select.Option>
                    <Select.Option value="Windows 10">Windows 10</Select.Option>
                    <Select.Option value="Debian 12">Debian 12</Select.Option>
                    <Select.Option value="Astra">Astra</Select.Option>
                    <Select.Option value="Windows Server">Windows Server</Select.Option>
                    <Select.Option value="Blank">Пустая ВМ</Select.Option>
                </Select>
            </div>

            <div className="option">
                <Text variant="body-2">Количество ядер процессора<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    size="l"
                    type="number"
                    placeholder="Введите количество ядер"
                    value={cpuCores}
                    onChange={(e) => setCpuCores(e.target.value)}
                />
            </div>

            <div className="option">
                <Text variant="body-2">Оперативная память (ГБ)<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    size="l"
                    type="number"
                    placeholder="Введите объём памяти"
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                />
            </div>

            <div className="option">
                <Text variant="body-2">Размер жёсткого диска (ГБ)<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    size="l"
                    type="number"
                    placeholder="Введите размер диска (необязательно)"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                />
            </div>

            <Button
                view="action"
                size="l"
                style={{ marginTop: "25px" }}
                onClick={handleCreateVM}
            >
                <Text variant="body-2">Создать</Text>
            </Button>
        </div>
    );
};

export default Create;
