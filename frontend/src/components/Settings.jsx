import React, {useEffect} from "react";
import {Text, TextInput, TextArea, Select, Button} from '@gravity-ui/uikit';
import './User.css';

const Settings = () => {

    useEffect(() => {
        document.title = "Настройки";
    }, []);

    return (
        <div className="create">
            <Text variant="display-1">Добавить скрипт</Text>

            <div className="option">
                <Text variant="body-2">Название</Text>
                <TextInput
                    size="m"
                    style={{ width: "300px" }}
                    placeholder="Название скрипта"
                />
            </div>

            <div className="option">
                <Text variant="body-2">Описание</Text>
                <TextArea
                    size="m"
                    style={{ width: "300px" }}
                    placeholder="Описание скрипта"
                />
            </div>

            <div className="option">
                <Text variant="body-2">Путь до скрипта</Text>
                <TextInput
                    size="m"
                    style={{ width: "300px" }}
                    placeholder="Вставьте путь до скрипта"
                />
            </div>

            <div className="option">
                <Text variant="body-2">Операционная система</Text>
                <Select
                    size="m"
                    placeholder="Для какой ОС данный скрипт"
                    width={300}
                >
                    <Select.Option value="Windows">Windows</Select.Option>
                    <Select.Option value="Debian">Debian</Select.Option>
                    <Select.Option value="Ubuntu">Ubuntu</Select.Option>
                    <Select.Option value="Astra">Astra</Select.Option>
                </Select>
            </div>

            <Button
                view="action"
                size="l"
                style={{ marginTop: "25px" }}
            >
                <Text variant="body-2">Добавить</Text>
            </Button>
        </div>
    )
}

export default Settings;