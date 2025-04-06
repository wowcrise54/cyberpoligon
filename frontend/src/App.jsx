import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Публичные компоненты
import Sign_in from "./components/Sign_in";

// Защищённые компоненты (лейаут)
import User from "./components/User";

// Вложенные маршруты внутри защищённой части
import Home from "./components/Home";
import Create from "./components/Create";
import Settings from "./components/Settings";
import VmSettings from "./components/VMSettings";

const App = ({ theme, toggleTheme }) => {
  return (
    <Router>
      <Routes>
        {/* Публичный маршрут: авторизация */}
        <Route path="/auth" element={<Sign_in />} />

        {/* Защищённый лейаут, где всегда показываются верхнее и левое меню */}
        <Route path="/User/*" element={<User theme={theme} toggleTheme={toggleTheme} />}>
          {/* Вложенные маршруты внутри User */}
          <Route index element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="settings" element={<Settings />} />
          <Route path="vm-settings/:vmId" element={<VmSettings />} />
        </Route>

        {/* Если маршрут не найден – перенаправляем на авторизацию */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
