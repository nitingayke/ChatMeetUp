import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import ChatHeader from './ChatHeader.jsx';
import ChatFooter from './ChatFooter.jsx';
import { ChatMain } from './ChatMain.jsx';
import { getChatData } from "../../services/chatService.js";
import ChatContext from '../../context/ChatContext.js';
import UserContext from '../../context/UserContext.js';
import { socket } from '../../services/socketService.js';
import LoaderContext from '../../context/LoaderContext.js';

export default function ChatRoom() {

    const { id } = useParams();

    const { enqueueSnackbar } = useSnackbar();
    const { userChat, setUserChat, joinedUsers, setJoinedUsers } = useContext(ChatContext);
    const { setIsMessageProcessing } = useContext(LoaderContext);
    const { loginUser } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
    const [remoteUser, setRemoteUser] = useState(null);

    const handleNewChatMessage = useCallback(({ recipientId, data }) => {

        if (userChat?._id !== recipientId) return;

        setUserChat(prev => ({
            ...prev,
            messages: [...prev.messages, data]
        }));

        if (loginUser?._id === data?.sender?._id) {
            setIsMessageProcessing(false);
        }
    }, [userChat, loginUser, setIsMessageProcessing]);

    const handlePollVoteSuccess = useCallback(({ conversationId, userId, chatId, pollIdx }) => {
        if (userChat._id !== conversationId) return;

        setUserChat(prevUserChat => {
            if (prevUserChat._id !== conversationId) return prevUserChat;

            const updatedMessages = prevUserChat.messages.map(msg => {
                if (msg._id === chatId) {
                    const updatedPoll = msg.poll.map((option, index) =>
                        index === pollIdx && !option.votes.includes(userId)
                            ? { ...option, votes: [...option.votes, userId] }
                            : option
                    );
                    return { ...msg, poll: updatedPoll };
                }
                return msg;
            });

            return { ...prevUserChat, messages: updatedMessages };
        });

        if (loginUser?._id === userId) {
            setIsMessageProcessing(false);
        }
    }, [userChat, loginUser, setIsMessageProcessing]);

    const updateMessageReaction = (msg, userId, emoji) => {

        const updatedReactions = msg.reactions ? [...msg.reactions] : [];
        const existingReactionIndex = updatedReactions.findIndex((r) => r.user === userId);

        if (existingReactionIndex !== -1) {
            updatedReactions[existingReactionIndex].emoji = emoji;
        } else {
            updatedReactions.push({ user: userId, emoji });
        }

        return { ...msg, reactions: updatedReactions };
    };

    const handleChatReaction = useCallback(({ chatId, userId, emoji, recipientId }) => {
        if (userChat._id !== recipientId) return;

        setUserChat(prevUserChat => {
            if (prevUserChat._id !== recipientId) return prevUserChat;

            const updatedMessages = prevUserChat.messages.map(msg =>
                msg._id === chatId ? updateMessageReaction(msg, userId, emoji) : msg
            );

            return { ...prevUserChat, messages: updatedMessages };
        });

        enqueueSnackbar(
            loginUser._id === userId ? "You reacted to a message!" : "A user added a reaction.",
            { variant: "success" }
        );
    }, [userChat, loginUser, enqueueSnackbar]);

    const handleUserChatDelete = useCallback(({ chatId, conversationId, userId }) => {

        if (userChat?._id !== conversationId) return;

        setUserChat(prev => ({
            ...prev,
            messages: prev?.messages?.filter(chat => chat?._id !== chatId) || []
        }));

        if (loginUser?._id === userId) {
            setIsMessageProcessing(false);
        }

    }, [userChat, loginUser, setIsMessageProcessing]);

    const handleNewChatMessageRef = useRef(handleNewChatMessage);
    const handlePollVoteSuccessRef = useRef(handlePollVoteSuccess);
    const handleChatReactionRef = useRef(handleChatReaction);
    const handleUserChatDeleteRef = useRef(handleUserChatDelete);

    useEffect(() => {
        handleNewChatMessageRef.current = handleNewChatMessage;
        handlePollVoteSuccessRef.current = handlePollVoteSuccess;
        handleChatReactionRef.current = handleChatReaction;
        handleUserChatDeleteRef.current = handleUserChatDelete;
    }, [handleNewChatMessage, handlePollVoteSuccess, handleChatReaction, handleUserChatDelete]);

    useEffect(() => {
        const messageListener = (data) => handleNewChatMessageRef.current(data);
        const pollVoteListener = (data) => handlePollVoteSuccessRef.current(data);
        const reactionListener = (data) => handleChatReactionRef.current(data);
        const chatDeleteListener = (data) => handleUserChatDeleteRef.current(data);


        if (!socket.hasListeners("add-chat-message-success")) {
            socket.on("add-chat-message-success", messageListener);
        }

        if (!socket.hasListeners("poll-vote-success")) {
            socket.on("poll-vote-success", pollVoteListener);
        }

        if (!socket.hasListeners("chat-reaction-success")) {
            socket.on("chat-reaction-success", reactionListener);
        }

        if (!socket.hasListeners("chat-message-deleted-success")) {
            socket.on("chat-message-deleted-success", chatDeleteListener);
        }

        return () => {
            socket.off("add-chat-message-success", messageListener);
            socket.off("poll-vote-success", pollVoteListener);
            socket.off("chat-reaction-success", reactionListener);
            socket.off("chat-message-deleted-success", chatDeleteListener);
        };
    }, []);

    const getCurrentChatData = async () => {

        if (!id || !loginUser)
            return;

        setIsLoading(true);
        try {
            const response = await getChatData(id);

            if (response.success) {
                let userIds = [];

                if (response.userChat?.members) {
                    userIds = response.userChat.members.map(member => member.user._id.toString());

                } else if (response.userChat?.user1 && response.userChat?.user2) {
                    userIds = [response.userChat.user1._id.toString(), response.userChat.user2._id.toString()];

                    setRemoteUser(
                        response.userChat.user1?._id === loginUser?._id
                            ? response.userChat?.user2
                            : response.userChat?.user1
                    );
                }

                setJoinedUsers(userIds);
                setUserChat(response.userChat);

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
        if (!id || !loginUser) return;

        getCurrentChatData();
    }, [id, loginUser]);

    if (!localStorage.getItem('authToken')) {
        return (
            <div className="h-full flex justify-center items-center p-3">
                <div className='bg-[#000000ab] p-2 rounded'>
                    <p className="text-gray-300 ml-3">User not logged in. Please login.</p>
                    <div className='flex justify-center space-x-2 text-blue-300'>
                        <Link to={'/login'} className='hover:text-blue-600'>Login</Link>
                        <span className='text-gray-300'>/</span>
                        <Link to={'/register'} className='hover:text-blue-600'>Register</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="flex justify-center h-full items-center p-3">
                <h1 className="text-xl text-center font-bold text-gray-300 rounded bg-[#000000ab] p-2">Please Select Chat</h1>
            </div>
        );
    }

    if (!userChat) {
        return (
            <div className='h-full flex justify-center text-center items-center p-3'>
                <h1 className='text-xl text-red-500 p-3 rounded bg-[#000000ab]'>UserChat not found, please try again!</h1>
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

    if (!joinedUsers.includes(loginUser?._id)) {
        return (
            <div className='h-full flex justify-center text-center items-center p-3'>
                <div className='p-3 rounded bg-[#000000ab] space-y-1'>
                    <h1 className='text-xl'>You have not joined this {remoteUser ? 'user chat' : 'group'}</h1>
                    <Link to={'/u/join-requests'} className='text-blue-500 hover:text-blue-700'>
                        Click to join
                    </Link>
                </div>
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

            <footer className='bg-[#000000d1] p-3 space-x-3 w-full'>
                <ChatFooter />
            </footer>
        </>
    );
}
