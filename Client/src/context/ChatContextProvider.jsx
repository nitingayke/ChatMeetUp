import React, { useState } from 'react';

import ChatContext from './ChatContext';

const ChatContextProvider = ({ children }) => {

    const [userChat, setUserChat] = useState(null);
    const [messageSearchQuery, setMessageSearchQuery] = useState("");
    

    return (
        <ChatContext.Provider value={{ userChat, setUserChat, messageSearchQuery, setMessageSearchQuery }} >
            { children }
        </ChatContext.Provider>
    )
}

export default ChatContextProvider;