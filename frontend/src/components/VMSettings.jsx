import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Text,
  Loader,
  Card,
  Button,
  Label,
} from "@gravity-ui/uikit";
import {
  TrashBin,
  Copy,
  Terminal,
  CirclePlay,
  HardDrive,
  Cpu,
  FloppyDisk,
  Globe,
} from "@gravity-ui/icons";
import "./User.css";
import Scripts from "./Scripts";

const VMSettings = () => {
  const { vmId } = useParams();
  const navigate = useNavigate();

  const [vm, setVm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = vm ? vm.name : "Загрузка...";
  }, [vm]);

  useEffect(() => {
    const fetchVM = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/vms/");
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // Предполагаем, что data — это массив объектов с полями:
        // id (строка), name, os_type, cpu_cores, memory_gb, status, address и др.
        const found = data.find((item) => String(item.id) === vmId);
        if (!found) {
          throw new Error("Виртуальная машина с таким ID не найдена");
        }

        setVm(found);
      } catch (err) {
        console.error("Ошибка при получении данных ВМ:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVM();
  }, [vmId]);

  // Пока идёт загрузка — показываем спиннер
  if (loading) {
    return (
      <div className="loader">
        <Loader size="l" />
      </div>
    );
  }

  // Если произошла ошибка или ВМ не найдена
  if (error) {
    return (
      <div className="error">
        <Text variant="body-1" color="critical">
          {`Не удалось загрузить ВМ: ${error}`}
        </Text>
        <Button
          view="outlined"
          size="m"
          style={{ marginTop: 20 }}
          onClick={() => navigate("/")}
        >
          <Text variant="body-2">Вернуться на главную</Text>
        </Button>
      </div>
    );
  }


  // Здесь точно есть vm
  const rawStatus = vm.status || "";
  const normalized = rawStatus.trim().toLowerCase();
  const isRunning = normalized === "up";


  return (
    <div>
      <Card view="outlined" type="container">
        <div className="vm-card">
          <div className="vm-title">
            <div className="vm-name">
              <Text variant="header-1">{vm.name}</Text>
              <Text variant="body-2">
                Описание и общая информация о виртуальной машине
              </Text>
            </div>

            <div className="vm-buttons">
              <Button view="normal" size="m">
                <TrashBin size={16} />
              </Button>
              <Button view="normal" size="m">
                <Copy size={16} />
              </Button>
              <Button view="normal" size="m">
                <Terminal size={16} />
              </Button>
              <Button view="action" size="m">
                <CirclePlay size={16} />
                {isRunning ? "Перезапустить" : "Запустить"}
              </Button>
            </div>
          </div>

          <div className="vm-params">
            {/* ----------------- Колонка 1 ----------------- */}
            <div className="param-group">
              {/* Состояние */}
              <div className="param">
                <Text variant="subheader-2">Состояние</Text>
                <Label size="xs" theme={isRunning ? "success" : "danger"}>
                  {isRunning ? "Включена" : "Выключена"}
                </Label>
              </div>

              {/* IP-адрес */}
              {vm.address && (
                <div className="param">
                  <Text
                    variant="subheader-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Globe size={16} />
                    IP адрес
                  </Text>
                  <Text variant="body-1">{vm.address}</Text>
                </div>
              )}

              {/* Диск, если есть disk_size_gb */}
              {vm.disk_size_gb !== undefined && (
                <div className="param">
                  <Text
                    variant="subheader-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <HardDrive size={16} />
                    Размер диска
                  </Text>
                  <Text variant="body-1">
                    {vm.disk_size_gb} GB
                  </Text>
                </div>
              )}
            </div>

            {/* ----------------- Колонка 2 ----------------- */}
            <div className="param-group">
              {/* Оперативная память */}
              {vm.memory_gb !== undefined && (
                <div className="param">
                  <Text
                    variant="subheader-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <FloppyDisk size={16} />
                    Оперативная память
                  </Text>
                  <Text variant="body-1">
                    {vm.memory_gb} GB
                  </Text>
                </div>
              )}

              {/* Процессор */}
              {vm.cpu_cores !== undefined && (
                <div className="param">
                  <Text
                    variant="subheader-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Cpu size={16} />
                    Процессор
                  </Text>
                  <Text variant="body-1">
                    {vm.cpu_cores} {' '}
                    {vm.cpu_cores === 1 ? "ядро" : "ядра"}
                  </Text>
                </div>
              )}

              {/* Операционная система */}
              {vm.os_type && (
                <div className="param">
                  <Text variant="subheader-2">
                    Операционная система
                  </Text>
                  <Text variant="body-1">{vm.os_type}</Text>
                </div>
              )}
            </div>

            {/* ----------------- Колонка 3 (необязательные поля) ----------------- */}
            <div className="param-group">
              {/* Если в будущем добавятся поля типа created_at, region и т.д.,
                  их можно здесь отобразить: */}
              {vm.created_at && (
                <div className="param">
                  <Text variant="subheader-2">Создана</Text>
                  <Text variant="body-1">
                    {/* Предполагаем, что created_at приходит в ISO: "2025-06-01T12:34:56Z" */}
                    {new Date(vm.created_at).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </div>
              )}

              {vm.region && (
                <div className="param">
                  <Text variant="subheader-2">Регион</Text>
                  <Text variant="body-1">{vm.region}</Text>
                </div>
              )}

              {vm.hostname && (
                <div className="param">
                  <Text variant="subheader-2">Имя хоста</Text>
                  <Text
                    color="warning"
                    variant="body-1"
                  >
                    {vm.hostname}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Блок со Скриптами — передаём os_type из vm */}
      <Card
        view="outlined"
        type="container"
        style={{ marginTop: 50 }}
      >
        <div className="vm-card">
          <div className="vm-title">
            <div className="vm-name">
              <Text variant="header-1">Скрипты</Text>
              <Text variant="body-2">
                Скрипты, доступные для данной виртуальной машины
              </Text>
            </div>
            <div className="vm-buttons">
              <Button view="action" size="m">
                <CirclePlay size={16} />
                Добавить новый скрипт
              </Button>
            </div>
          </div>
          <div className="vm-params">
            <Scripts osType={vm.os_type} vmId={vm.id} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VMSettings;
