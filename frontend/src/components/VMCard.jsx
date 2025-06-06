import React from "react";
import { Card, Icon, Text, Button } from "@gravity-ui/uikit";
import { WindowsIcon, UbuntuIcon, DebianIcon, AstraIcon } from "./Icons";
import { useNavigate } from "react-router-dom";
import "./User.css";

const VMCard = ({ vm }) => {
  const navigate = useNavigate();

  const getOsIcon = (os_type) => {
    if (os_type?.toLowerCase().includes("windows")) return WindowsIcon;
    if (os_type?.toLowerCase().includes("ubuntu")) return UbuntuIcon;
    if (os_type?.toLowerCase().includes("debian")) return DebianIcon;
    return AstraIcon;
  };

  // Проверяем статус максимально «жёстко»: убираем пробелы и приводим к нижнему регистру
  const rawStatus = vm.status || ""; 
  const normalized = rawStatus.trim().toLowerCase();
  const isRunning = normalized === "up";

  return (
    <div className="card" key={vm.id}>
      <Card className="card-box" view="raised" type="container" size="l">
        <div className="card-image">
          <Icon data={getOsIcon(vm.os_type)} />
        </div>
        <div className="card-text">
          <Text variant="header-1">{vm.name}</Text>
          <div className="card-params">
            <Text variant="body-1">
              Операционная система: {vm.os_type ?? "не указано"}
            </Text>
            <Text variant="body-1">
              Процессор: {vm.cpu_cores} ядра
            </Text>
            <Text variant="body-1">
              Оперативная память: {vm.memory_gb} ГБ
            </Text>
            {vm.disk_size_gb !== undefined && (
              <Text variant="body-1">
                Диск: {vm.disk_size_gb} ГБ
              </Text>
            )}
            {vm.address && (
              <Text variant="body-1">IP-адрес: {vm.address}</Text>
            )}
            <Text variant="body-1">
              Состояние:{" "}
              <Text
                variant="body-1"
                color={isRunning ? "positive" : "negative"}
              >
                {isRunning ? "Включена" : "Выключена"}
              </Text>
            </Text>
          </div>
        </div>
        <div className="buttons">
          <Button
            onClick={() => navigate(`/User/vm-settings/${vm.id}`)}
            className="card-edit"
            view="outlined"
            width="max"
            size="l"
          >
            <Text variant="body-2">Управление</Text>
          </Button>
          <Button className="card-edit" view="outlined" width="max" size="l">
            <Text variant="body-2">Консоль</Text>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VMCard;
