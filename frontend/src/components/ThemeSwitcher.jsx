import React from 'react';
import { RadioButton, Text, Icon } from '@gravity-ui/uikit';
import { MoonIcon, SunIcon } from './Icons';

const ThemeSwitcher = ({ theme, toggleTheme }) => {
  return (
    <RadioButton
      size="m"
      value={theme}
      onChange={(e) => toggleTheme()}
    >
      <RadioButton.Option 
        value="dark" 
        content={<Icon data={MoonIcon} size={18}/>} 
      />
      <RadioButton.Option 
        value="light" 
        content={<Icon data={SunIcon} size={18}/>} 
      />
    </RadioButton>
  );
};

export default ThemeSwitcher;
