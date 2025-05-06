import React, { useState, useEffect } from "react";
import { RadioButton, Text } from '@gravity-ui/uikit';
import Auth from "./Auth";
import Registration from "./Registration";
import '../styles.css';
import './Sign.css';

const Sign_in = () => {
  const [selectedOption, setSelectedOption] = useState("1");

  useEffect(() => {
    document.title = "Киберполигон";
  }, []);

  return (
    <div className="wrapper">
      <form>
        <RadioButton width="max" size="xl" onChange={e => setSelectedOption(e.target.value)}>
          <RadioButton.Option value="1" content={<Text variant="subheader-3">Вход</Text>} />
          <RadioButton.Option value="2" content={<Text variant="subheader-3">Регистрация</Text>} />
        </RadioButton>
        {/* Используем key, чтобы React пересоздавал форму при переключении */}
        <div key={selectedOption}>
          {selectedOption === "1" ? <Auth /> : <Registration />}
        </div>
      </form>
    </div>
  );
};

export default Sign_in;