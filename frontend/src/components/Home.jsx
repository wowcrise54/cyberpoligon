import React, { useEffect, useState } from "react";
import { Text, Loader } from "@gravity-ui/uikit";
import VMCard from "./VMCard";
import "./User.css";

const Home = () => {
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVMs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/vms/");
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setVms(data);
    } catch (err) {
      console.error("Ошибка при загрузке данных ВМ:", err);
      setError(err.message);
    } finally {
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

      {loading && (
        <div className="loader">
          <Loader size="l" />
        </div>
      )}

      {!loading && error && (
        <div className="error">
          <Text variant="body-1" color="critical">
            {`Не удалось загрузить ВМ: ${error}`}
          </Text>
        </div>
      )}

      {!loading && !error && (
        <>
          {vms.length === 0 ? (
            <div className="none">
              <Text variant="display-1">Нет доступных виртуальных машин</Text>
            </div>
          ) : (
            <div className="card-container">
              {vms.map((vm) => (
                <VMCard key={vm.id} vm={vm} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
