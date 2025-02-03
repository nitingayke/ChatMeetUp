import React, { useContext, useEffect, useState } from 'react';
import ChatContext from '../context/ChatContext';
import Avatar from '@mui/material/Avatar';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DashboardSharpIcon from '@mui/icons-material/DashboardSharp';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import loginUser from '../TempData';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { v4 as uuidv4 } from 'uuid';
import { formatTime } from '../utils/helpers.js';

export default function ChatRoom() {
    const [remoteUser, setRemoteUser] = useState(null);
    const [message, setMessage] = useState("");
    const [anchorEl1, setAnchorEl1] = useState(null);
    const open1 = Boolean(anchorEl1);
    const { userChat } = useContext(ChatContext);

    useEffect(() => {
        if (userChat) {
            setRemoteUser(userChat?.user1 === loginUser.username ? userChat?.user2 : userChat?.user1);
        }
    }, [userChat]);

    const handleMessageSubmit = (e) => {
        e.preventDefault();
        try {
            userChat.messages.push({
                "_id": `chat${userChat.messages.length + 1}`,
                "sender": loginUser?.username,
                "message": message,
                "createdAt": new Date(),
                "updatedAt": new Date()
            });
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!userChat) {
        return (
            <div className='flex justify-center items-center h-full'>
                <h1 className='text-3xl font-bold text-gray-300'>Please Select Chat</h1>
            </div>
        );
    }

    return (
        <>
            <header className='py-2 px-3 bg-[#000000d1] flex justify-between items-center w-full'>
                <div className='w-full flex items-center space-x-2'>
                    <Avatar src={(userChat?.members?.length >= 1) ? userChat.image : remoteUser?.image} className='rounded-0' sx={{ width: 40, height: 40 }} />
                    <div className='flex-1 pe-5'>
                        <h1 className='text-lg font-semibold m-0 truncate line-clamp-1'>{(userChat?.members?.length >= 1) ? userChat.name : remoteUser?.username}</h1>
                        {
                            (userChat?.members?.length >= 1)
                                ? <ul className='flex space-x-2 text-sm text-gray-500 line-clamp-1 overflow-auto hide-scroll'>
                                    <li key={uuidv4()} className='text-yellow-500 flex items-center'>
                                        <PeopleAltOutlinedIcon style={{ fontSize: '1rem' }} className='mb-1 me-1' />
                                        <span>{userChat?.members?.length}</span>
                                    </li>
                                    {
                                        userChat?.members?.map((joinUser) => (
                                            <li key={uuidv4()}>{joinUser.user}</li>  
                                        ))
                                    }
                                </ul>
                                : <p className='text-green-500 text-sm'>Online</p>
                        }
                    </div>
                </div>
                <div className='flex space-x-3'>
                    <button className='h-8 w-10 rounded bg-[#80808045] cursor-pointer text-gray-500 hover:text-white'>
                        <VideocamOutlinedIcon />
                    </button>
                    <button className='h-8 w-10 rounded bg-[#80808045] cursor-pointer text-gray-500 hover:text-white'>
                        <SearchOutlinedIcon />
                    </button>
                    <button className='h-8 w-10 rounded bg-[#80808045] cursor-pointer text-gray-500 hover:text-white' onClick={(e) => setAnchorEl1(e.currentTarget)}>
                        <MoreVertOutlinedIcon />
                    </button>
                    <Menu anchorEl={anchorEl1} open={open1} onClose={() => setAnchorEl1(null)} className='mt-4 ms-2'>
                        <MenuItem onClick={() => setAnchorEl1(null)}>Block</MenuItem>
                        <MenuItem onClick={() => setAnchorEl1(null)}>Delete User</MenuItem>
                        <MenuItem onClick={() => setAnchorEl1(null)}>Delete Chat</MenuItem>
                        <MenuItem onClick={() => setAnchorEl1(null)}>Share Profile</MenuItem>
                    </Menu>
                </div>
            </header>

            <main className='flex-1 h-full overflow-auto p-3'>
                <ul className='space-y-3'>
                    {userChat?.messages.map((data) => (

                        <li key={uuidv4()} className={`flex ${data?.sender === loginUser?.username && 'justify-end'}`}>

                            <div className={`relative flex ${data?.sender === loginUser?.username && 'flex-row-reverse'}`}>
                                <Avatar
                                    src={data?.sender?.image}
                                    className='sticky top-0'
                                    sx={{ position: 'sticky', top: 0 }}
                                />
                                <div className={`bg-[#000000c2] p-2 border border-gray-700 mt-4 rounded-b-lg ${loginUser.username === data.sender ? 'rounded-s-lg me-2 ms-10' : 'rounded-e-lg me-10 ms-2'}`}>

                                    <div className={`text-[0.8rem] space-x-2 flex justify-between border-b border-gray-700 pb-1 text-gray-400 ${loginUser.username === data.sender ? 'flex-dir-reverse' : ''}`}
                                        style={{ flexDirection: (loginUser.username === data.sender) ? 'row-reverse' : '' }}>
                                        <p className=''>{data?.sender}</p>
                                        <p className='pe-2'>{formatTime(data?.createdAt)}</p>
                                    </div>

                                    <p className='pt-1 text-gray-200'>{data?.message}</p>
                                    {
                                        (loginUser.username == data.sender) && <div className={`text-base/4 ${(loginUser.username === data.sender)}`}>
                                            {
                                                (data?.readBy?.length >= 2)
                                                    ? <CheckCircleOutlinedIcon className='text-green-500 absolute right-10' style={{ fontSize: '0.9rem' }} />
                                                    : <Brightness1Icon className='text-gray-500 absolute right-10' style={{ fontSize: '0.9rem' }} />
                                            }
                                        </div>
                                    }
                                </div>

                            </div>

                        </li>
                    ))}
                </ul>
            </main>

            <footer className='bg-[#000000d1] p-3 space-x-3 flex'>
                <button className='text-gray-500 hover:text-white cursor-pointer'>
                    <DashboardSharpIcon />
                </button>
                <button className='text-gray-500 hover:text-white cursor-pointer'>
                    <SentimentSatisfiedOutlinedIcon />
                </button>
                <form className='flex flex-1' onSubmit={handleMessageSubmit}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='bg-[#80808045] text-sm flex-1 rounded-s px-2 py-2 text-gray-200'
                        placeholder='Enter message'
                    />
                    <button
                        type={message.length === 0 ? 'button' : 'submit'}
                        className={`text-sm py-1 px-3 rounded-e cursor-pointer bg-[#8080806e] ${message.length === 0 ? 'text-gray-500' : 'text-white'}`}
                    >
                        <SendOutlinedIcon style={{ fontSize: '1.3rem' }} />
                    </button>
                </form>
            </footer>
        </>
    );
}
