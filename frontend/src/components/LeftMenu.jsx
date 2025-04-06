import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Icon, Text, Tooltip } from '@gravity-ui/uikit';
import { HomeIcon, AddIcon, SettingsIcon, ExitIcon } from "./Icons";
import '../styles.css';
import './LeftMenu.css';

const LeftMenu = ({ isActive, isCollapsed, sidebarRef }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/Sign_in");
  };

  return (
    <nav
      ref={sidebarRef}
      className={`sidebar ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
    >
      <ul className="list">
        <li className="list-item">
          <Tooltip content="Главная" placement="right" disabled={!isCollapsed} openDelay={300}>
            <NavLink
              to="/User"
              end
              className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
            >
              <Button view="flat" width="max" className="button" size="l">
                <Icon data={HomeIcon} size={20} />
                {!isCollapsed && <Text variant="body-2">Главная</Text>}
              </Button>
            </NavLink>
          </Tooltip>
        </li>
        <li className="list-item">
          <Tooltip content="Создать ВМ" placement="right" disabled={!isCollapsed} openDelay={300}>
            <NavLink
              to="/User/create"
              className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
            >
              <Button view="flat" width="max" className="button" size="l">
                <Icon data={AddIcon} size={20} />
                {!isCollapsed && <Text variant="body-2">Создать ВМ</Text>}
              </Button>
            </NavLink>
          </Tooltip>
        </li>
        <li className="list-item">
          <Tooltip content="Настройки" placement="right" disabled={!isCollapsed} openDelay={300}>
            <NavLink
              to="/User/settings"
              className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
            >
              <Button view="flat" width="max" className="button" size="l">
                <Icon data={SettingsIcon} size={20} />
                {!isCollapsed && <Text variant="body-2">Настройки</Text>}
              </Button>
            </NavLink>
          </Tooltip>
        </li>
        <li className="list-item">
          <Tooltip content="Выход" placement="right" disabled={!isCollapsed} openDelay={300}>
            <NavLink
              to="/Sign_in"
              className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
              onClick={handleLogout}
            >
              <Button view="flat" width="max" className="button" size="l">
                <Icon data={ExitIcon} size={20} />
                {!isCollapsed && <Text variant="body-2">Выход</Text>}
              </Button>
            </NavLink>
          </Tooltip>
        </li>
      </ul>
    </nav>
  );
};

export default LeftMenu;
