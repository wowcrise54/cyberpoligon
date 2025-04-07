import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, Text, Link } from '@gravity-ui/uikit';

const Auth = () => {
  const navigate = useNavigate();

  const handleAuth = (e) => {
    e.preventDefault();
    // Добавьте логику авторизации, например, проверку введенных данных
    navigate('/User');
  };

  return (
    <div className="login">
      <div className="input-box">
        <TextInput type="text" placeholder="Имя пользователя" size="xl" required />
      </div>
      <div className="input-box">
        <TextInput type="password" placeholder="Пароль" size="xl" required />
        <Link view="normal" href="#">
          <Text variant="body-1">Забыли пароль?</Text>
        </Link>
      </div>
      <Button view="action" size="l" type="submit" width="max" onClick={handleAuth}>
        <Text variant="body-2">Войти</Text>
      </Button>
    </div>
  );
};

export default Auth;
