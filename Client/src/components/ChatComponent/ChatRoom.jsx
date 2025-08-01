import { useCallback, useContext, useEffect, useState } from 'react';
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
import { socket } from '../../services/socketService.js';
import LoaderContext from '../../context/LoaderContext.js';

export default function ChatRoom() {

    const [isLoading, setIsLoading] = useState(false);
    const [remoteUser, setRemoteUser] = useState(null);

    const { enqueueSnackbar } = useSnackbar();
    const { userChat, setUserChat, joinedUsers, setJoinedUsers } = useContext(ChatContext);
    const { setIsMessageProcessing } = useContext(LoaderContext);
    const { loginUser } = useContext(UserContext);

    const { id } = useParams();

    const handleNewChatMessage = useCallback(({ recipientId, data }) => {

        if (userChat?._id !== recipientId) return;

        setUserChat(prev => ({
            ...prev,
            messages: [...prev.messages, data]
        }));

        if (loginUser?._id === data?.sender?._id) {
            setIsMessageProcessing(false);
        }
    }, [userChat, loginUser, setIsMessageProcessing, setUserChat]);

    const handlePollVoteSuccess = useCallback(({ conversationId, userId, chatId, pollIdx }) => {

        setUserChat(prevUserChat => {
            if (prevUserChat?._id !== conversationId) return prevUserChat;

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
    }, [loginUser, setIsMessageProcessing, setUserChat]);

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
    }, [userChat, loginUser, enqueueSnackbar, setUserChat]);

    const handleChatMessageDeleteAll = useCallback(({ chatId, conversationId, userId }) => {

        setUserChat(prevUserChat => {
            if(prevUserChat?._id !== conversationId) return prevUserChat;
            
            const updatedMessages = prevUserChat?.messages?.filter(msg => msg?._id !== chatId);

            return { ...prevUserChat, messages: updatedMessages };
        });

        if(loginUser?._id === userId) {
            setIsMessageProcessing(false);
        }
    }, [loginUser, setIsMessageProcessing, setUserChat]);

    useEffect(() => {

        if (!socket.hasListeners("add-chat-message-success")) {
            socket.on("add-chat-message-success", handleNewChatMessage);
        }

        if (!socket.hasListeners("poll-vote-success")) {
            socket.on("poll-vote-success", handlePollVoteSuccess);
        }

        if (!socket.hasListeners("chat-reaction-success")) {
            socket.on("chat-reaction-success", handleChatReaction);
        }

        if(!socket.hasListeners('chat-message-deleted-success')) {
            socket.on('chat-message-deleted-success', handleChatMessageDeleteAll);
        }

        return () => {
            if (socket.hasListeners("add-chat-message-success")) {
                socket.off("add-chat-message-success", handleNewChatMessage);
            }
            if (socket.hasListeners("poll-vote-success")) {
                socket.off("poll-vote-success", handlePollVoteSuccess);
            }
            if (socket.hasListeners("chat-reaction-success")) {
                socket.off("chat-reaction-success", handleChatReaction);
            }
            if(socket.hasListeners('chat-message-deleted-success')) {
                socket.off('chat-message-deleted-success', handleChatMessageDeleteAll);
            }
        };
    }, [handleNewChatMessage, handlePollVoteSuccess, handleChatReaction, handleChatMessageDeleteAll]);

    const getCurrentChatData = useCallback(async () => {

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
    }, [enqueueSnackbar, id, loginUser, setJoinedUsers, setUserChat]);

    useEffect(() => {
        if (userChat?._id === id) return;

        getCurrentChatData();
    }, [id, getCurrentChatData, userChat?._id]);

    if (!localStorage.getItem('authToken')) {
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
                <h1 className="text-xl text-center font-bold text-gray-300 rounded bg-[#000000ab] p-2">Please Select Chat</h1>
            </div>
        );
    }

    if (!userChat && !isLoading) {
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
