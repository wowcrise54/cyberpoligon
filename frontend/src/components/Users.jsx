// Users.jsx
import React, { useEffect, useState } from "react";
import { Table, withTableActions, Loader, Icon, Button, Card, Text } from '@gravity-ui/uikit';
import { ArrowRight, CirclePlay } from '@gravity-ui/icons';
import './User.css';

const MyTable = withTableActions(Table);

const columns = [
  { id: "last_name",  name: "Фамилия", align: "left" },
  { id: "first_name", name: "Имя",     align: "left" },
  { id: "email",      name: "Почта",   align: "left" },
  { id: "role",       name: "Роль",    align: "left" },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token   = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // параллельно запрашиваем список пользователей и список ролей
    Promise.all([
      fetch("/api/users", { headers }).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch("/api/roles", { headers }).then(r => r.ok ? r.json() : Promise.reject(r.statusText))
    ])
      .then(([usersData, rolesData]) => {
        setUsers(usersData);
        setRoles(rolesData);
      })
      .catch(err => {
        console.error("Не удалось загрузить пользователей или роли:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const changeRole = (userId, newRole) => {
    const token   = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ role: newRole }),
    })
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        // обновляем локально роль у пользователя
        setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
      })
      .catch(err => {
        console.error("Ошибка при смене роли:", err);
        alert(`Не удалось изменить роль: ${err.message}`);
      });
  };

  const getRowActions = (row) =>
    roles.map((r) => ({
      text: r.name,
      icon: <Icon data={ArrowRight} size={16} />,
      handler: () => changeRole(row.id, r.name),
    }));

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Loader size="l" />
      </div>
    );
  }

  return (

    <Card view="outlined" type="container">
        <div className="vm-card">
            <div className="vm-title">
            <div className="vm-name">

                <Text variant="header-1">Пользователи</Text>
                <Text variant="body-2">Все пользователи, которые есть на платформе</Text>
            </div>

            <div className="vm-buttons">

            <Button view="action" size="m">
                <Icon data={CirclePlay} size={16} />
                Добавить нового пользователя
            </Button>
            </div>

            </div>

            <div className="vm-params">

                <MyTable
                columns={columns}
                data={users}
                noDataMessage="Пользователи не найдены"
                getRowActions={getRowActions}
                rowActionsSize="l"
                />
            </div>

        </div>
    </Card>
  );
}
