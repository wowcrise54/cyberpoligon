import React, {useEffect, useState} from "react";
import {Text, TextInput, TextArea, Select, Button} from '@gravity-ui/uikit';
import { toaster } from "@gravity-ui/uikit/toaster-singleton"
import { useNavigate } from "react-router-dom";
import './User.css';

export default function Settings() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [path, setPath] = useState("");
  
    useEffect(() => {
      document.title = "Настройки";
    }, []);
  
    const handleSubmit = async () => {
      try {
        const res = await fetch("/api/scripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, path, description }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || res.statusText);
        }
        toaster.add({ title: "Готово", content: "Скрипт сохранён", theme: "success" });
        navigate("/all-scripts");
      } catch (e) {
        toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
      }
    };
  
    return (
      <div className="create">
        <Text variant="display-1">Добавить скрипт</Text>
  
        <div className="option">
          <Text variant="body-2">Название</Text>
          <TextInput
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Название скрипта"
            size="m"
            style={{ width: 300 }}
          />
        </div>
  
        <div className="option">
          <Text variant="body-2">Описание</Text>
          <TextArea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Описание скрипта"
            size="m"
            style={{ width: 300 }}
          />
        </div>
  
        <div className="option">
          <Text variant="body-2">Путь до скрипта</Text>
          <TextInput
            value={path}
            onChange={e => setPath(e.target.value)}
            placeholder="Путь (playbook) в репозитории"
            size="m"
            style={{ width: 300 }}
          />
        </div>
  
        <Button view="action" size="l" style={{ marginTop: 20 }} onClick={handleSubmit}>
          <Text variant="body-2">Добавить</Text>
        </Button>
      </div>
    );
  }
