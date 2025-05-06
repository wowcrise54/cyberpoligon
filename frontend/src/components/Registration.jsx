import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "@gravity-ui/uikit/toaster-singleton";
import { Button, TextInput, Text, Loader } from '@gravity-ui/uikit';

const Registration = () => {
  const navigate = useNavigate();
  
  // Состояния для хранения введенных значений
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      toaster.add({
        title: "Ошибка",
        content: "Пожалуйста, заполните все поля",
        theme: "danger",
        autoHiding: 5000,
      });
      return;
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
    };

    setIsLoading(true);
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
        toaster.add({
          title: "Ошибка",
          content: result.detail || "Ошибка регистрации",
          theme: "danger",
          autoHiding: 5000,
        });
      }
    } catch (err) {
      console.error("Ошибка при запросе:", err);
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
      <Button
        view="action"
        size="l"
        type="submit"
        width="max"
        onClick={handleRegistration}
        disabled={isLoading}
      >
        {isLoading
          ? <Loader size="s" />
          : <Text variant="body-2">Зарегистрироваться</Text>
        }
      </Button>
    </div>
  );
};

export default Registration;
