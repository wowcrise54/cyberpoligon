import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Text, TextInput, Icon, Loader, Switch, Card, Button, Label } from '@gravity-ui/uikit';
import {TrashBin, Copy, Terminal, CirclePlay, Globe, Cpu, HardDrive, FloppyDisk} from '@gravity-ui/icons';
import './User.css';
import Scripts from "./Scripts";

// Тестовые данные для виртуальных машин
const fakeVms = [
  {
    id: "1",
    name: "Windows Server 2016",
    os_type: "Windows",
    cpu_cores: 4,
    memory_gb: 8,
    ssd: 512,
    isTurnedOn: true,
  },
  {
    id: "2",
    name: "Ubuntu 24.04",
    os_type: "Ubuntu",
    cpu_cores: 2,
    memory_gb: 4,
    ssd: 256,
    isTurnedOn: false,
  },
  {
    id: "3",
    name: "Debian",
    os_type: "Debian",
    cpu_cores: 8,
    memory_gb: 16,
    ssd: 1024,
    isTurnedOn: false,
  },
  {
    id: "4",
    name: "Astra Linux",
    os_type: "Astra",
    cpu_cores: 6,
    memory_gb: 6,
    ssd: 256,
    isTurnedOn: false,
  }
];


const VMSettings = () => {
  const { vmId } = useParams();
  const navigate = useNavigate();
  const [vm, setVm] = useState(null);
  const [isTurnedOn, setIsTurnedOn] = useState(false);

  // Симулируем получение данных для выбранной ВМ из тестовых данных
  useEffect(() => {
    setTimeout(() => {
      const foundVm = fakeVms.find((item) => item.id === vmId);
      if (foundVm) {
        setVm(foundVm);
        setIsTurnedOn(foundVm.isTurnedOn);
      } else {
        console.error("Виртуальная машина не найдена");
      }
    }, 1000);
  }, [vmId]);

  useEffect(() => {
    if (vm && vm.name) {
      document.title = vm.name;
    }
  }, [vm]);  

  const handleToggle = () => {
    setIsTurnedOn((prev) => !prev);
  };

  if (!vm) {
    return (
    <div className="loader">
        <Loader size="l" />
    </div>
    );
  }

  return (
    <div>
      <Card view="outlined" type="container">
        <div className="vm-card">
          <div className="vm-title">
            <div className="vm-name">

              <Text variant="header-1">{vm.name}</Text>
              <Text variant="body-2">Описание и общая информация о виртуальной машине</Text>
            </div>

            <div className="vm-buttons">

              <Button view="normal" size="m">
                <Icon data={TrashBin} size={16} />
              </Button>
              <Button view="normal" size="m">
                <Icon data={Copy} size={16} />
              </Button>
              <Button view="normal" size="m">
                <Icon data={Terminal} size={16} />
              </Button>
              <Button view="action" size="m">
                <Icon data={CirclePlay} size={16} />
                Запустить
              </Button>
            </div>
          </div>

          <div className="vm-params">

            <div className="param-group">

              <div className="param">
                <Text variant="subheader-2">Состояние</Text>
                <Label size="xs" theme="danger">Выключена</Label>
              </div>

              <div className="param">
                <Text variant="subheader-2">Создана</Text>
                <Text variant="body-1">5 дней назад</Text>
              </div>

              <div className="param">
                <Text variant="subheader-2" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon data={HardDrive} size={16} />
                  Размер диска</Text>
                <Text variant="body-1">256 GB</Text>
              </div>                          

            </div>

            <div className="param-group">

              <div className="param">
                <Text variant="subheader-2">Регион</Text>
                <Text variant="body-1">Тюмень</Text>
              </div>

              <div className="param">
                <Text variant="subheader-2">Последнее изменение</Text>
                <Text variant="body-1">2 дня назад</Text>
              </div>

              <div className="param">
                <Text variant="subheader-2" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon data={FloppyDisk} size={16} />
                  Оперативная память</Text>
                <Text variant="body-1">18 GB</Text>
              </div>    

            </div>

            <div className="param-group">

              <div className="param">
                <Text variant="subheader-2">Имя хоста</Text>
                <Text color="warning" variant="body-1">vm-sunset-1234.cyberpoligon.dev</Text>
              </div>

              <div className="param">
                <Text variant="subheader-2" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon data={Globe} size={16} />
                  IP адрес</Text>
                <Text variant="body-1">192.168.195.163</Text>
              </div>            

            </div>

            <div className="param-group">

              <div className="param">
                <Text variant="subheader-2">Операционная система</Text>
                <Text variant="body-1">{vm.os_type}</Text>
              </div>

              <div className="param">
                <Text variant="subheader-2" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon data={Cpu} size={16} />
                  Процессор</Text>
                <Text variant="body-1">4 ядра</Text>
              </div>

            </div>

          </div>
        </div>
      </Card>

      
      <Card view="outlined" type="container" style={{ marginTop: 50 }}>
        <div className="vm-card">
          <div className="vm-title">
            <div className="vm-name">

              <Text variant="header-1">Скрипты</Text>
              <Text variant="body-2">Скрипты, доступные для данной виртуальной машины</Text>
            </div>

            <div className="vm-buttons">

            <Button view="action" size="m">
              <Icon data={CirclePlay} size={16} />
              Добавить новый скрипт
            </Button>
          </div>

          </div>

          <div className="vm-params">

            <Scripts osType={vm.os_type} />
          </div>

        </div>
      </Card>

    </div>
  );
};

export default VMSettings;
