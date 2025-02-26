import React from "react";
import {UserLabel} from '@gravity-ui/uikit';


const ProfileBtn = () => {
    return (
      <div>
        <UserLabel onClick={() => alert('В разработке...')} type="person" size="m">Люленов Евгений</UserLabel>
      </div>
    );
};

export default ProfileBtn;