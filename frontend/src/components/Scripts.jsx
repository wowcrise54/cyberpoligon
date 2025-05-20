// ScriptsTable.jsx
import React, { useState, useEffect } from "react";
import { Icon, Table, withTableActions, Spin } from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";
import DynamicModal from "./DynamicModal";

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

  // Модалка информации
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);

  // Динамическая модалка для установки
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installModalVars, setInstallModalVars] = useState([]);
  const [installModalParams, setInstallModalParams] = useState({});
  const [scriptForInstall, setScriptForInstall] = useState(null);

  // Карта тегов → ОС
  const tagToOs = {
    deb:     ["debian", "ubuntu", "kali", "astra"],
    rpm:     ["centos", "redhat", "oracle"],
    dnf:     ["fedora"],
    windows: ["windows"],
  };
  const isAllowed = (tag) => {
    if (!osType) return true;
    return (tagToOs[tag] || []).some((substr) =>
      osType.toLowerCase().includes(substr)
    );
  };

  // Загрузка списка скриптов
  useEffect(() => {
    setLoading(true);
    fetch("/api/scripts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((scripts) => {
        const filtered = scripts.filter((s) => isAllowed(s.tag));
        setData(
          filtered.map((s) => ({
            id:         s.id,
            Название:   s.name,
            Тег:        s.tag    || "—",
            Приложение: s.app    || "—",
            Состояние:  "-",
            Статус:     "Не установлен",
            _raw:       s,
          }))
        );
      })
      .catch((e) => {
        toaster.add({ title: "Ошибка загрузки скриптов", content: e.message, theme: "danger" });
      })
      .finally(() => setLoading(false));
  }, [osType]);

  // Открыть инфо-модалку
  const handleRowClick = (item) => {
    setSelectedScript(item._raw || item);
    setIsInfoModalOpen(true);
  };

  // Удаление скрипта
  const handleDelete = (item) => {
    setData((prev) =>
      prev.map((r) =>
        r.id === item.id
          ? { ...r, Состояние: "-", Статус: "Отсутствует" }
          : r
      )
    );
    toaster.add({ title: item.Название, content: "Скрипт удалён", theme: "danger" });
  };

  // Запуск: получить переменные и открыть динамическую модалку
  const handleRunClick = async (item) => {
    setScriptForInstall(item);
    try {
      const scriptId = item._raw?.id || item.id;
      const res = await fetch(`/api/scripts/${scriptId}/survey_vars`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const defs = await res.json();
      setInstallModalVars(defs);

      // Инициализация параметров
      const init = {};
      defs.forEach((v) => {
        init[v.name] = v.values && v.values.length > 0 ? v.values[0] : "";
      });
      setInstallModalParams(init);
      setIsInstallModalOpen(true);
    } catch (e) {
      toaster.add({ title: "Ошибка параметров", content: e.message, theme: "danger" });
    }
  };

  // Отправка и polling статуса
  const handleModalSubmit = async () => {
    setIsInstallModalOpen(false);
    const item = scriptForInstall;
    // Показать спиннер в таблице
    setData((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, Состояние: <Spin size="xs" view="normal" /> } : r
      )
    );
    try {
      const body = { template_name: item.Название, variables: installModalParams };
      const createRes = await fetch("/api/run_playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${createRes.status}`);
      }
      const { task_id } = await createRes.json();
      toaster.add({ title: item.Название, content: `Задача ${task_id} запущена`, theme: "success" });

      const timer = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/run_playbook/status?task_id=${task_id}`
          );
          if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
          const { status, output } = await statusRes.json();
          if (["running", "pending", "waiting"].includes(status)) return;
          clearInterval(timer);
          if (status === "success") {
            setData((prev) =>
              prev.map((r) =>
                r.id === item.id
                  ? { ...r, Состояние: output || "-", Статус: "Установлен" }
                  : r
              )
            );
            toaster.add({ title: item.Название, content: "Скрипт успешно установлен", theme: "success" });
          } else if (status === "failure" || status === "error") {
            const errMsg = output?.error || output;
            setData((prev) =>
              prev.map((r) =>
                r.id === item.id
                  ? { ...r, Состояние: `Ошибка: ${errMsg}`, Статус: "Не установлен" }
                  : r
              )
            );
            toaster.add({ title: item.Название, content: `Ошибка установки: ${errMsg}`, theme: "danger" });
          }
        } catch (e) {
          clearInterval(timer);
          setData((prev) =>
            prev.map((r) =>
              r.id === item.id
                ? { ...r, Состояние: `Ошибка polling: ${e.message}`, Статус: "Не установлен" }
                : r
            )
          );
          toaster.add({ title: item.Название, content: `Ошибка polling: ${e.message}`, theme: "danger" });
        }
      }, 3000);
    } catch (error) {
      setData((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? { ...r, Состояние: `Ошибка запуска: ${error.message}`, Статус: "Не установлен" }
            : r
        )
      );
      toaster.add({ title: item.Название, content: `Ошибка запуска: ${error.message}`, theme: "danger" });
    }
  };

  const getRowActions = (item) => [
    {
      text: "Установить",
      icon: <Icon data={ArrowDownToLine} size={16} />,
      handler: () => handleRunClick(item),
    },
    {
      text: "Удалить",
      icon: <Icon data={TrashBin} size={16} />,
      handler: () => handleDelete(item),
      theme: "danger",
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
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        script={selectedScript}
      />

      <DynamicModal
        open={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        vars={installModalVars}
        params={installModalParams}
        onChange={setInstallModalParams}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}
