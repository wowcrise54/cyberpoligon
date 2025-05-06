import React, {useEffect} from "react";
import {Text, TextInput, Button, User, Icon} from '@gravity-ui/uikit';
import { HomeIcon, AddIcon, SettingsIcon, ExitIcon } from "./Icons";
import './User.css';

const ProfilePage = () => {

    useEffect(() => {
        document.title = "Мой профиль";
    }, []);

    return (
        <div className="profile1">

            <Text variant="display-1">Мой профиль</Text>
            <div className="profile">
            
                <div className="temple">
                    <Text variant="header-1">Мои данные</Text>
                    <div className="user-card">
                        <User avatar={{text: 'Евгений Люленов', theme: 'brand'}} 
                            name="Евгений Люленов" 
                            description="elyulenov@yandex.ru" 
                            size="xl" />
                    </div>

                    <div className="group">
                        <div className="option-profile">
                            <Text variant="body-2" style={{ width: "200px" }}>Имя</Text>
                            <TextInput
                                size="l"
                                style={{ width: "200px" }}
                                placeholder="Ваше имя"
                                defaultValue="Евгений"
                            />
                        </div>

                        <div className="option-profile">
                            <Text variant="body-2" style={{ width: "200px" }}>Фамилия</Text>
                            <TextInput
                                size="l"
                                style={{ width: "200px" }}
                                placeholder="Ваша фамилия"
                                defaultValue="Люленов"
                            />
                        </div>
                    </div>
                    

                    <Button
                        view="action"
                        size="l"
                        style={{ marginTop: "25px" }}
                    >
                        <Text variant="body-2">Сохранить</Text>
                    </Button>
                </div>

                <div className="temple">
                    <Text variant="header-1">Важные данные</Text>

                    <div className="group">
                        <div className="option-profile">
                            <Text variant="body-2" style={{ width: "200px" }}>Почта</Text>
                            <TextInput
                                size="l"
                                style={{ width: "200px" }}
                                type="email"
                                placeholder="Ваш email"
                                defaultValue="elyulenov@yandex.ru"
                                disabled={true}
                            />
                        </div>

                        <div className="option-profile">
                            <Text variant="body-2" style={{ width: "200px" }}>Телефон</Text>
                            <TextInput
                                size="l"
                                style={{ width: "200px" }}
                                type="tel"
                                placeholder="Ваш номер телефона"
                                defaultValue="+7 999 888 77 66"
                                disabled={true}
                            />
                        </div> 

                    </div>

                    <div className="group">
                        <div className="option-profile">
                            <Text variant="body-2">Пароль</Text>
                            <TextInput
                                size="l"
                                style={{ width: "200px" }}
                                type="password"
                                defaultValue="123123"
                                disabled={true}
                            />
                        </div>

                        <div className="option-profile">
                            <Text variant="body-2">Роль</Text>
                            <TextInput
                                size="l"
                                style={{ width: "200px" }}
                                placeholder="Ваша роль"
                                defaultValue="Администратор"
                                disabled={true}
                            />
                        </div>
                    </div>   

                    <Button
                        view="action"
                        size="l"
                        style={{ marginTop: "25px" }}
                    >
                        <Text variant="body-2">Изменить</Text>
                    </Button>
                </div>
                
            </div>
        </div>
        
    )
}

export default ProfilePage;