import React, { useState } from 'react';

import ChatContext from './ChatContext';

const ChatContextProvider = ({ children }) => {

    const [userChat, setUserChat] = useState(null);
    const [messageSearchQuery, setMessageSearchQuery] = useState("");
    const [inputComponent, setInputComponent] = useState("");
    const [pollOptions, setPollOptions] = useState([]);
    const [inputFile, setInputFile] = useState(null);


    return (
        <ChatContext.Provider value={
            {
                userChat,
                setUserChat,
                messageSearchQuery,
                setMessageSearchQuery,
                inputComponent,
                setInputComponent,
                pollOptions,
                setPollOptions,
                inputFile,
                setInputFile
            }
        } >
            {children}
        </ChatContext.Provider>
    )
}

export default ChatContextProvider;