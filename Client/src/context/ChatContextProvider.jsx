import React, { useState } from 'react';

import ChatContext from './ChatContext';

const ChatContextProvider = ({ children }) => {

    const [userChat, setUserChat] = useState(null);
    

    return (
        <ChatContext.Provider value={{ userChat, setUserChat }} >
            { children }
        </ChatContext.Provider>
    )
}

export default ChatContextProvider;