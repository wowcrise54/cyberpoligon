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
  { id: 5, Название: "Скрипт какой-то", Состояние: "-", Статус: "Установлен" },
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

  const handleInstall = (item) => {
    const newData = data.map((row) =>
      row.id === item.id ? { ...row, Статус: "Установлен" } : row
    );
    setData(newData);

    toaster.add({
      name: item.Название,
      title: item.Название,
      content: "Скрипт установлен",
      theme: "success",
      autoHiding: 5000,
      
    });
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
