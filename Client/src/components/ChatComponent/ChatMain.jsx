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
import { socket } from '../../services/socketService.js';
import { useSnackbar } from 'notistack';
import { deleteChatMessage } from '../../services/chatService.js';
import { CircularProgress } from '@mui/material';

export function ChatMain() {

    const { enqueueSnackbar } = useSnackbar();
    const { userChat, messageSearchQuery } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const [localChat, setLocalChat] = useState(userChat || {});
    const [isLoading, setIsLoading] = useState(false);

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
                        updatedPoll[pollIdx].votes.push(userId);
                        return { ...msg, poll: updatedPoll };
                    }
                    return msg;
                })

                return { ...prevChat, messages: updatedMessages };
            });

            const updatedMessage = localChat.messages.find(msg => msg._id === chatId);
            if (updatedMessage) {
                enqueueSnackbar(`${username || "Unknown User"} voted for "${updatedMessage.poll[pollIdx].option}"`, { variant: "success" });
            }
        }
    }

    useEffect(() => {
        socket.on("poll-vote-success", handlePollVoteSuccess);

        return () => {
            socket.off("poll-vote-success", handlePollVoteSuccess);
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

    const handleMessageReaction = (data) => {

    }

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
                    <li key={data._id} className={`flex ${data?.sender?.username === loginUser?.username ? 'justify-end' : ''}`}>
                        <div className={`group relative flex ${data?.sender?.username === loginUser?.username ? 'flex-row-reverse' : ''}`}>
                            <Avatar
                                src={data?.sender?.image || ''}
                                className='sticky top-0'
                                sx={{ position: 'sticky', top: 0 }}
                            />
                            <div className={`bg-[#000000c2] p-2 border border-gray-700 mt-4 rounded-b-lg ${loginUser?.username === data?.sender?.username ? 'rounded-s-lg me-2 ms-10' : 'rounded-e-lg me-10 ms-2'}`}>
                                {
                                    (data.deleteBy.includes(loginUser._id))
                                        ? <div className='flex items-center space-x-1 text-red-300'>
                                            <DeleteOutlineIcon style={{ fontSize: '1rem', marginBottom: '0.2rem' }} />
                                            <span>Message deleted</span>
                                        </div>
                                        : <>
                                            {/* Message Header */}
                                            <div className="text-[0.8rem] space-x-2 flex justify-between border-b border-gray-700 pb-1 text-gray-400">
                                                <p>{data?.sender?.username || 'Unknown'}</p>
                                                <p className='pe-2'>{formatTime(data?.createdAt) || 'Just now'}</p>
                                            </div>

                                            {/* Message Content */}
                                            {data?.message && <p className='pt-3 text-gray-200'>{data.message}</p>}

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
                                                    <div className='h-20 bg-cover bg-[url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh59esa59OmZuX7w7QkhDnRQXhLVky4jW2LQ&s)] rounded mb-2'></div>
                                                    <div className='flex justify-between items-center'>
                                                        <p>Download PDF</p>
                                                        <a href={`${data?.attachments?.pdf}?fl_attachment`} target='_blank' download className="text-blue-500 hover:text-blue-700 border-3 rounded-full p-[0.5px]">
                                                            <DownloadOutlinedIcon />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Image Attachment */}
                                            {data?.attachments?.image && (
                                                <div className='mt-5 relative'>
                                                    <img src={data.attachments.image} alt="attachment" className='w-full' />
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
                                                        const totalMembers = localChat?.members?.length || 2;
                                                        const voteCount = pollOption?.votes?.length || 0;
                                                        const votePercentage = totalMembers > 0 ? (voteCount / totalMembers) * 100 : 0;

                                                        const hasUserVoted = data.poll.some(option =>
                                                            option.votes?.some(vote => vote.userId === loginUser?._id)
                                                        );

                                                        return (
                                                            <button
                                                                key={pollOption?.option}
                                                                onClick={() => handlePollOptions(data, idx)}
                                                                className='px-1 py-2 text-base/3 w-full flex flex-col cursor-pointer rounded hover:bg-[#ffffff15]'>
                                                                <p className='text-sm flex'>
                                                                    {pollOption?.option}
                                                                    <span className='ps-2'>{voteCount}</span>
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
                                }

                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {
                isLoading && <div className='absolute top-1/2 left-1/2'><CircularProgress sx={{color: "white"}}/></div>
            }
        </>
    );
}
