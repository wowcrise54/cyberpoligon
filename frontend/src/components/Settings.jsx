import React, {useEffect, useState} from "react";
import {Text, TextInput, TextArea, Button, Loader} from '@gravity-ui/uikit';
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import './User.css';

export default function Settings() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [path, setPath] = useState("");
    const [tag, setTag] = useState("");
    const [app, setApp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.title = "Настройки";
    }, []);

    const handleSubmit = async () => {
        if (!name.trim() || !path.trim() || !description.trim() || !tag.trim() || !app.trim()) {
            toaster.add({
                title: "Ошибка",
                content: "Пожалуйста, заполните все поля",
                theme: "danger",
                autoHiding: 5000,
            });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/scripts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, path, description, tag, app }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || res.statusText);
            }

            // Успешно сохранили — показываем тост
            toaster.add({ title: name, content: "Скрипт добавлен", theme: "success" });

            // Очищаем форму
            setName("");
            setDescription("");
            setPath("");
            setTag("");
            setApp("");
        } catch (e) {
            toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create">
            <Text variant="display-1">Форма добавления скрипта</Text>

            <div className="option">
                <Text variant="body-2">Название<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Название скрипта"
                    size="l"
                />
            </div>

            <div className="option">
                <Text variant="body-2">Описание<Text variant="body-2" color="danger">*</Text></Text>
                <TextArea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Описание скрипта"
                    size="l"
                />
            </div>

            <div className="option">
                <Text variant="body-2">Путь до скрипта<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    value={path}
                    onChange={e => setPath(e.target.value)}
                    placeholder="Путь (playbook) в репозитории"
                    size="l"
                />
            </div>

            <div className="option">
                <Text variant="body-2">Тег<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    placeholder="К какой ОС относится скрипт"
                    size="l"
                />
            </div>

            <div className="option">
                <Text variant="body-2">Приложение<Text variant="body-2" color="danger">*</Text></Text>
                <TextInput
                    value={app}
                    onChange={e => setApp(e.target.value)}
                    placeholder="Приложение для запуска скрипта"
                    size="l"
                />
            </div>

            <Button
                view="action"
                size="l"
                style={{ marginTop: 20 }}
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading
                    ? <Loader size="s" />
                    : <Text variant="body-2">Добавить</Text>
                }
            </Button>
        </div>
    );
}
