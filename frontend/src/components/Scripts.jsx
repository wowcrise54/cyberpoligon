import React, { useState, useEffect } from "react";
import { Icon, Table, withTableActions, Spin } from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";

const MyTable = withTableActions(Table);

const columns = [
  { id: "id",           title: "#",               align: "center" },
  { id: "Название",     title: "Название скрипта" },
  { id: "Тег",          title: "Тег" },
  { id: "Приложение",   title: "Приложение" },
  { id: "Состояние",    title: "Состояние" },
  { id: "Статус",       title: "Статус" },
];

export default function ScriptsTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 1) Фетчим список скриптов
  useEffect(() => {
    fetch("/api/scripts")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(scripts => {
        setData(
          scripts.map(s => ({
            id: s.id,
            Название:    s.name,
            Тег:         s.tag    || "—",
            Приложение:  s.app    || "—",
            Состояние:   "-",
            Статус:      "Не установлен",
          }))
        );
      })
      .catch(e => {
        toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 2) Установка скрипта (пост и polling)
  const handleInstall = async (item) => {
    // ставим спиннер
    setData(prev =>
      prev.map(r =>
        r.id === item.id ? { ...r, Состояние: <Spin size="xs" /> } : r
      )
    );

    try {
      const createRes = await fetch("/api/run_playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_name: item.Название }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.detail || `HTTP ${createRes.status}`);
      }
      const { task_id } = await createRes.json();

      const timer = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/run_playbook/status?task_id=${task_id}`
          );
          if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
          const { status, output } = await statusRes.json();

          if (status === "pending" || status === "running") return;

          clearInterval(timer);

          if (status === "success") {
            setData(prev =>
              prev.map(r =>
                r.id === item.id
                  ? { ...r, Состояние: "-", Статус: "Установлен" }
                  : r
              )
            );
            toaster.add({
              title: item.Название,
              content: "Скрипт успешно установлен",
              theme: "success",
            });
          } else {
            const errMsg = output?.error || JSON.stringify(output);
            setData(prev =>
              prev.map(r =>
                r.id === item.id
                  ? { ...r, Состояние: `Ошибка: ${errMsg}`, Статус: "Не установлен" }
                  : r
              )
            );
            toaster.add({
              title: item.Название,
              content: `Ошибка установки: ${errMsg}`,
              theme: "danger",
            });
          }
        } catch (e) {
          clearInterval(timer);
          setData(prev =>
            prev.map(r =>
              r.id === item.id
                ? { ...r, Состояние: `Ошибка: ${e.message}`, Статус: "Не установлен" }
                : r
            )
          );
          toaster.add({
            title: item.Название,
            content: `Ошибка polling: ${e.message}`,
            theme: "danger",
          });
        }
      }, 3000);
    } catch (error) {
      setData(prev =>
        prev.map(r =>
          r.id === item.id
            ? { ...r, Состояние: `Ошибка: ${error.message}`, Статус: "Не установлен" }
            : r
        )
      );
      toaster.add({
        title: item.Название,
        content: `Ошибка запуска: ${error.message}`,
        theme: "danger",
      });
    }
  };

  // 3) «Удаление» скрипта (помечаем статусом)
  const handleDelete = (item) => {
    setData(prev =>
      prev.map(r =>
        r.id === item.id
          ? { ...r, Состояние: "-", Статус: "Отсутствует" }
          : r
      )
    );
    toaster.add({
      title: item.Название,
      content: "Скрипт удалён",
      theme: "danger",
    });
  };

  const getRowActions = item => [
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

  const handleRowClick = item => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (loading) {
    return <Spin size="l" />;
  }

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
