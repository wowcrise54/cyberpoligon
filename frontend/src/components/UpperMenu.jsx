import React from 'react';
import ProfileBtn from './ProfileBtn';
import ThemeSwitcher from './ThemeSwitcher';
import './UpperMenu.css';
import { Icon, Text } from '@gravity-ui/uikit';
import { BurgerIcon, BellIcon } from './Icons';

const UpperMenu = ({ toggleSidebar, burgerRef, toggleTheme, theme }) => {
    return (
        <header className="header">
            <div className="logotype">
                <div className="logo-menu">
                    <div className="toggle-btn" ref={burgerRef} onClick={toggleSidebar}>
                        <Icon data={BurgerIcon} size={20} />
                    </div>
                </div>
                <Text variant="header-2">Киберполигон</Text>
            </div>

            <nav className="navbar">
                <Icon data={BellIcon} size={20} />
                <ProfileBtn />
                <ThemeSwitcher className="theme" theme={theme} toggleTheme={toggleTheme} />
            </nav>
        </header>
    );
};

export default UpperMenu;
