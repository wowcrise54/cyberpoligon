import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { Button, TextInput, Text, Link, Loader } from '@gravity-ui/uikit';

const Auth = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Обработчик авторизации без использования формы
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toaster.add({
        title: "Ошибка",
        content: "Пожалуйста, заполните все поля",
        theme: "danger",
        autoHiding: 5000,
      });
      return;
    }

    setIsLoading(true);
    console.log("handleAuth triggered:", { email, password });
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        sessionStorage.setItem("token", data.access_token);
        navigate("/User");
      } else {
        toaster.add({
          title: "Ошибка",
          content: data.detail || "Ошибка авторизации",
          theme: "danger",
          autoHiding: 5000,
        });
      }
    } catch (err) {
      console.error("Ошибка при запросе на /login:", err);
      toaster.add({
        title: "Ошибка",
        content: "Ошибка соединения с сервером",
        theme: "danger",
        autoHiding: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="input-box">
        <TextInput
          type="email"
          placeholder="Email"
          size="xl"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-box" style={{ marginTop: "10px" }}>
        <TextInput
          type="password"
          placeholder="Пароль"
          size="xl"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Link view="normal" href="#">
          <Text variant="body-1">Забыли пароль?</Text>
        </Link>
      </div>
      <div style={{ marginTop: "20px" }}>
        <Button
          onClick={handleAuth}
          view="action"
          size="l"
          width="max"
          disabled={isLoading}
        >
          {isLoading
            ? <Loader size="s" />
            : <Text variant="body-2">Войти</Text>
          }
        </Button>
      </div>
    </div>
  );
};

export default Auth;