import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, Text } from '@gravity-ui/uikit';

const Registration = () => {
  const navigate = useNavigate();
  
  // Состояния для хранения введенных значений
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    // Собираем данные в объект
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        navigate("/Sign_in");
      } else {
        const result = await response.json();
        setError(result.detail || "Ошибка регистрации");
      }
    } catch (error) {
      console.error("Ошибка при запросе:", error);
      setError("Ошибка соединения с сервером");
    }
  };

  return (
    <div className="reg">
      <div className="input-box">
        <TextInput
          type="text"
          placeholder="Имя"
          size="xl"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div className="input-box">
        <TextInput
          type="text"
          placeholder="Фамилия"
          size="xl"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className="input-box">
        <TextInput
          type="email"
          placeholder="Электронная почта"
          size="xl"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-box">
        <TextInput
          type="password"
          placeholder="Пароль"
          size="xl"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <Button view="action" size="l" type="submit" width="max" onClick={handleRegistration}>
        <Text variant="body-2">Зарегистрироваться</Text>
      </Button>
    </div>
  );
};

export default Registration;