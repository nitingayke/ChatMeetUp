import React, { useState } from 'react';

import UserContext from './UserContext';

const UserContextProvider = ({ children }) => {

    const [loginUser, setLoginUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    return (
        <UserContext.Provider value={{loginUser, setLoginUser, onlineUsers, setOnlineUsers}} >
            { children }
        </UserContext.Provider>
    )
}

export default UserContextProvider;