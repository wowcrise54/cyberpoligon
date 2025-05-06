import React, { useEffect, useState } from "react";
import { Text, Loader } from '@gravity-ui/uikit';
import VMCard from "./VMCard";
import './User.css';

const fakeData = [
  {
    id: 1,
    name: "Windows Server 2016",
    os_type: "windows",
    cpu_cores: 4,
    memory_gb: 8
  },
  {
    id: 2,
    name: "Ubuntu 24.04",
    os_type: "ubuntu",
    cpu_cores: 2,
    memory_gb: 4
  },
  {
    id: 3,
    name: "Debian",
    os_type: "debian",
    cpu_cores: 8,
    memory_gb: 16
  },
  {
    id: 4,
    name: "Astra Linux",
    os_type: "Astra",
    cpu_cores: 6,
    memory_gb: 6,
    ssd: 256,
    isTurnedOn: false,
  }
];

const Home = () => {
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVMs = async () => {
    try {
      setLoading(true);

      // Если бекэнд недоступен, используем тестовые данные
      // const response = await fetch("https://192.168.0.43/api/vms/");
      // const data = await response.json();
      // setVms(data);
      setTimeout(() => { // имитация задержки запроса
        setVms(fakeData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Ошибка при загрузке данных ВМ:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Главная";
    fetchVMs();
  }, []);

  return (
    <div className="home">
      <Text variant="display-1">Виртуальные машины</Text>
      {loading ? (
        <div className="loader">
          <Loader size="l" />
        </div>
      ) : (
        <div className="card-container">
          {vms.length === 0 ? (
            <div className="none">
              <Text variant="display-1">Нет доступных виртуальных машин</Text>
            </div>
          ) : (
            vms.map((vm) => (
              <VMCard key={vm.id} vm={vm} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
