import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, Text, Link } from '@gravity-ui/uikit';

const Auth = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  // Обработчик авторизации без использования формы
  const handleAuth = async () => {

    if (!email.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

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
        localStorage.setItem("token", data.access_token);
        navigate("/User");
      } else {
        setError(data.detail || "Ошибка авторизации");
      }
    } catch (err) {
      console.error("Ошибка при запросе на /login:", err);
      setError("Ошибка соединения с сервером");
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
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      <div style={{ marginTop: "20px" }}>
        {/* Привязываем обработчик клика напрямую */}
        <Button onClick={handleAuth} view="action" size="l" width="max">
          <Text variant="body-2">Войти</Text>
        </Button>
      </div>
    </div>
  );
};

export default Auth;