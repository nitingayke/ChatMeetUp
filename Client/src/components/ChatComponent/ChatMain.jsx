import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Avatar from '@mui/material/Avatar';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { Modal, Box, CircularProgress, Tooltip } from "@mui/material";

import ChatContext from '../../context/ChatContext.js';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';

import EmojiPicker from 'emoji-picker-react';



import { socket } from '../../services/socketService.js';
import { useSnackbar } from 'notistack';
import { deleteChatMessage } from '../../services/chatService.js';
import LoaderContext from '../../context/LoaderContext.js';
import ChatAttachment from './ChatMain/ChatAttachment.jsx';
import ChatPoll from './ChatMain/ChatPoll.jsx';


export function ChatMain() {

    const { id } = useParams();

    const { enqueueSnackbar } = useSnackbar();
    const { isMessageProcessing, setIsMessageProcessing } = useContext(LoaderContext);
    const { userChat, setUserChat, messageSearchQuery } = useContext(ChatContext);
    const { loginUser, onlineUsers } = useContext(UserContext);

    const [localChat, setLocalChat] = useState(userChat || {});
    const [openModal, setOpenModal] = useState(false);
    const [chatMessageData, setChatMessageData] = useState(null);

    useEffect(() => {
        setLocalChat(userChat);
    }, [userChat]);

    const handlePollVoteSuccess = ({ conversationId, userId, chatId, pollIdx }) => {

        if (localChat._id !== conversationId) return;

        setLocalChat(prevChat => {
            const updatedMessages = prevChat.messages.map(msg => {
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

            return { ...prevChat, messages: updatedMessages };
        });

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
    };


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

    const handleChatReaction = ({ chatId, userId, emoji, recipientId }) => {
        if (localChat._id !== recipientId) return;

        setLocalChat(prevChat => {
            const updatedMessages = prevChat.messages.map(msg =>
                msg._id === chatId ? updateMessageReaction(msg, userId, emoji) : msg
            );

            return { ...prevChat, messages: updatedMessages };
        });

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
    };

    const handleNewChatMessage = ({ recipientId, data }) => {

        if (localChat?._id !== recipientId) return;

        setLocalChat(prevChat => ({
            ...prevChat,
            messages: [...prevChat.messages, data]
        }));

        setUserChat(prev => ({
            ...prev,
            messages: [...prev.messages, data]
        }));

        if (loginUser?._id === data?.sender?._id) {
            setIsMessageProcessing(false);
        }
    };

    const handleMessageReadSuccess = ({ conversationId, chatId, userData }) => {

        if (localChat?._id !== conversationId) return;
        // here is some error. message already read but backend socket is not emiting message 
        setLocalChat(prevChat => {
            const updatedMessages = prevChat.messages.map(msg =>
                msg?._id === chatId && !msg.readBy.some(user => user._id === userData._id)
                    ? { ...msg, readBy: [...msg.readBy, userData] }
                    : msg
            );

            return { ...prevChat, messages: updatedMessages };
        });

        setUserChat(prevUserChat => {
            if (prevUserChat._id !== conversationId) return prevUserChat;

            const updatedMessages = prevUserChat.messages.map(msg =>
                msg?._id === chatId && !msg.readBy.some(user => user._id === userData._id)
                    ? { ...msg, readBy: [...msg.readBy, userData] }
                    : msg
            );

            return { ...prevUserChat, messages: updatedMessages };
        });
    };

    useEffect(() => {
        socket.on("poll-vote-success", handlePollVoteSuccess);
        socket.on("chat-reaction-success", handleChatReaction);
        socket.on("add-chat-message-success", handleNewChatMessage);
        socket.on("mark-messages-read-success", handleMessageReadSuccess);

        return () => {
            socket.off("poll-vote-success", handlePollVoteSuccess);
            socket.off("chat-reaction-success", handleChatReaction);
            socket.off("add-chat-message-success", handleNewChatMessage);
            socket.off("mark-messages-read-success", handleMessageReadSuccess);
        };
    }, []);

    const handleDeleteMessage = async (data) => {
        if (!data?._id) {
            enqueueSnackbar('Message data not found, please try again.', { variant: "error" });
            return;
        }

        try {

            setIsMessageProcessing(true);
            const response = await deleteChatMessage(data._id, loginUser._id);

            if (response.success) {
                setLocalChat(prevChat => {
                    return {
                        ...prevChat,
                        messages: prevChat.messages.map(msg =>
                            msg._id === data._id
                                ? { ...msg, deleteBy: [...msg.deleteBy, loginUser._id] }
                                : msg
                        )
                    };
                });

                enqueueSnackbar(response.message || 'Message deleted successfully for you.', { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || 'Unable to delete, try again.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'Unable to delete, try again.', { variant: 'error' });
        } finally {
            setIsMessageProcessing(false);
        }
    };

    const handleMessageReaction = async (data) => {
        setOpenModal(true);
        setChatMessageData(data);
    }

    const handleMessageEmojiReaction = async (emojiData) => {
        setOpenModal(false);

        if (!chatMessageData?._id || !loginUser?._id || !emojiData?.emoji) {
            enqueueSnackbar("Invalid data for reaction", { variant: 'error' });
            return;
        }

        socket.emit('chat-reaction', {
            recipientId: localChat._id,
            chatId: chatMessageData._id,
            userId: loginUser._id,
            emoji: emojiData.emoji,
        });
    };

    const countReactions = (reactions) => {
        return reactions.reduce((acc, reaction) => {
            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
            return acc;
        }, {});
    };

    const chatMessageRefs = useRef([]);
    const observer = useRef(null);

    const markMessageAsRead = (messageId) => {

        if (!loginUser || !localChat) return;

        const message = localChat.messages.find((msg) => msg._id === messageId);
        if (!message || message.readBy.some(user => user?._id?.toString() === loginUser._id?.toString())) return;

        socket.emit('mark-messages-read', {
            conversationId: localChat._id,
            chatId: messageId,
            userId: loginUser._id
        });
    }

    useEffect(() => {
        if (!observer.current) {
            observer.current = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const messageId = entry.target.getAttribute('data-message-id');
                        markMessageAsRead(messageId);
                    }
                });
            }, { threshold: 0.5 });
        }

        chatMessageRefs.current.forEach((el) => {
            if (el) observer.current.observe(el);
        });

        return () => {
            chatMessageRefs.current.forEach((el) => {
                if (el) observer.current.unobserve(el);
            });
        };
    }, []); // localChat.messages

    const getLastReadMessageIndex = () => {
        if (!loginUser || !localChat) return 0;

        return localChat.messages.findLastIndex(chat =>
            chat.readBy.some(userData => userData?._id?.toString() === loginUser._id?.toString())
        );
    };

    useEffect(() => {
        if (!localChat?.messages?.length) return;

        const lastReadMsgIdx = getLastReadMessageIndex();

        if (lastReadMsgIdx !== -1 && chatMessageRefs.current[lastReadMsgIdx]) {
            chatMessageRefs.current[lastReadMsgIdx].scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [localChat?.messages?.length]);

    const isMessageRead = (message) => {
        if (!message?.readBy || !localChat) return false;

        if (localChat?.user1 && localChat?.user2) {
            return message.readBy.length === 2;
        }

        if (localChat?.members) {
            return message.readBy.length === localChat.members.length;
        }

        return false;
    };

    const remainReadCount = localChat?.messages?.length - getLastReadMessageIndex() - 1;

    const cleanChat = loginUser.clearedChats.find((data) => data.chatId === id);
    const filterUserChat = localChat?.messages?.filter(chatData => {
        let isMessageVisible = true;

        if (cleanChat) {
            const messageCreatedAt = new Date(chatData.createdAt);
            const chatClearedAt = new Date(cleanChat.clearedAt);

            if (messageCreatedAt < chatClearedAt) {
                isMessageVisible = false;
            }
        }

        return isMessageVisible && chatData?.message?.toLowerCase().includes(messageSearchQuery.toLowerCase());
    });

    if (filterUserChat?.length == 0) {
        return <div className='flex justify-center items-center h-full'>
            <p className="p-3 bg-[#000000ab] w-fit rounded">No messages found</p>
        </div>
    }

    return (
        <>
            <ul className='space-y-3 h-full overflow-auto p-3'>
                {filterUserChat?.map((data, index) => (
                    (!loginUser?.clearedChats?.includes(data?._id)) &&
                    <li key={data?._id ?? 'default-id'}
                        ref={(el) => (chatMessageRefs.current[index] = el)}
                        data-message-id={data._id}
                        className={`flex ${data?.sender?.username === loginUser?.username ? 'justify-end' : ''}`}
                    >
                        <div className={`group relative flex ${data?.sender?.username === loginUser?.username ? 'flex-row-reverse' : ''}`}>

                            {(onlineUsers.includes(data?.sender?._id) && loginUser._id !== data.sender._id) ? (
                                <Tooltip title="User Online" arrow>
                                    <div className="relative h-fit cursor-pointer" style={{ position: 'sticky', top: '0' }}>
                                        <Link to={`/u/profile/${data?.sender?.username}`}>
                                            <Avatar src={data?.sender?.image ?? ''} />
                                        </Link>
                                        <span className="absolute bottom-0 right-0 flex size-3">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                            <span className="inline-flex size-3 rounded-full bg-red-700"></span>
                                        </span>
                                    </div>
                                </Tooltip>
                            ) : (
                                <div className="relative h-fit cursor-pointer" style={{ position: 'sticky', top: '0' }}>
                                    <Link to={`/u/profile/${data?.sender?.username}`}>
                                        <Avatar src={data?.sender?.image ?? ''} />
                                    </Link>
                                </div>
                            )}

                            <div className={`bg-[#000000c2] p-2 border border-gray-700 mt-4 rounded-b-lg ${loginUser?.username === data?.sender?.username ? 'rounded-s-lg me-2 ms-10' : 'rounded-e-lg me-10 ms-2'}`}>
                                {data?.deleteBy?.includes(loginUser?._id) ? (
                                    <div className='flex items-center space-x-1 text-red-300'>
                                        <DeleteOutlineIcon style={{ fontSize: '1rem', marginBottom: '0.2rem' }} />
                                        <span>Message deleted</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Message Header */}
                                        <div className="text-[0.8rem] space-x-2 flex justify-between border-b border-gray-700 pb-1 text-gray-400">
                                            <p>{data?.sender?.username ?? 'Unknown'}</p>
                                            <p className='pe-2'>{formatTime(data?.createdAt) ?? 'Just now'}</p>
                                        </div>

                                        {/* Message Content */}
                                        {data?.message && <p className='whitespace-pre-line pt-3 text-gray-200'>{data.message}</p>}

                                        {/* Attachment */}
                                        <ChatAttachment data={data} />

                                        {/* Poll Section */}
                                        <ChatPoll data={data} localChat={localChat} />

                                        {/* User Reactions */}
                                        {data?.reactions?.length > 0 && (
                                            <div className="flex space-x-2 mt-2 flex-wrap">
                                                {Object.entries(countReactions(data.reactions)).map(([emoji, count]) => (
                                                    <span key={emoji} className="px-2 py-1 bg-[#3c3c3cc2] rounded-full text-sm flex items-center mb-1">
                                                        {emoji} <span className="ml-1 text-white">{count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* User red message or not */}
                                        {loginUser?.username === data?.sender?.username && (
                                            <div className="absolute right-10 text-base/2">
                                                {isMessageRead(data) ? (
                                                    <CheckCircleOutlinedIcon className='text-white bg-green-500 rounded-full' style={{ fontSize: '0.9rem' }} />
                                                ) : (
                                                    <Brightness1Icon className='text-gray-500' style={{ fontSize: '0.9rem' }} />
                                                )}
                                            </div>
                                        )}

                                        {/* Chat Buttons */}
                                        <div className={`md:opacity-0 group-hover:opacity-100 flex flex-col absolute ${(loginUser?.username === data?.sender?.username) ? "left-2" : "right-2"} 
                                                                top-1/2 -translate-y-1/2 space-y-1 mt-2`}>
                                            <button
                                                className='cursor-pointer w-7 h-7 rounded-full text-gray-400 hover:text-white hover:bg-[#000000ab]'
                                                onClick={() => handleDeleteMessage(data)}>
                                                <DeleteOutlineIcon style={{ fontSize: "1.2rem" }} />
                                            </button>

                                            <button
                                                className='cursor-pointer w-7 h-7 rounded-full text-gray-400 hover:text-white hover:bg-[#000000ab]'
                                                onClick={() => handleMessageReaction(data)}>
                                                <SentimentVerySatisfiedIcon style={{ fontSize: "1.2rem" }} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="modal-title">
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    borderRadius: "10px",
                }}>
                    <EmojiPicker onEmojiClick={handleMessageEmojiReaction} />
                </Box>
            </Modal>

            {
                isMessageProcessing && <div className='absolute  top-0 left-0 bg-[#00000055] w-full h-full flex justify-center items-center'><CircularProgress sx={{ color: "white" }} /></div>
            }

            {remainReadCount > 0 && <span className='absolute right-4 bottom-2 flex items-center text-sm px-3 py-1 rounded-s-full bg-green-500'>
                {remainReadCount}<ExpandMoreIcon style={{ fontSize: '1.2rem' }} />
            </span>}
        </>
    );
}
