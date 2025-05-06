import React, { useState, useEffect } from "react";
import { Icon, Table, withTableActions, Spin } from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";

const MyTable = withTableActions(Table);

const initialData = [
  { id: 1, Название: "Создание пользователя", Состояние: "-", Статус: "Не установлен" },
  { id: 2, Название: "Удаление пользователя", Состояние: "-", Статус: "Не установлен" },
  { id: 3, Название: "apt_install.yml", Состояние: "-", Статус: "Не установлен" },
];

const columns = [
  { id: "id", title: "#", align: "center"},
  { id: "Название", title: "Название скрипта", align: "center" },
  { id: "Состояние", title: "Состояние", align: "center" },
  { id: "Статус", title: "Статус", align: "center" },
];

function ScriptsTable() {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleInstall = async (item) => {
    // 1) Отмечаем "Устанавливается"
    setData((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, Состояние: <Spin size="xs"/> } : r
      )
    );

    try {
      // 2) Создаём задачу
      const createRes = await fetch("http://192.168.220.197:8000/run_playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_name: item.Название }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.detail || `HTTP ${createRes.status}`);
      }
      const { task_id } = await createRes.json();

      // 3) Polling статуса
      const pollInterval = 3000;
      const timer = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `http://192.168.220.197:8000/run_playbook/status?task_id=${task_id}`
          );
          if (!statusRes.ok) {
            const err = await statusRes.json();
            throw new Error(err.detail || `HTTP ${statusRes.status}`);
          }
          const { status, output } = await statusRes.json();
          if (status === "pending" || status === "running") {
            return; // ждём дальше
          }

          clearInterval(timer);

          if (status === "success") {
            setData((prev) =>
              prev.map((r) =>
                r.id === item.id
                  ? { ...r, Состояние: "-", Статус: "Установлен" }
                  : r
              )
            );
            toaster.add({
              name: item.Название,
              title: item.Название,
              content: "Скрипт успешно установлен",
              theme: "success",
              autoHiding: 5000,
            });
          } else {
            const errMsg = output?.error || JSON.stringify(output);
            setData((prev) =>
              prev.map((r) =>
                r.id === item.id
                  ? { ...r, Состояние: `Ошибка: ${errMsg}`, Статус: "Не установлен" }
                  : r
              )
            );
            toaster.add({
              name: item.Название,
              title: item.Название,
              content: `Ошибка установки: ${errMsg}`,
              theme: "danger",
              autoHiding: 5000,
            });
          }
        } catch (e) {
          clearInterval(timer);
          setData((prev) =>
            prev.map((r) =>
              r.id === item.id
                ? { ...r, Состояние: `Ошибка: ${e.message}`, Статус: "Не установлен" }
                : r
            )
          );
          toaster.add({
            name: item.Название,
            title: item.Название,
            content: `Ошибка polling: ${e.message}`,
            theme: "danger",
            autoHiding: 5000,
          });
        }
      }, pollInterval);
    } catch (error) {
      console.error("Init error:", error);
      setData((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? { ...r, Состояние: `Ошибка: ${error.message}`, Статус: "Не установлен" }
            : r
        )
      );
      toaster.add({
        name: item.Название,
        title: item.Название,
        content: `Ошибка запуска: ${error.message}`,
        theme: "danger",
        autoHiding: 5000,
      });
    }
  };

  const handleDelete = (item) => {
    setData((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, Состояние: "-", Статус: "Отсутствует" } : r
      )
    );
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