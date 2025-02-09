import React, { useContext, useEffect, useState } from 'react';
import ChatHeader from './ChatHeader.jsx';
import ChatFooter from './ChatFooter.jsx';
import { ChatMain } from './ChatMain.jsx';
import { useParams } from 'react-router-dom';
import { getChatData } from "../../services/chatService.js";

import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import ChatContext from '../../context/ChatContext.js';
import UserContext from '../../context/UserContext.js';

export default function ChatRoom() {

    const [isLoading, setIsLoading] = useState(false);
    const [isWaitingForLogin, setIsWaitingForLogin] = useState(true);

    const { enqueueSnackbar } = useSnackbar();
    const { setUserChat } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const { id } = useParams();


    useEffect(() => {
        if (loginUser) {
            setIsWaitingForLogin(false);
        } else {
            const timeout = setTimeout(() => setIsWaitingForLogin(false), 5000); // Wait for 5 seconds
            return () => clearTimeout(timeout);
        }
    }, [loginUser]);

    const getCurrentChatData = async () => {
        
        if (!id || isWaitingForLogin || !loginUser) 
            return;

        setIsLoading(true);
        try {
            const response = await getChatData(id);

            if (response.success) {
                setUserChat(response.userChat);
            } else {
                enqueueSnackbar(response.message || "Something went wrong, please try again.", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "Something went wrong.", { variant: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCurrentChatData();
    }, [id, loginUser, isWaitingForLogin]);

    if (isWaitingForLogin) {
        return (
            <div className="h-full flex justify-center items-center">
                <CircularProgress sx={{ color: "white" }} />
                <p className="text-gray-300 ml-3">Checking login status...</p>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="flex justify-center h-full">
                <h1 className="text-3xl font-bold text-gray-300 mt-30">Please Select Chat</h1>
            </div>
        );
    }

    return (
        <>
            <header className='py-2 px-3 bg-[#000000d1] flex justify-between items-center w-full'>
                <ChatHeader />
            </header>

            <main className='flex-1 h-full overflow-hidden relative'>
                {isLoading ? (
                    <div className='h-full flex justify-center items-center'>
                        <CircularProgress sx={{ color: "white" }} />
                    </div>
                ) : (
                    <ChatMain />
                )}
            </main>

            <footer className='bg-[#000000d1] p-3 space-x-3 flex w-full'>
                <ChatFooter />
            </footer>
        </>
    );
}
