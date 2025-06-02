// ProfilePage.jsx
import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  Button,
  User,
  Loader,
} from '@gravity-ui/uikit';
import './User.css';

export default function ProfilePage() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    document.title = "Мой профиль";
    const token   = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    fetch("/api/me", { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(profile => {
        setMe(profile);
      })
      .catch(err => console.error("Не удалось загрузить профиль:", err));
  }, []);

  if (!me) {
    return (
      <div className="loader">
        <Loader size="l" />
      </div>
    );
  }

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

      </div>
    </div>
  );
}
