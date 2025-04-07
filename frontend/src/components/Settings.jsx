import React, {useEffect} from "react";
import {Text} from '@gravity-ui/uikit';
import './User.css';

const Settings = () => {

    useEffect(() => {
        document.title = "Настройки";
    }, []);

    return (
        <div className="create">
            <Text variant="display-1">Тут будут настройки</Text>
        </div>
    )
}

export default Settings;
