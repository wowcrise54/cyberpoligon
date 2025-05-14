// DynamicModal.jsx
import React from "react";
import { Modal, Text, TextInput, Button, Label, Select } from "@gravity-ui/uikit";

export default function DynamicModal({
  open,
  onClose,
  vars,       // [{ name, title, description, required, type, values }]
  params,     // { [name]: value }
  onChange,   // (newParams) => void
  onSubmit,   // () => void
}) {
  return (
    <Modal open={open} onClose={onClose} width="m">
      <div style={{ padding: 20 }}>
        <Text variant="header-2">Параметры запуска</Text>
        {vars.map((v) => {
          const value = params[v.name];
          const common = {
            key: v.name,
            startContent: <Label size="s">{v.title}</Label>,
            placeholder: v.description,
            required: v.required,
          };

          // Числовое поле — используем TextInput с type="number"
          if (v.type === "number") {
            return (
              <TextInput
                {...common}
                type="number"
                value={value}
                onUpdate={(val) => onChange({ ...params, [v.name]: val })}
              />
            );
          }

          // Селект-поле
          if (v.type === "select") {
            return (
              <Select
                {...common}
                options={v.values.map((opt) => ({ value: opt, text: opt }))}
                value={value}
                onUpdate={(val) => onChange({ ...params, [v.name]: val })}
              />
            );
          }

          // Поле для паролей
          if (v.type === "password") {
            return (
              <TextInput
                {...common}
                type="password"
                value={value}
                onUpdate={(val) => onChange({ ...params, [v.name]: val })}
              />
            );
          }

          // По умолчанию текстовое поле
          return (
            <TextInput
              {...common}
              type="text"
              value={value}
              onUpdate={(val) => onChange({ ...params, [v.name]: val })}
            />
          );
        })}

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Button view="flat" onClick={onClose}>Отмена</Button>
          <Button view="action" onClick={onSubmit} style={{ marginLeft: 8 }}>
            Запустить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
