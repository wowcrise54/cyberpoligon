import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, Text } from '@gravity-ui/uikit';

const Registration = () => {
  const navigate = useNavigate();

  const handleRegistration = (e) => {
    e.preventDefault();
    // Добавьте логику регистрации, например, отправку данных на сервер
    navigate('/Sign_in');
  };

  return (
    <div className="reg">
      <div className="input-box">
        <TextInput type="text" placeholder="Имя" size="xl" required />
      </div>
      <div className="input-box">
        <TextInput type="text" placeholder="Фамилия" size="xl" required />
      </div>
      <div className="input-box">
        <TextInput type="email" placeholder="Электронная почта" size="xl" required />
      </div>
      <div className="input-box">
        <TextInput type="password" placeholder="Пароль" size="xl" required />
      </div>
      <Button view="action" size="l" type="submit" width="max" onClick={handleRegistration}>
        <Text variant="body-2">Зарегистрироваться</Text>
      </Button>
    </div>
  );
};

export default Registration;
