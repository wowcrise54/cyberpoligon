import React from "react";
import { Modal, Text } from "@gravity-ui/uikit";
import './User.css';

const ScriptInfo = ({ open, onClose, script }) => {
  return (
    <Modal open={open} onClose={onClose}>
      {script ? (
        <div className="scriptinfo">
          <Text variant="header-2">Информация о скрипте</Text>
          <Text variant="body-2" >Этот скрипт предназначен для создания нового пользователя. 
            Он автоматически задаёт начальные параметры, пароль и назначает базовые роли.</Text>
        </div>
      ) : (
        <div style={{ padding: "16px" }}>
          <Text variant="header-2">Нет данных</Text>
        </div>
      )}
    </Modal>
  );
};

export default ScriptInfo;
