import React, { useState, useEffect, useRef } from "react";
import './User.css';
import UpperMenu from "./UpperMenu";
import LeftMenu from "./LeftMenu";

// Импортируем компоненты для рендеринга
import Home from "./Home";
import Create from "./Create";
import Settings from "./Settings";

const User = ({ theme, toggleTheme }) => {
    const [isActive, setIsActive] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState("home"); // Текущий компонент

    const sidebarRef = useRef(null);
    const burgerRef = useRef(null);

    const toggleSidebar = (event) => {
        event.stopPropagation();
        setIsActive((prevState) => !prevState);
        setIsCollapsed((prevState) => !prevState);
    };

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
            {/* Верхнее меню */}
            <UpperMenu burgerRef={burgerRef} toggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />

            {/* Левое меню */}
            <LeftMenu
                sidebarRef={sidebarRef}
                isActive={isActive}
                isCollapsed={isCollapsed}
                selectedComponent={selectedComponent}
                onMenuClick={setSelectedComponent} // Обновляем текущий компонент
            />

            {/* Основная область рендеринга */}
            <div className="content">
                {selectedComponent === "home" && <Home />}
                {selectedComponent === "create" && <Create />}
                {selectedComponent === "settings" && <Settings />}
            </div>
        </>
    );
};

export default User;
