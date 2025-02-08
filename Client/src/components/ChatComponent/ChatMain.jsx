import React, { useContext } from 'react';
import ChatContext from '../../context/ChatContext.js';
import Avatar from '@mui/material/Avatar';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

export function ChatMain() {

    const { userChat, messageSearchQuery } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const filterUserChat = userChat?.messages?.filter(chatData => chatData?.message?.toLowerCase().includes(messageSearchQuery.toLowerCase()));

    if (filterUserChat?.length == 0) {
        return <div>
            <p className="text-center mt-5">No messages found</p>
        </div>
    }

    return (
        <ul className='space-y-3'>

            {filterUserChat?.map((data) => (
                <li key={data._id} className={`flex ${data?.sender?.username === loginUser?.username ? 'justify-end' : ''}`}>
                    <div className={`relative flex ${data?.sender?.username === loginUser?.username ? 'flex-row-reverse' : ''}`}>
                        <Avatar
                            src={data?.sender?.image || ''}
                            className='sticky top-0'
                            sx={{ position: 'sticky', top: 0 }}
                        />
                        <div className={`bg-[#000000c2] p-2 border border-gray-700 mt-4 rounded-b-lg 
                            ${loginUser?.username === data?.sender?.username ? 'rounded-s-lg me-2 ms-10' : 'rounded-e-lg me-10 ms-2'}`}>

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
                                        className="absolute bottom-2 right-2 cursor-pointer bg-[#00ff3a5c] hover:bg-[#0000009c] text-white p-1 rounded-md text-xs"
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
                                        className="absolute bottom-2 right-2 bg-[#00ff3a5c] hover:bg-[#0000009c] text-white p-1 rounded-md text-xs"
                                    >
                                        <DownloadOutlinedIcon style={{ fontSize: "1.2rem" }} />
                                    </a>
                                </div>
                            )}

                            {/* Poll Section */}
                            {data?.poll?.length > 0 && (
                                <div className='mt-2 space-y-2'>
                                    {data.poll.map((pollOption) => (
                                        <button
                                            key={pollOption?.option}
                                            className='px-1 py-2 text-base/3 w-full flex flex-col cursor-pointer rounded hover:bg-[#ffffff15]'>
                                            <p className='text-sm flex'>
                                                {pollOption?.option}
                                                <span className='ps-2'>{pollOption?.votes?.length || 0}</span>
                                            </p>
                                            <div className='rounded h-2 bg-gray-900 w-full mt-1'>
                                                <p className="rounded bg-green-500 h-full"
                                                    style={{ width: `${Math.min(100, (pollOption?.votes?.length / (userChat?.members?.length || 2)) * 100)}%` }}>
                                                </p>
                                            </div>
                                        </button>
                                    ))}
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

                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
