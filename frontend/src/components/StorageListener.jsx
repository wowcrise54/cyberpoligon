// src/components/StorageListener.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function StorageListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Слушаем storage — для других вкладок
    function handleStorage(e) {
      if (e.key === "token" && e.newValue === null) {
        window.location.href = "/auth";
      }
    }

    // 2) Слушаем фокус окна — для самого окна
    function handleFocus() {
      if (!sessionStorage.getItem("token")) {
        navigate("/auth", { replace: true });
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [navigate]);

  return null;
}
