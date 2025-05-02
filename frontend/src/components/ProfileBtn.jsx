import React from "react";
import { UserLabel } from "@gravity-ui/uikit";

export default function ProfileBtn() {
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
        onClick={() => alert("В разработке...")}
        type="person"
        size="m"
      >
        {label}
      </UserLabel>
    </div>
  );
}
