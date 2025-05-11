// InstallModal.jsx
import React from "react";
import { Modal, Text, TextInput, Button, Label } from "@gravity-ui/uikit";

export default function InstallModal({
  open,
  onClose,
  script,
  params,
  onParamsChange,
  onSubmit,
}) {
  return (
    <Modal open={open} onClose={onClose} width="m">
      <div className="scriptinfo">

        <div className="script-title">
            <Text variant="header-2">
                Параметры установки "{script?.Название || script?.name}"
            </Text>
        </div>

        <div className="script-description">
          <TextInput
            startContent={<Label theme="info" size="s">Имя пользователя</Label>}
            placeholder="Введите имя пользователя"
            value={params.username}
            onUpdate={(value) =>
              onParamsChange({ ...params, username: value })
            }
          />
        </div>

        {/* Кнопки */}
        <div className="script-buttons">
          <Button view="flat" onClick={onClose}>
            Отмена
          </Button>
          <Button view="action" onClick={onSubmit} style={{ marginLeft: 8 }}>
            Запустить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
