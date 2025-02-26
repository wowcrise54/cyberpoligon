import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Text, Tooltip } from '@gravity-ui/uikit';
import { HomeIcon, AddIcon, SettingsIcon, ExitIcon } from "./Icons";
import '../styles.css';
import './LeftMenu.css';

const LeftMenu = ({ isActive, isCollapsed, sidebarRef, selectedComponent, onMenuClick }) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        onMenuClick("exit");
        navigate("/Sign_in");
    };

    return (
        <nav
            ref={sidebarRef}
            className={`sidebar ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        >
            <ul className="list">
                <li className="list-item">
                    <Tooltip content="Главная" placement={"right"} disabled={!isCollapsed} openDelay={300}>
                    <Button
                        view="flat"
                        width="max"
                        className="button"
                        size="l"
                        selected={selectedComponent === "home"}
                        onClick={() => onMenuClick("home")}
                    >
                        <Icon data={HomeIcon} size={20} />
                        {!isCollapsed && <Text variant="body-2">Главная</Text>}
                    </Button>
                    </Tooltip>
                    
                </li>
                <li className="list-item">
                    <Tooltip content="Создать ВМ" placement={"right"} disabled={!isCollapsed} openDelay={300}>
                    <Button
                        view="flat"
                        width="max"
                        className="button"
                        size="l"
                        selected={selectedComponent === "create"}
                        onClick={() => onMenuClick("create")}
                    >
                        <Icon data={AddIcon} size={20} />
                        {!isCollapsed && <Text variant="body-2">Создать ВМ</Text>}
                    </Button>
                    </Tooltip>
                </li>
                <li className="list-item">
                    <Tooltip content="Настройки" placement={"right"} disabled={!isCollapsed} openDelay={300}>
                    <Button
                        view="flat"
                        width="max"
                        className="button"
                        size="l"
                        selected={selectedComponent === "settings"}
                        onClick={() => onMenuClick("settings")}
                    >
                        <Icon data={SettingsIcon} size={20} />
                        {!isCollapsed && <Text variant="body-2">Настройки</Text>}
                    </Button>
                    </Tooltip>
                </li>
                <li className="list-item">
                    <Tooltip content="Выход" placement={"right"} disabled={!isCollapsed} openDelay={300}>
                    <Button
                        view="flat"
                        width="max"
                        className="button"
                        size="l"
                        selected={selectedComponent === "exit"}
                        onClick={handleLogout}
                    >
                        <Icon data={ExitIcon} size={20} />
                        {!isCollapsed && <Text variant="body-2">Выход</Text>}
                    </Button>
                    </Tooltip>
                </li>
            </ul>
        </nav>
    );
};

export default LeftMenu;
