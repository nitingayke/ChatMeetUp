import React, { useContext, useEffect, useState } from 'react';
import ChatContext from '../../context/ChatContext.js';
import Avatar from '@mui/material/Avatar';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { Modal, Box, CircularProgress } from "@mui/material";
import EmojiPicker from 'emoji-picker-react';
import { socket } from '../../services/socketService.js';
import { useSnackbar } from 'notistack';
import { deleteChatMessage } from '../../services/chatService.js';

export function ChatMain() {

    const { enqueueSnackbar } = useSnackbar();
    const { userChat, messageSearchQuery } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const [localChat, setLocalChat] = useState(userChat || {});
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [chatMessageData, setChatMessageData] = useState(null);


    useEffect(() => {
        setLocalChat(userChat);
    }, [userChat]);

    const handlePollOptions = (data, pollIdx) => {

        if (!loginUser) {
            enqueueSnackbar("User not found. Please log in to continue.");
            return;
        }

        if (!data || pollIdx === undefined) {
            enqueueSnackbar("Chat data not found, please try again.");
            return;
        }

        const userAlreadyVoted = data?.poll?.some((option) => option.votes.includes(loginUser?._id));
        if (userAlreadyVoted) {
            enqueueSnackbar("User has already voted in this poll.", { variant: "warning" });
            return;
        }

        socket.emit('userchat-poll-vote', {
            conversationId: localChat?._id,
            userId: loginUser?._id,
            username: loginUser?.username,
            chatId: data._id,
            pollIdx,
        });
    }

    const handlePollVoteSuccess = ({ conversationId, userId, username, chatId, pollIdx }) => {
        if (localChat._id === conversationId) {
            setLocalChat(prevChat => {
                const updatedMessages = prevChat.messages.map(msg => {
                    if (msg._id === chatId) {
                        const updatedPoll = [...msg.poll];

                        if (!updatedPoll[pollIdx].votes.includes(userId)) {
                            updatedPoll[pollIdx].votes = [...updatedPoll[pollIdx].votes, userId];
                        }

                        return { ...msg, poll: updatedPoll };
                    }
                    return msg;
                });

                return { ...prevChat, messages: updatedMessages };
            });
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

        setLocalChat((prevChat) => ({
            ...prevChat,
            messages: prevChat.messages.map((msg) =>
                msg._id === chatId ? updateMessageReaction(msg, userId, emoji) : msg
            ),
        }));

        enqueueSnackbar(
            loginUser._id === userId ? "You reacted to a message!" : "A user added a reaction.",
            { variant: "success" }
        );
    };

    const handleNewChatMessage = ({ recipientId, data }) => {
        setLocalChat((prevChat) => {
            if (prevChat?._id === recipientId) {
                return {
                    ...prevChat,
                    messages: [...(prevChat?.messages || []), data]
                };
            }
            return prevChat;
        });
    };

    useEffect(() => {
        socket.on("poll-vote-success", handlePollVoteSuccess);
        socket.on("chat-reaction-success", handleChatReaction);
        socket.on("add-chat-message-success", handleNewChatMessage);

        return () => {
            socket.off("poll-vote-success", handlePollVoteSuccess);
            socket.off("chat-reaction-success", handleChatReaction);
            socket.off("add-chat-message-success", handleNewChatMessage);
        };
    }, []);

    const handleDeleteMessage = async (data) => {
        if (!data?._id) {
            enqueueSnackbar('Message data not found, please try again.', { variant: "error" });
            return;
        }

        try {

            setIsLoading(true);
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
            setIsLoading(false);
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

    const filterUserChat = localChat?.messages?.filter(chatData => chatData?.message?.toLowerCase().includes(messageSearchQuery.toLowerCase()));


    if (filterUserChat?.length == 0) {
        return <div>
            <p className="text-center mt-5">No messages found</p>
        </div>
    }


    return (
        <>
            <ul className='space-y-3 h-full overflow-auto p-3'>
                {filterUserChat?.map((data) => (
                    <li key={data?._id ?? 'default-id'} className={`flex ${data?.sender?.username === loginUser?.username ? 'justify-end' : ''}`}>
                        <div className={`group relative flex ${data?.sender?.username === loginUser?.username ? 'flex-row-reverse' : ''}`}>

                            <Avatar
                                src={data?.sender?.image ?? ''}
                                className='sticky top-0'
                                sx={{ position: 'sticky', top: 0 }}
                            />

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

                                        {/* Video Attachment */}
                                        {data?.attachments?.video && (
                                            <div className='mt-5 relative'>
                                                <iframe
                                                    title={`Video - ${data._id}`}
                                                    width="100%"
                                                    height="100%"
                                                    src={data.attachments.video}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                                <a
                                                    href={`${data.attachments.video}?fl_attachment`}
                                                    download
                                                    target='_blank'
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-2 right-2 cursor-pointer bg-[#0000009c] hover:bg-[#00ff3a5c] text-white p-1 rounded-md text-xs"
                                                >
                                                    <DownloadOutlinedIcon style={{ fontSize: "1.2rem" }} />
                                                </a>
                                            </div>
                                        )}

                                        {/* PDF Attachment */}
                                        {data?.attachments?.pdf && (
                                            <div className='mt-4'>
                                                {/* PDF Preview (Blurred) */}
                                                <div className='h-40 overflow-hidden  bg-cover rounded mb-2'
                                                    style={{ filter: "blur(1px)", transition: "filter 0.3s" }} >
                                                    <iframe
                                                        src={`https://docs.google.com/gview?url=${encodeURIComponent(data.attachments.pdf)}&embedded=true`}
                                                        width="100%"
                                                        height="500px"
                                                        title="PDF Preview"
                                                        style={{ border: 'none' }}
                                                    ></iframe>

                                                </div>

                                                {/* Download PDF Option */}
                                                <div className='flex justify-between items-center'>
                                                    <p className='text-sm'>Download PDF</p>
                                                    <a href={`${data.attachments.pdf}?fl_attachment`} target='_blank' download className="text-blue-500 hover:text-blue-700 border-3 rounded-full w-7 h-7 flex justify-center items-center">
                                                        <DownloadOutlinedIcon style={{ fontSize: '1.2rem' }} />
                                                    </a>
                                                </div>
                                            </div>
                                        )}


                                        {/* Image Attachment */}
                                        {data?.attachments?.image && (
                                            <div className='mt-5 relative'>
                                                <img src={data.attachments.image} alt="attachment" className='w-full rounded-lg' />
                                                <a
                                                    href={`${data.attachments.image}?fl_attachment`}
                                                    download
                                                    target='_blank'
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-2 right-2 bg-[#0000009c] hover:bg-[#00ff3a5c] text-white p-1 rounded-md text-xs"
                                                >
                                                    <DownloadOutlinedIcon style={{ fontSize: "1.2rem" }} />
                                                </a>
                                            </div>
                                        )}

                                        {/* Poll Section */}
                                        {data?.poll?.length > 0 && (
                                            <div className='mt-2 space-y-2'>
                                                {data.poll.map((pollOption, idx) => {
                                                    const totalMembers = localChat?.members?.length ?? 2;
                                                    const voteCount = pollOption?.votes?.length ?? 0;
                                                    const votePercentage = totalMembers > 0 ? Math.min((voteCount / totalMembers) * 100, 100) : 0;

                                                    const hasUserVoted = data.poll.some(option =>
                                                        option.votes?.some(vote => vote.userId === loginUser?._id)
                                                    );

                                                    return (
                                                        <button
                                                            key={pollOption?.option ?? `poll-option-${idx}`}
                                                            onClick={() => handlePollOptions(data, idx)}
                                                            className='px-1 py-2 text-base/3 w-full flex flex-col cursor-pointer rounded hover:bg-[#ffffff15]'>
                                                            <p className='text-sm flex'>
                                                                {pollOption?.option ?? 'Option'}
                                                                <span className='ps-2'>{votePercentage.toFixed(1)}%</span>
                                                            </p>
                                                            <div className='rounded h-2 bg-gray-900 w-full mt-1'>
                                                                <p className="rounded bg-green-500 h-full"
                                                                    style={{ width: !hasUserVoted ? `${votePercentage}%` : '0%' }}>
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

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

                                        {/* User Online/Offline Status */}
                                        {loginUser?.username === data?.sender?.username && (
                                            <div className="absolute right-10 text-base/2">
                                                {data?.readBy?.length >= 2 ? (
                                                    <CheckCircleOutlinedIcon className='text-green-500' style={{ fontSize: '0.9rem' }} />
                                                ) : (
                                                    <Brightness1Icon className='text-gray-500' style={{ fontSize: '0.9rem' }} />
                                                )}
                                            </div>
                                        )}

                                        {/* Chat Buttons */}
                                        <div className={`opacity-0 group-hover:opacity-100 flex flex-col absolute ${(loginUser?.username === data?.sender?.username) ? "left-2" : "right-2"} 
                                                                top-1/2 -translate-y-1/2 space-y-1 mt-2`}>
                                            <button
                                                className='cursor-pointer w-7 h-7 rounded-full text-gray-400 hover:text-white hover:bg-[#80808045]'
                                                onClick={() => handleDeleteMessage(data)}>
                                                <DeleteOutlineIcon style={{ fontSize: "1.2rem" }} />
                                            </button>

                                            <button
                                                className='cursor-pointer w-7 h-7 rounded-full text-gray-400 hover:text-white hover:bg-[#80808045]'
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
                isLoading && <div className='absolute  top-0 left-0 bg-[#00000055] w-full h-full flex justify-center items-center'><CircularProgress sx={{ color: "white" }} /></div>
            }
        </>
    );
}
