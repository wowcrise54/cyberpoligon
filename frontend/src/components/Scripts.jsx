// Scripts.jsx
import React, { useState, useEffect } from "react";
import { Icon, Table, withTableActions, Spin } from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";

const MyTable = withTableActions(Table);

const columns = [
  { id: "id",         title: "#",               align: "center" },
  { id: "Название",   title: "Название скрипта" },
  { id: "Тег",        title: "Тег" },
  { id: "Приложение", title: "Приложение" },
  { id: "Состояние",  title: "Состояние" },
  { id: "Статус",     title: "Статус" },
];

export default function ScriptsTable({ osType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Фетчим список скриптов и фильтруем по текущему osType
  useEffect(() => {
    // Словарь 'тег' → список подстрок, которые могут встречаться в osType
    const tagToOs = {
      deb:     ["debian", "ubuntu", "kali", "astra"],
      rpm:     ["centos", "redhat", "oracle"],
      dnf:     ["fedora"],
      windows: ["windows"],
    };

    // Проверяет, подходит ли скрипт с данным тегом для текущей ОС
    const isAllowed = (tag) => {
      const targets = tagToOs[tag] || [];
      const os = osType?.toLowerCase() || "";
      return targets.some((substr) => os.includes(substr));
    };

    setLoading(true);
    fetch("/api/scripts")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((scripts) => {
        // Фильтруем только те скрипты, у которых тег соответствует текущей osType
        const filtered = scripts.filter((s) => isAllowed(s.tag));
        setData(
          filtered.map((s) => ({
            id:         s.id,
            Название:   s.name,
            Тег:        s.tag    || "—",
            Приложение: s.app    || "—",
            Состояние:  "-",
            Статус:     "Не установлен",
          }))
        );
      })
      .catch((e) => {
        toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [osType]);

  // Запуск скрипта: POST + poll
  const handleInstall = async (item) => {
    setData((prev) =>
      prev.map((r) =>
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
          if (status === "success") {
            clearInterval(timer);
            setData((prev) =>
              prev.map((r) =>
                r.id === item.id
                  ? { ...r, Состояние: output, Статус: "Установлен" }
                  : r
              )
            );
          } else if (status === "running") {
            // продолжаем ждать
          } else {
            clearInterval(timer);
            setData((prev) =>
              prev.map((r) =>
                r.id === item.id
                  ? {
                      ...r,
                      Состояние: `Ошибка: ${output}`,
                      Статус: "Не установлен",
                    }
                  : r
              )
            );
            toaster.add({
              title: item.Название,
              content: `Ошибка установки: ${output}`,
              theme: "danger",
            });
          }
        } catch (e) {
          clearInterval(timer);
          setData((prev) =>
            prev.map((r) =>
              r.id === item.id
                ? {
                    ...r,
                    Состояние: `Ошибка: ${e.message}`,
                    Статус: "Не установлен",
                  }
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
      setData((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? {
                ...r,
                Состояние: `Ошибка: ${error.message}`,
                Статус: "Не установлен",
              }
            : r
        )
      );
    }
  };

  const handleRowClick = (id) => {
    const item = data.find((r) => r.id === id);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const getRowActions = (row) => [
    {
      id: "run",
      title: "Запустить",
      icon: ArrowDownToLine,
      handler: () => handleInstall(row),
    },
    {
      id: "delete",
      title: "Удалить",
      icon: TrashBin,
      handler: () => {
        setData((prev) => prev.filter((r) => r.id !== row.id));
      },
    },
  ];

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
