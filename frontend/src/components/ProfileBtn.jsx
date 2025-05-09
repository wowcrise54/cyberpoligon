// ProfileBtn.jsx
import React, { useState, useEffect } from 'react';
import { UserLabel } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router-dom';

export default function ProfileBtn() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(profile => setUser(profile))
      .catch(err => {
        console.error("Не удалось загрузить профиль:", err);
        // при ошибке можно, например, сбросить токен
        // sessionStorage.removeItem("token");
      });
  }, []);

  const label = user
    ? `${user.first_name} ${user.last_name}`
    : "Гость";

  return (
    <div>
      <UserLabel
        onClick={() => navigate('/User/me')}
        type="person"
        size="m"
      >
        {label}
      </UserLabel>
    </div>
  );
}