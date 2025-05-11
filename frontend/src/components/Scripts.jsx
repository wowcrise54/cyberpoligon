// ScriptsTable.jsx
import React, { useState, useEffect } from "react";
import {
  Icon,
  Table,
  withTableActions,
  Spin,
} from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";
import InstallModal from "./InstallModal";

const MyTable = withTableActions(Table);

// Универсальная функция для приведения output к строке
function formatOutput(output) {
  if (typeof output === 'string') return output;
  if (Array.isArray(output))          return output.join('\n');
  if (output && typeof output === 'object') {
    try { return JSON.stringify(output, null, 2); }
    catch { return String(output); }
  }
  return String(output);
}

export default function ScriptsTable({osType}) {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Для информации
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);

  // Для установки
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installTarget, setInstallTarget] = useState(null);
  const [installParams, setInstallParams] = useState({ username: "" });

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

  // Загрузка и фильтрация скриптов
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
        toaster.add({
          title: "Ошибка загрузки скриптов",
          content: e.message,
          theme: "danger",
        });
      })
      .finally(() => setLoading(false));
      .finally(() => setLoading(false));
  }, [osType]);

  // Открыть форму установки
  const openInstallModal = (item) => {
    setInstallTarget(item);
    setInstallParams({ username: "" });
    setIsInstallModalOpen(true);
  };

  // Логика установки с polling
  const handleInstall = async (item, params) => {
    setIsInstallModalOpen(false);

    // Показать спиннер в таблице
    setData((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, Состояние: <Spin size="xs" /> } : r
      )
    );


    try {
      const body = { template_name: item.Название, ...params };
      const createRes = await fetch("/api/run_playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${createRes.status}`);
      }
      const {task_id} = await createRes.json();
      toaster.add({
        title:   item['Название'],
        content: `Задача ${task_id} запущена`,
        theme:   'success',
      });

      const timer = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/run_playbook/status?task_id=${task_id}`
          );
          if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
          const { status, output } = await statusRes.json();

          if (status === "running" || status === "pending") {
            return;
          }

          clearInterval(timer);

          if (status === "success") {
            setData((prev) =>
              prev.map((r) =>
                r.id === item.id
                  ? { ...r, Состояние: output || "-", Статус: "Установлен" }
                  : r
              )
            );
            toaster.add({
              title: item.Название,
              content: "Скрипт успешно установлен",
              theme: "success",
            });
          } else {
            const errMsg = output?.error || output;
            setData((prev) =>
              prev.map((r) =>
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
        } catch (pollErr) {
          clearInterval(timer);
          setData(prev =>
            prev.map(r =>
              r.id === item.id
                ? {
                    ...r,
                    Состояние: `Ошибка polling: ${e.message}`,
                    Статус: "Не установлен",
                  }
                : r
            )
          );
          toaster.add({
            title:   item['Название'],
            content: `Polling error: ${pollErr.message}`,
            theme:   'danger',
          });
        }
      }, 3000);
    } catch (runErr) {
      setData(prev =>
        prev.map(r =>
          r.id === item.id
            ? {
                ...r,
                Состояние: `Ошибка запуска: ${error.message}`,
                Статус: "Не установлен",
              }
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

  // Удалить (пометить отсутствующим)
  const handleDelete = (item) => {
    setData((prev) =>
      prev.map((r) =>
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

  // Показать инфо-модалку
  const handleRowClick = (item) => {
    setSelectedScript(item._raw || item);
    setIsInfoModalOpen(true);
  };

  // Действия для каждой строки
  const getRowActions = (item) => [
    {
      text: "Установить",
      icon: <Icon data={ArrowDownToLine} size={16} />,
      handler: () => openInstallModal(item),
    },
    {
      text: "Удалить",
      icon: <Icon data={TrashBin} size={16} />,
      handler: () => handleDelete(item),
      theme: "danger",
    },
  ];

  if (loading) {
    return <Spin size="l"/>;
  }

  // финальный набор колонок
  const columns = [
    { id: 'id',          title: '#',                align: 'center' },
    { id: 'Название',    title: 'Название скрипта' },
    { id: 'Тег',         title: 'Тег' },
    { id: 'Приложение',  title: 'Приложение' },
    {
      id:       'Состояние',
      title:    'Состояние',
      align:    'center',
      // здесь именно (row), а не ({row})
      template: (row) =>
        row.isLoading
          ? <Spin size="xs" view="normal"/>
          : row['Состояние'],
    },
    { id: 'Статус',      title: 'Статус' },
  ];

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

      {/* Модалка с описанием */}
      <ScriptInfo
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        script={selectedScript}
      />

      {/* Модалка параметров установки */}
      <InstallModal
        open={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        script={installTarget}
        params={installParams}
        onParamsChange={setInstallParams}
        onSubmit={() => handleInstall(installTarget, installParams)}
      />
    </>
  );
}
