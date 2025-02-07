import React, { useState } from 'react';

import UserContext from './UserContext';

const UserContextProvider = ({ children }) => {

    const [loginUser, setLoginUser] = useState(null);
    return (
        <UserContext.Provider value={{loginUser, setLoginUser}} >
            { children }
        </UserContext.Provider>
    )
}

export default UserContextProvider;