import React, { useContext, useEffect, useState } from 'react';
import ChatContext from '../../context/ChatContext.js';
import Avatar from '@mui/material/Avatar';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { v4 as uuidv4 } from 'uuid';
import UserContext from '../../context/UserContext.js';

export default function ChatHeader() {

    const [isSearchStatus, setIsSearchStatus] = useState(false);

    const [remoteUser, setRemoteUser] = useState(null);
    const [anchorEl1, setAnchorEl1] = useState(null);
    const open1 = Boolean(anchorEl1);

    const { userChat, messageSearchQuery, setMessageSearchQuery } = useContext(ChatContext);
    const { loginUser, onlineUsers } = useContext(UserContext);

    useEffect(() => {
        if (userChat) {
            setRemoteUser(userChat?.user1?.username === loginUser?.username ? userChat?.user2 : userChat?.user1);
        }
    }, [userChat]);

    const handleSearchClose = () => {
        setIsSearchStatus(false);
        setMessageSearchQuery("");
    }

    return (
        <>
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
                                        <li key={uuidv4()}>{joinUser.user.username}</li>
                                    ))
                                }
                            </ul>
                            : <p className='text-sm'>
                                {
                                    (onlineUsers?.includes(remoteUser?._id)) ? <span className='text-green-500'>Online</span> : <span className='text-gray-500'>Offline</span>
                                }
                            </p>
                    }
                </div>
            </div>
            <div className='flex space-x-3'>
                <button className='h-8 w-10 rounded bg-[#80808045] cursor-pointer text-gray-500 hover:text-white'>
                    <VideocamOutlinedIcon />
                </button>
                {
                    (isSearchStatus)
                        ? <div className='h-8 p-1 rounded bg-[#80808045] flex flex-1 md:min-w-40 lg:min-w-70'>
                            <input
                                type="text"
                                className='bg-gray-600 p-1 rounded text-sm flex-1'
                                value={messageSearchQuery}
                                onChange={(e) => setMessageSearchQuery(e.target.value)}
                                placeholder='Search message' />
                            <button onClick={handleSearchClose} className='ps-2 text-gray-500 hover:text-white cursor-pointer'><CloseOutlinedIcon style={{ fontSize: "1.2rem" }} /></button>
                        </div>
                        : <button onClick={() => setIsSearchStatus(true)} className='h-8 w-10 rounded bg-[#80808045] cursor-pointer text-gray-500 hover:text-white'>
                            <SearchOutlinedIcon />
                        </button>
                }
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
        </>
    )
}