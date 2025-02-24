import React, { useMemo, useState } from 'react';

import UserContext from './UserContext';

const UserContextProvider = ({ children }) => {

    const [loginUser, setLoginUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [liveUserData, setLiveUserData] = useState([]);

    const contextValue = useMemo(() => ({
        loginUser,
        setLoginUser,
        onlineUsers,
        setOnlineUsers,
        liveUserData, 
        setLiveUserData
    }), [
        loginUser,
        onlineUsers,
        liveUserData
    ]);

    return (
        <UserContext.Provider value={contextValue} >
            {children}
        </UserContext.Provider>
    )
}

export default UserContextProvider;