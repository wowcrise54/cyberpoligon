// ProfileBtn.jsx
import React from 'react';
import { UserLabel } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router-dom';  // <-- импортируем

export default function ProfileBtn() {
  const navigate = useNavigate();              // <-- создаём навигатор

  // 1) Получаем строку из sessionStorage
  const userJson = sessionStorage.getItem("user");

  // 2) Парсим только если не null
  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      console.error("Ошибка парсинга user из sessionStorage:", e);
    }
  }

  // 3) Собираем отображаемую строку
  const label = user
    ? `${user.first_name} ${user.last_name}`
    : "Гость";

  return (
    <div>
      <UserLabel
        onClick={() => navigate('/User/me')}  // <-- вызываем
        type="person"
        size="m"
      >
        {label}
      </UserLabel>
    </div>
  );
}
