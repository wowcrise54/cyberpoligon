import React, { useState } from "react";
import { Icon, Table, withTableActions } from "@gravity-ui/uikit";
import {toaster} from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";

const MyTable = withTableActions(Table);

const initialData = [
  { id: 1, Название: "Создание пользователя", Состояние: "-", Статус: "Установлен"},
  { id: 2, Название: "Удаление пользователя", Состояние: "Удаляется", Статус: "Установлен" },
  { id: 3, Название: "Скрипт какой-то", Состояние: "Устанавливается", Статус: "Установлен" },
  { id: 4, Название: "Скрипт какой-то", Состояние: "Ошибка: описание", Статус: "Установлен" },
  { id: 5, Название: "apt_install.yml", Состояние: "-", Статус: "Установлен" },
  { id: 6, Название: "Скрипт какой-то", Состояние: "-", Статус: "Установлен" },
  { id: 7, Название: "Скрипт какой-то", Состояние: "-", Статус: "Установлен" },
  { id: 8, Название: "Скрипт какой-то", Состояние: "Ошибка: описание", Статус: "Установлен" },
  { id: 9, Название: "Скрипт какой-то", Состояние: "Ошибка: описание", Статус: "Установлен" },
  { id: 10, Название: "Скрипт какой-то", Состояние: "Ошибка: описание", Статус: "Установлен" },
];

const columns = [{ id: "id" }, { id: "Название" }, { id: "Состояние" }, { id: "Статус" }];

function ScriptsTable() {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState([1]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleInstall = async (item) => {
    // 1. Отмечаем, что начинается процесс установки
    const newData = data.map((row) =>
      row.id === item.id ? { ...row, Состояние: "Устанавливается" } : row
    );
    setData(newData);
  
    try {
      // 2. Выполняем запрос к эндпоинту /run_playbook
      const response = await fetch(
        `http://127.0.0.1:8000/run_playbook?template_name=${encodeURIComponent(item.Название)}`,
        { method: "GET" }
      );
  
      if (!response.ok) {
        // Если сервер вернул ошибку, парсим текст ошибки
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка запуска плейбука");
      }
  
      const result = await response.json();
      console.log("Плейбук запущен:", result);
  
      // 3. Обновляем состояние строки как успешно установленное
      const updatedData = data.map((row) =>
        row.id === item.id ? { ...row, Состояние: "-", Статус: "Установлен" } : row
      );
      setData(updatedData);
  
      toaster.add({
        name: item.Название,
        title: item.Название,
        content: "Скрипт успешно установлен на ВМ",
        theme: "success",
        autoHiding: 5000,
      });
    } catch (error) {
      console.error("Ошибка при установке плейбука:", error);
  
      // 4. При ошибке отображаем её в таблице
      const updatedData = data.map((row) =>
        row.id === item.id ? { ...row, Состояние: `Ошибка: ${error.message}`, Статус: "Установлен" } : row
      );
      setData(updatedData);
  
      toaster.add({
        name: item.Название,
        title: item.Название,
        content: `Ошибка установки: ${error.message}`,
        theme: "danger",
        autoHiding: 5000,
      });
    }
  };

  const handleDelete = (item) => {
    const newData = data.map((row) =>
      row.id === item.id ? { ...row, Статус: "Отсутствует" } : row
    );
    setData(newData);

    // Вызываем метод toaster.add(...)
    toaster.add({
      name: item.Название,
      title: item.Название,
      content: "Скрипт удален",
      theme: "danger",
      autoHiding: 5000,
    });
  };

  const getRowActions = (item) => [
    {
      text: "Установить",
      icon: <Icon data={ArrowDownToLine} size={16} />,
      handler: () => handleInstall(item),
    },
    {
      text: "Удалить",
      icon: <Icon data={TrashBin} size={16} />,
      handler: () => handleDelete(item),
      theme: "danger",
    },
  ];

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <>
      <MyTable
        data={data}
        columns={columns}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowActions={getRowActions}
        rowActionsSize="l"
        onRowClick={handleRowClick}
      />

      <ScriptInfo
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        script={selectedItem}
      />
    </>
  );
}

export default ScriptsTable;
