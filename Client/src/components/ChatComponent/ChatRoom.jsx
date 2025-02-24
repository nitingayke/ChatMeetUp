import React, { useContext, useEffect, useState } from 'react';
import ChatHeader from './ChatHeader.jsx';
import ChatFooter from './ChatFooter.jsx';
import { ChatMain } from './ChatMain.jsx';
import { Link, useParams } from 'react-router-dom';
import { getChatData } from "../../services/chatService.js";
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import ChatContext from '../../context/ChatContext.js';
import UserContext from '../../context/UserContext.js';

export default function ChatRoom() {

    const [isLoading, setIsLoading] = useState(false);
    const [isWaitingForLogin, setIsWaitingForLogin] = useState(true);
    const [remoteUser, setRemoteUser] = useState(null);

    const { enqueueSnackbar } = useSnackbar();
    const { userChat, setUserChat } = useContext(ChatContext);
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

                if (response.userChat?.user1 && response.userChat?.user2) {
                    setRemoteUser(
                        response.userChat.user1?._id === loginUser?._id
                            ? response.userChat?.user2
                            : response.userChat?.user1
                    );
                }

            } else {
                setUserChat(null);
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
            <div className="h-full flex justify-center items-center p-3">
                <CircularProgress sx={{ color: "white" }} />
                <p className="text-gray-300 ml-3">Checking login status...</p>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="flex justify-center h-full items-center p-3">
                <h1 className="text-3xl font-bold text-gray-300 rounded bg-[#000000ab]">Please Select Chat</h1>
            </div>
        );
    }

    if (!userChat) {
        return (
            <div className='h-full flex justify-center text-center items-center p-3'>
                <h1 className='text-3xl text-red-500 p-3 rounded bg-[#000000ab]'>UserChat not found, please try again!</h1>
            </div>
        )
    }

    if (loginUser?.blockUser.includes(id)) {
        return <div className='h-full flex justify-center items-center px-4'>
            <div className='w-fit p-3 rounded bg-[#000000ab] text-center'>
                <Avatar alt={remoteUser?.username || userChat?.name} src={remoteUser?.image || userChat?.image} sx={{ width: 80, height: 80 }} className='mx-auto my-2' />
                <h1 className="text-red-400 mt-3 text-lg">
                    This user has been blocked by you.
                </h1>
                <p className="text-gray-300 text-xl mt-1" style={{ fontWeight: 800 }}>@ {remoteUser?.username || userChat?.name}</p>

                <Link
                    to="/u/block-users"
                    className="mt-3 inline-block bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded-md transition duration-200"
                >
                    View Blocked Users
                </Link>
            </div>
        </div>
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

            <footer className='bg-[#000000d1] p-3 space-x-3 w-full'>
                <ChatFooter />
            </footer>
        </>
    );
}
