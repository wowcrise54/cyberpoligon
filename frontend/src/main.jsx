import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/styles.css';
import './styles.css';
import App from './App';

const Main = () => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} toggleTheme={toggleTheme} />
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
