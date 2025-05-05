import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Text, TextInput, Icon, Loader, Switch, Card } from '@gravity-ui/uikit';
import { WindowsIcon, UbuntuIcon, DebianIcon, AstraIcon } from "./Icons";
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
    <div className="create">
      <Card style={{ width: '600px' }} view="raised" type="container">
        <div className="nameimg">
          <Text variant="display-1">{vm.name}</Text>
        </div>
      </Card>


      <div className="mgt">
        <Text variant="header-1">Характеристики виртуальной машины</Text>
      </div>
      <div className="option">
          <Text variant="body-2">Операционная система</Text>
          <TextInput
              style={{ width: "300px" }}
              defaultValue={vm.os_type}
              disabled
          />
        </div>


      <div className="option">
        <Text variant="body-2">Количество ядер процессора</Text>
        <TextInput
            style={{ width: "300px" }}
            type="number"
            placeholder="Введите количество ядер"
            defaultValue={vm.cpu_cores}
        />
      </div>

      <div className="option">
        <Text variant="body-2">Количество оперативной памяти</Text>
        <TextInput
            style={{ width: "300px" }}
            type="number"
            placeholder="Введите количество оперативной памяти"
            defaultValue={vm.memory_gb}
        />
      </div>

      <div className="option">
        <Text variant="body-2">Обьем жесткого диска</Text>
        <TextInput
            style={{ width: "300px" }}
            type="number"
            placeholder="Введите объем жесткого диска"
            defaultValue={vm.ssd}
        />
      </div>

      <div className="option">
        <Text variant="body-2">Состояние </Text>
        <Switch
          style={{ width: "300px" }}
          size="l"
          checked={isTurnedOn}
          onChange={(e) => setIsTurnedOn(e.target.checked)}
        >
          {isTurnedOn ? "Включена" : "Выключена"}
        </Switch>
      </div>

      
      <div className="mgt">
        <Text variant="header-1">Доступные скрипты</Text>
      </div>
      <Scripts/>
    </div>
  );
};

export default VMSettings;
