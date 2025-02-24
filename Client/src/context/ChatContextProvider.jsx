import React, { useMemo, useState } from 'react';

import ChatContext from './ChatContext';

const ChatContextProvider = ({ children }) => {

    const [userChat, setUserChat] = useState(null);
    const [messageSearchQuery, setMessageSearchQuery] = useState("");
    const [inputComponent, setInputComponent] = useState("");
    const [pollOptions, setPollOptions] = useState([]);
    const [inputFile, setInputFile] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const contextValue = useMemo(() => ({
        userChat,
        setUserChat,
        messageSearchQuery,
        setMessageSearchQuery,
        inputComponent,
        setInputComponent,
        pollOptions,
        setPollOptions,
        inputFile,
        setInputFile,
        selectedUser, 
        setSelectedUser,
        isDialogOpen, 
        setIsDialogOpen
    }), [
        userChat,
        messageSearchQuery,
        inputComponent,
        pollOptions,
        inputFile,
        selectedUser,
        isDialogOpen
    ]);

    return (
        <ChatContext.Provider value={contextValue} >
            {children}
        </ChatContext.Provider>
    )
}

export default ChatContextProvider;