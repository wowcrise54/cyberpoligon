// EditScriptModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Text, TextArea, Button, Loader } from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";

export default function EditScriptModal({ open, onClose, script, onSave }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !script?.id) {
      return;
    }
    setLoading(true);

    // Подтягиваем весь массив, затем ищем нужный скрипт
    fetch("/api/scripts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((scripts) => {
        const found = scripts.find((s) => s.id === script.id);
        if (found) {
          setDescription(found.description || "");
        } else {
          toaster.add({
            content: "Скрипт не найден в списке",
            theme: "warning",
          });
          setDescription("");
        }
      })
      .catch((e) => {
        toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
        setDescription("");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, script?.id]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || res.statusText);
      }
      onSave({ id: script.id, description });

      // Тост с подстановкой имени скрипта
      toaster.add({
        title: script.name || script.Название,
        content: "Описание сохранено",
        theme: "success",
      });
    } catch (e) {
      toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
    }
  };

  return (
    <Modal open={open} onClose={onClose} width="m">
      <div style={{ padding: 16 }}>
        {/* Заголовок с именем скрипта */}
        <Text variant="header-2">
          Редактировать описание "{script?.name || script?.Название}"
        </Text>

        {loading ? (
          <Loader size="l" style={{ margin: "16px auto", display: "block" }} />
        ) : (
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание скрипта"
            size="xl"
            style={{ width: "100%", marginTop: 12 }}
          />
        )}

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button view="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            view="action"
            onClick={handleSave}
            style={{ marginLeft: 8 }}
            disabled={loading}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
