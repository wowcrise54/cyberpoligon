import React, {useEffect, useState} from "react";
import { Icon, Table, withTableActions, Spin, Text } from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine, PencilToSquare } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";

const MyTable = withTableActions(Table);

export default function AllScripts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetch("/api/scripts")
      .then(res => res.json())
      .then(scripts =>
        setData(scripts.map(s => ({
          id: s.id,
          Название: s.name,
          Описание: s.description || "—",
          Путь: s.path,
        })))
      )
      .catch(e => toaster.add({ title: "Ошибка", content: e.message, theme: "danger" }))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот скрипт?")) {
      return;
    }
    try {
      const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || res.statusText);
      }
      // обновляем локальный стэйт
      setData(prev => prev.filter(item => item.id !== id));
      toaster.add({ title: "Готово", content: "Скрипт удалён", theme: "success" });
    } catch (e) {
      toaster.add({ title: "Ошибка", content: e.message, theme: "danger" });
    }
  };

  if (loading) return <Spin size="l" />;

  const getRowActions = item => [
    {
      text: "Изменить",
      icon: <Icon data={PencilToSquare} size={16} />,
      handler: () => { /* TODO: редактирование */ },
    },
    {
      text: "Удалить",
      icon: <Icon data={TrashBin} size={16} />,
      theme: "danger",
      handler: () => handleDelete(item.id),
    },
  ];

  return (
    <div className="create">
      <Text variant="display-1">Скрипты</Text>
      <div className="mgt">
        <MyTable
          data={data}
          columns={[
            { id: "id", title: "#", align: "center" },
            { id: "Название", title: "Название", align: "center" },
            { id: "Описание", title: "Описание", align: "center" },
            { id: "Путь", title: "Путь", align: "center" },
          ]}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          getRowActions={getRowActions}
          rowActionsSize="l"
          onRowClick={item => { setCurrent(item); setModalOpen(true); }}
        />
        <ScriptInfo open={modalOpen} onClose={() => setModalOpen(false)} script={current} />
      </div>
    </div>
  );
}
