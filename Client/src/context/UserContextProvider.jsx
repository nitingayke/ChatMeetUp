import React, { useMemo, useState } from 'react';

import UserContext from './UserContext';

const UserContextProvider = ({ children }) => {

    const [loginUser, setLoginUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const contextValue = useMemo(() => ({
        loginUser,
        setLoginUser,
        onlineUsers,
        setOnlineUsers
    }), [
        loginUser,
        setLoginUser,
        onlineUsers,
        setOnlineUsers
    ]);

    return (
        <UserContext.Provider value={contextValue} >
            {children}
        </UserContext.Provider>
    )
}

export default UserContextProvider;