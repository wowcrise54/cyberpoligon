// src/components/StorageListener.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export function StorageListener() {
  const navigate = useNavigate();
  const removalTimeout = useRef(null);

  useEffect(() => {
    // 1) Слушаем storage — для других вкладок
    function handleStorage(e) {
      if (e.key === "token" && e.newValue === null) {
        window.location.href = "/auth";
      }
    }

    // 2) Слушаем видимость окна — вместо focus
    function handleVisibility() {
      // реагируем только когда вкладка становится видимой
      if (document.visibilityState === "visible" && !sessionStorage.getItem("token")) {
        window.location.href = "/auth";
      }
    }

    // 3) Логика автоматического удаления токена
    function scheduleTokenRemoval(token) {
      let exp;
      try {
        ({ exp } = jwtDecode(token));
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        redirectToAuth();
        return;
      }

      const nowSec = Date.now() / 1000;
      const msUntilExpiry = (exp - nowSec) * 1000;

      if (msUntilExpiry <= 0) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        redirectToAuth();
      } else {
        removalTimeout.current = setTimeout(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          redirectToAuth();
        }, msUntilExpiry);
      }
    }

    function redirectToAuth() {
      window.location.href = "/auth";
    }

    // Инициализация: если токен есть — планируем удаление
    const currentToken = sessionStorage.getItem("token");
    if (currentToken) {
      scheduleTokenRemoval(currentToken);
    }

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (removalTimeout.current) {
        clearTimeout(removalTimeout.current);
      }
    };
  }, [navigate]);

  return null;
}