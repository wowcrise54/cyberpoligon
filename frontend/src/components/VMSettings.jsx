import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Text, Button, Select, Loader } from '@gravity-ui/uikit';
import './User.css';
import Scripts from "./Scripts";

// Тестовые данные для виртуальных машин
const fakeVms = [
  {
    id: "1",
    name: "Ubuntu 24.04",
    os_type: "windows",
    cpu_cores: 4,
    memory_gb: 8,
    isTurnedOn: true,
  },
  {
    id: "2",
    name: "Test VM 2",
    os_type: "ubuntu",
    cpu_cores: 2,
    memory_gb: 4,
    isTurnedOn: false,
  },
  {
    id: "3",
    name: "Test VM 3",
    os_type: "debian",
    cpu_cores: 8,
    memory_gb: 16,
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
    <div className="vm-settings">
      <Text variant="display-1">Настройки виртуальной машины {vm.name}</Text>
      
      <div className="vm-info">
        <Text variant="body-1">Операционная система: {vm.os_type}</Text>
        <Text variant="body-1">Процессор: {vm.cpu_cores} ядра</Text>
        <Text variant="body-1">Оперативная память: {vm.memory_gb} ГБ</Text>
        <Text variant="body-1">
          Состояние: {isTurnedOn ? "Включена" : "Выключена"}
        </Text>
      </div>

      <div className="vm-scripts">
        <Text variant="body-2">Добавить скрипт</Text>
        <Select
          multiple={true}
          size="m"
          placeholder="Выберите нужные скрипты"
          width={250}
          style={{ marginTop: '8px' }}
        >
          <Select.Option value="1">Создать пользователя</Select.Option>
          <Select.Option value="2">Сделать что-то</Select.Option>
          <Select.Option value="3">Установить приложение</Select.Option>
          <Select.Option value="4">Создать что-то</Select.Option>
        </Select>
      </div>

      <div className="vm-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button view="action" size="l" onClick={() => navigate(-1)}>
          <Text variant="body-2">Назад</Text>
        </Button>
        <Button
          view={isTurnedOn ? "outlined-danger" : "outlined-success"}
          size="l"
          onClick={handleToggle}
        >
          <Text variant="body-2">
            {isTurnedOn ? "Выключить" : "Включить"}
          </Text>
        </Button>
      </div>
      <Scripts/>
    </div>
  );
};

export default VMSettings;
