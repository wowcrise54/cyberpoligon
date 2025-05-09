// ProfilePage.jsx
import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  Button,
  User,
  Table,
  withTableActions,
} from '@gravity-ui/uikit';
import './User.css';

const MyTable = withTableActions(Table);

const columns = [
  { id: "last_name",  title: "Фамилия", align: "left" },
  { id: "first_name", title: "Имя",     align: "left" },
  { id: "email",      title: "Почта",   align: "left" },
  { id: "role",       title: "Роль",    align: "left" },
];

export default function ProfilePage() {
  const [me, setMe]       = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    document.title = "Мой профиль";
    const token   = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // теперь: чистый запрос в БД
    fetch("/api/me", { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(profile => {
        setMe(profile);

        // только если admin — подгружаем таблицу
        if (profile.role === "admin") {
          fetch("/api/users", { headers })
            .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
            .then(data => setUsers(data))
            .catch(console.error);

          fetch("/api/roles", { headers })
            .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
            .then(data => setRoles(data))
            .catch(console.error);
        }
      })
      .catch(err => console.error("Не удалось загрузить профиль:", err));
  }, []);

  if (!me) {
    return <Text>Загрузка...</Text>;
  }

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
        setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
      })
      .catch(err => {
        console.error("Ошибка при смене роли:", err);
        alert(`Не удалось изменить роль: ${err.message}`);
      });
  };

  const getRowActions = row =>
    roles.map(r => ({ text: `→ ${r.name}`, handler: () => changeRole(row.id, r.name) }));

  return (
    <div className="profile1">
      <Text variant="display-1">Мой профиль</Text>
      <div className="profile">

        {/* ——— Левый блок */}
        <div className="temple">
          <Text variant="header-1">Мои данные</Text>
          <div className="user-card">
            <User
              avatar={{ text: `${me.first_name} ${me.last_name}`, theme: 'brand' }}
              name={`${me.first_name} ${me.last_name}`}
              description={me.email}
              size="xl"
            />
          </div>
          <div className="group">
            <div className="option-profile">
              <Text variant="body-2">Имя</Text>
              <TextInput size="l" defaultValue={me.first_name} placeholder="Ваше имя" />
            </div>
            <div className="option-profile">
              <Text variant="body-2">Фамилия</Text>
              <TextInput size="l" defaultValue={me.last_name} placeholder="Ваша фамилия" />
            </div>
          </div>
          <Button view="action" size="l" style={{ marginTop: 20 }}>
            <Text variant="body-2">Сохранить</Text>
          </Button>
        </div>

        {/* ——— Правый блок */}
        <div className="temple">
          <Text variant="header-1">Важные данные</Text>
          <div className="group">
            <div className="option-profile">
              <Text variant="body-2">Почта</Text>
              <TextInput size="l" type="email"    value={me.email} disabled />
            </div>
            <div className="option-profile">
              <Text variant="body-2">Телефон</Text>
              <TextInput size="l" type="tel"      defaultValue="+7 999 888 77 66" disabled />
            </div>
          </div>
          <div className="group">
            <div className="option-profile">
              <Text variant="body-2">Пароль</Text>
              <TextInput size="l" type="password" defaultValue="••••••••" disabled />
            </div>
            <div className="option-profile">
              <Text variant="body-2">Роль</Text>
              <TextInput size="l" value={me.role} disabled />
            </div>
          </div>
          <Button view="action" size="l" style={{ marginTop: 20 }}>
            <Text variant="body-2">Изменить</Text>
          </Button>
        </div>

        {/* ——— Таблица только для админов */}
        {me.role === "admin" && (
          <div className="temple" style={{ width: '100%', marginTop: 30 }}>
            <Text variant="header-1">Все пользователи</Text>
            <MyTable
              columns={columns}
              data={users}
              noDataMessage="Пользователи не найдены"
              getRowActions={getRowActions}
              rowActionsSize="m"
            />
          </div>
        )}

      </div>
    </div>
  );
}