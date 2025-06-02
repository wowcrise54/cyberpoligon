// AllScripts.jsx
import React, {useEffect, useState} from "react";
import { Icon, Table, withTableActions, Spin, Text, Loader, Card, Button } from "@gravity-ui/uikit";
import { NavLink } from "react-router-dom";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, PencilToSquare, CirclePlay } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";
import EditScriptModal from "./EditScriptModal";
import './User.css';

const MyTable = withTableActions(Table);

export default function AllScripts() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Для просмотра
  const [viewOpen, setViewOpen]     = useState(false);
  const [viewScript, setViewScript] = useState(null);

  // Для редактирования
  const [editOpen, setEditOpen]     = useState(false);
  const [editScript, setEditScript] = useState(null);

  // Загрузка таблицы
  useEffect(() => {
    fetch("/api/scripts")
      .then(res => res.json())
      .then(scripts =>
        setData(scripts.map(s => ({
          id: s.id,
          Название:    s.name,
          Путь:        s.path,
          Тег:         s.tag    || "—",
          Приложение:  s.app    || "—",
        })))
      )
      .catch(e => toaster.add({ title: "Ошибка", content: e.message, theme: "danger" }))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    // берём объект скрипта перед удалением
    const script = data.find(item => item.id === id);

    if (!window.confirm(`Удалить скрипт "${script?.Название}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || res.statusText);
      }
      // удаляем из локального списка
      setData(d => d.filter(item => item.id !== id));

      // показываем тост с настоящим названием
      toaster.add({
        title: script?.Название || `#${id}`,
        content: "Скрипт удалён",
        theme: "warning",
      });
    } catch (e) {
      toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
    }
  };

  const getRowActions = item => [
    {
      text: "Изменить",
      icon: <Icon data={PencilToSquare} size={16} />,
      handler: () => {
        setEditScript(item);
        setEditOpen(true);
      },
    },
    {
      text: "Удалить",
      icon: <Icon data={TrashBin} size={16} />,
      theme: "danger",
      handler: () => handleDelete(item.id),
    },
  ];

  if (loading) {
    return (
      <div className="loader">
        <Loader size="l" />
      </div>
    );
  }

  return (

    <Card view="outlined" type="container">
      <div className="vm-card">
          <div className="vm-title">
          <div className="vm-name">

              <Text variant="header-1">Скрипты</Text>
              <Text variant="body-2">Все доступные скрипты</Text>
          </div>

            <div className="vm-buttons">
              <NavLink to="/User/settings">
                <Button view="action" size="m">
                  <Icon data={CirclePlay} size={16} />
                  Добавить новый скрипт
                </Button>
              </NavLink>  

            </div>

          </div>

          <div className="vm-params">

            <MyTable
                data={data}
                columns={[
                  { id: "id",          title: "#" },
                  { id: "Название",    title: "Название" },
                  { id: "Путь",        title: "Путь" },
                  { id: "Тег",         title: "Тег" },
                  { id: "Приложение",  title: "Приложение" },
                ]}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                getRowActions={getRowActions}
                rowActionsSize="l"
                onRowClick={item => {
                  setViewScript(item);
                  setViewOpen(true);
                }}
            />
          </div>

        <ScriptInfo
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          script={viewScript}
        />

        {/* Модалка редактирования */}
        <EditScriptModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          script={editScript}
          onSave={(updated) => {
            setData(d => d.map(r =>
              r.id === updated.id
                ? { ...r, Описание: updated.description }
                : r
            ));
            setEditOpen(false);
          }}
        />

      </div>
    </Card>
  );
}
