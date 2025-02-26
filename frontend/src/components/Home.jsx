import React, { useEffect, useState } from "react";
import { Text, Card, Modal, Button, Icon, Select, Loader } from '@gravity-ui/uikit';
import { WindowsIcon, UbuntuIcon, DebianIcon, AstraIcon } from "./Icons";
import './User.css';

const Home = () => {
    const [vms, setVms] = useState([]);          // Список виртуальных машин
    const [open, setOpen] = useState(false);     // Состояние модального окна
    const [currentMachine, setCurrentMachine] = useState(null); // Текущая ВМ для управления
    const [loading, setLoading] = useState(false); // Индикатор загрузки данных

    // Состояние «включено/выключено» для каждой машины.
    // Ключом (machineId) может быть vm.id, значение — true/false
    const [isTurnedOn, setIsTurnedOn] = useState({});

    // Функция переключения машины on/off
    const handleToggle = (machine) => {
        // Если нужен ключ по ID:
        const machineId = machine.id;
        setIsTurnedOn((prevState) => ({
            ...prevState,
            [machineId]: !prevState[machineId],
        }));
        console.log(
            `Машина ${machine.name} теперь ${
                !isTurnedOn[machineId] ? "Включена" : "Выключена"
            }`
        );
    };

    // Загрузка данных о виртуальных машинах
    const fetchVMs = async () => {
        try {
            setLoading(true);

            // Получение данных из /vms/raw
            const rawResponse = await fetch("http://localhost:8000/vms/raw/");
            if (!rawResponse.ok) {
                throw new Error(`Ошибка загрузки из /vms/raw: ${rawResponse.statusText}`);
            }
            const rawData = await rawResponse.json();
            console.log("Данные из /vms/raw:", rawData);
            setVms(rawData);

            // Обновление данных через /vms
            const updatedResponse = await fetch("http://localhost:8000/vms/");
            if (!updatedResponse.ok) {
                throw new Error(`Ошибка обновления из /vms: ${updatedResponse.statusText}`);
            }
            const updatedData = await updatedResponse.json();
            console.log("Обновленные данные из /vms:", updatedData);
            setVms(updatedData); // Обновляем состояние

        } catch (error) {
            console.error("Ошибка при загрузке данных ВМ:", error);
        } finally {
            setLoading(false);
        }
    };

    // Вызываем fetchVMs при первом рендере
    useEffect(() => {
        document.title = "Главная"; // Устанавливаем заголовок страницы
        fetchVMs(); // Загружаем данные
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
                            <div key={vm.id} className="card">
                                <Card className="card-box" view="raised" type="container" size="l">
                                    <div className="card-image">
                                        <Icon
                                            data={
                                                vm.os_type.includes('windows')
                                                    ? WindowsIcon
                                                    : vm.os_type.includes('ubuntu')
                                                        ? UbuntuIcon
                                                        : vm.os_type.includes('debian')
                                                            ? DebianIcon
                                                            : AstraIcon
                                            }
                                        />
                                    </div>
                                    <div className="card-text">
                                        <Text variant="header-1">{vm.name}</Text>
                                        <div className="card-params">
                                            
                                            <Text variant="body-1">Операционная система: {vm.os_type}</Text>
                                            <Text variant="body-1">Процессор: {vm.cpu_cores} ядра</Text>
                                            <Text variant="body-1">Оперативная память: {vm.memory_gb} ГБ</Text>
                                            <Text variant="body-1">
                                                Состояние:&nbsp;
                                                <Text
                                                    variant="body-1"
                                                    color="positive"
                                                    
                                                >
                                                    Включена
                                                </Text>
                                            </Text>
                                        </div>
                                    </div>
                                    <div className="buttons">
                                        <Button
                                            onClick={() => {
                                                console.log("Открываем модальное окно для:", vm.name);
                                                setOpen(true);
                                                setCurrentMachine(vm);
                                            }}
                                            className="card-edit"
                                            view="outlined"
                                            width="max"
                                            size="l"
                                        >
                                            <Text variant="body-2">Управление</Text>
                                        </Button>
                                        <Button
                                            className="card-edit"
                                            view="outlined"
                                            width="max"
                                            size="l"
                                        >
                                            <Text variant="body-2">Консоль</Text>
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Модальное окно для управления ВМ */}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                // Можно добавить стиль, чтобы модальное окно не было слишком узким:
                
            >
                {currentMachine !== null && (
                    <div className="modal-edit">
                        <Text variant="header-1" style={{ marginBottom: '12px' }}>
                            Управление
                        </Text>
                        <Text variant="body-1" style={{ marginBottom: '12px' }}>
                            Текущая машина: {currentMachine.name}
                        </Text>
                        <Text variant="body-1" style={{ marginBottom: '20px' }}>
                            ID машины: {currentMachine.id}
                        </Text>

                        <div className="modal-script" style={{ marginBottom: '20px' }}>
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

                        <div className="modal-script" style={{ display: 'flex', gap: '10px' }}>
                            <Button
                                className="card-edit"
                                view="action"
                                width="max"
                                size="l"
                                onClick={() => {
                                    // Здесь можно обработать «Сохранить»
                                    console.log(`Скрипты сохранены для: ${currentMachine.name}`);
                                    setOpen(false);
                                }}
                            >
                                <Text variant="body-2">Сохранить</Text>
                            </Button>

                            <Button
                                className="card-edit"
                                // Если машина включена — показываем danger для «Выключить»,
                                // если выключена — success для «Включить»
                                view={
                                    isTurnedOn[currentMachine.id]
                                        ? "outlined-danger"
                                        : "outlined-success"
                                }
                                width="max"
                                size="l"
                                onClick={() => handleToggle(currentMachine)}
                            >
                                <Text variant="body-2">
                                    {isTurnedOn[currentMachine.id] ? "Выключить" : "Включить"}
                                </Text>
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Home;
