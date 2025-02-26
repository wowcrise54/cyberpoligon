import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import './Sign.css';
import { Button, RadioButton, TextInput, Text, Link } from '@gravity-ui/uikit';

const Sign_in = () => {
  const [selectedOption, setSelectedOption] = useState("1"); // По умолчанию выбрана опция "Вход"
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/User');
  };

  const handleRegistration = () => {
    navigate('/Auth');
  };

  useEffect(() => {
    document.title = "Киберполигон";
  }, []);

  return (
    <div className="wrapper">
      <form action="">
        <RadioButton width="max" size="xl" onChange={e => setSelectedOption(e.target.value)}>
          <RadioButton.Option value="1" content={<Text variant="subheader-3">Вход</Text>} />
          <RadioButton.Option value="2" content={<Text variant="subheader-3">Регистрация</Text>} />
        </RadioButton>
        
        {/* Используем key, чтобы заставить React пересоздавать форму при изменении selectedOption */}
        <div key={selectedOption}>
          {selectedOption === "1" ? (
            <div className="login">
              <div className="input-box">
                <TextInput 
                  type="text" 
                  placeholder="Имя пользователя" 
                  size="xl" 
                  required 
                />
              </div>
              <div className="input-box">
                <TextInput 
                  type="password" 
                  placeholder="Пароль" 
                  size="xl" 
                  required 
                />
                <Link view="normal" href="#"><Text variant="body-1">Забыли пароль?</Text></Link>
              </div>
              <Button view="action" size="l" type="submit" width="max" onClick={handleSignIn}>
                <Text variant="body-2">Войти</Text>
              </Button>
            </div>
          ) : (
            <div className="reg">
              <div className="input-box">
                <TextInput 
                  type="text" 
                  placeholder="Имя" 
                  size="xl" 
                  required 
                />
              </div>
              <div className="input-box">
                <TextInput 
                  type="text" 
                  placeholder="Фамилия" 
                  size="xl" 
                  required 
                />
              </div>
              <div className="input-box">
                <TextInput 
                  type="email" 
                  placeholder="Электронная почта" 
                  size="xl" 
                  required 
                />
              </div>
              <div className="input-box">
                <TextInput 
                  type="password" 
                  placeholder="Пароль" 
                  size="xl" 
                  required 
                />
              </div>
              <Button view="action" size="l" type="submit" width="max" onClick={handleRegistration}>
                <Text variant="body-2">Зарегистрироваться</Text>
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Sign_in;
