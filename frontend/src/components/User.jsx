import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import './User.css';
import UpperMenu from "./UpperMenu";
import LeftMenu from "./LeftMenu";

const User = ({ theme, toggleTheme }) => {
  const [isActive, setIsActive] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const burgerRef = useRef(null);

  // Функция переключения состояния бокового меню
  const toggleSidebar = (event) => {
    event.stopPropagation();
    setIsActive(prev => !prev);
    setIsCollapsed(prev => !prev);
  };

  // Закрытие бокового меню при клике вне его на маленьких экранах
  const handleClickOutside = (event) => {
    if (
      window.innerWidth <= 768 &&
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      burgerRef.current &&
      !burgerRef.current.contains(event.target)
    ) {
      setIsActive(false);
      setIsCollapsed(false);
    }
  };

  useEffect(() => {
    document.title = "Главная";
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Верхнее меню с кнопкой сворачивания */}
      <UpperMenu
        burgerRef={burgerRef}
        toggleSidebar={toggleSidebar}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Левое меню, которое зависит от состояния isActive и isCollapsed */}
      <LeftMenu
        isActive={isActive}
        isCollapsed={isCollapsed}
        sidebarRef={sidebarRef}
      />

      {/* Центральная область для динамического контента */}
      <div className="content">
        <Outlet />
      </div>
    </>
  );
};

export default User;
