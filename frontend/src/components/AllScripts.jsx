import React, { useState } from "react";
import { Icon, Table, withTableActions, Spin, Text } from "@gravity-ui/uikit";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { TrashBin, ArrowDownToLine, PencilToSquare } from "@gravity-ui/icons";
import ScriptInfo from "./ScriptInfo";

const MyTable = withTableActions(Table);

const initialData = [
  {
    id: 1,
    Название: "Создание пользователя",
    "Операционная система": "Linux",
    Путь: "/usr/local/bin/create_user.sh",
  },
  {
    id: 2,
    Название: "Удаление пользователя",
    "Операционная система": "Linux",
    Путь: "/usr/local/bin/delete_user.sh",
  },
  {
    id: 3,
    Название: "apt_install.yml",
    "Операционная система": "Linux",
    Путь: "/etc/ansible/apt_install.yml",
  },
];

const columns = [
  { id: "id", title: "#", align: "center" },
  { id: "Название", title: "Название скрипта", align: "center" },
  {
    id: "Операционная система",
    title: "Операционная система",
    align: "center",
  },
  { id: "Путь", title: "Путь", align: "center" },
];

function AllScripts() {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleInstall = async (item) => {
    // Здесь пример «Устанавливается» — при желании можно убрать,
    // т.к. колонки состояния теперь не выводятся
    setData((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, Состояние: <Spin size="xs" /> } : r
      )
    );
    // … остальная ваша логика запуска плейбука
  };

  const handleDelete = (item) => {
    // Например, просто показываем тост
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
      text: "Изменить",
      icon: <Icon data={PencilToSquare} size={16} />,
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
    <div className="create">
        <Text variant="display-1">Скрипты</Text>

        <div className="mgt">
            <MyTable
                data={data}
                columns={columns}
                selectable
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
        </div>
        
    </div>
  );
}

export default AllScripts;