import React, { useContext, useEffect, useState } from 'react';
import ChatContext from '../../context/ChatContext.js';
import Avatar from '@mui/material/Avatar';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Menu from '@mui/material/Menu';
import { Block, Share, Wallpaper, DeleteSweepOutlined } from "@mui/icons-material";
import MenuItem from '@mui/material/MenuItem';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { v4 as uuidv4 } from 'uuid';
import UserContext from '../../context/UserContext.js';
import { Link, useLocation, useParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { cleanUserChats, setBlockUser } from '../../services/chatService.js';
import LoaderContext from '../../context/LoaderContext.js';

export default function ChatHeader() {

    const { id } = useParams();
    const location = useLocation();

    const currentURL = window.location.origin + location.pathname;

    const [isSearchStatus, setIsSearchStatus] = useState(false);
    const [remoteUser, setRemoteUser] = useState(null);
    const [anchorEl1, setAnchorEl1] = useState(null);
    const open1 = Boolean(anchorEl1);

    const { userChat, messageSearchQuery, setMessageSearchQuery } = useContext(ChatContext);
    const { loginUser, setLoginUser, onlineUsers } = useContext(UserContext);
    const { setIsMessageProcessing } = useContext(LoaderContext);

    useEffect(() => {
        if (userChat) {
            setRemoteUser(userChat?.user1?.username === loginUser?.username ? userChat?.user2 : userChat?.user1);
        }
    }, [userChat]);

    const handleSearchClose = () => {
        setIsSearchStatus(false);
        setMessageSearchQuery("");
    }

    const handleProfileShare = async () => {

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Check out this profile!",
                    text: "Hey, check out this profile on our platform!",
                    url: currentURL
                });
            } catch (error) {
                enqueueSnackbar(error.message || "fail sharing, please try again.", { variant: 'error' });
            }
            setAnchorEl1(null);
        }

    }

    const handleBlockUser = async () => {
        try {
            setIsMessageProcessing(true);
            const response = await setBlockUser(id, loginUser._id);

            if (response.success) {
                setLoginUser(prev => ({
                    ...prev,
                    blockUser: [...(prev?.blockUser || []), id]
                }));

                enqueueSnackbar(response.message || "User blocked successfully", { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || "Failed to block user", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'Unable to block user, please try again.', { variant: 'error' });
        } finally {
            setIsMessageProcessing(false);
            setAnchorEl1(null);
        }
    }

    const handleClearChats = async () => {
        try {
            setIsMessageProcessing(true);
            const response = await cleanUserChats(id, loginUser?._id);

            if (response.success) {
                setLoginUser((prev) => {
                    const updatedClearedChats = prev.clearedChats ? [...prev.clearedChats] : [];

                    const clearedChatIndex = updatedClearedChats.findIndex(chat => chat.chatId === response.chatId);

                    if (clearedChatIndex !== -1) {
                        updatedClearedChats[clearedChatIndex].clearedAt = new Date();
                    } else {
                        updatedClearedChats.push({
                            chatId: response.chatId,
                            clearedAt: new Date(),
                        });
                    }

                    return {
                        ...prev,
                        clearedChats: updatedClearedChats,
                    };
                });

                enqueueSnackbar(response.message || "Chat cleared successfully!", { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || "Failed to clear chat!", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'Unable to clean chats, please try again.', { variant: 'error' });
        } finally {
            setIsMessageProcessing(false);
            setAnchorEl1(null);
        }
    };

    return (
        <>
            <div className='w-full flex items-center space-x-2'>

                <Link to={`/u/profile/${id}`}>
                    <Avatar src={(userChat?.members?.length >= 1) ? userChat.image : remoteUser?.image} className='rounded-0' sx={{ width: 40, height: 40 }} />
                </Link>

                <div className='pe-5 w-[11rem] md:w-[14rem] lg:flex-1'>
                    <Link to={`/u/profile/${id}`}>
                        <h1 className='text-lg font-semibold m-0 truncate line-clamp-1'>{(userChat?.members?.length >= 1) ? userChat.name : remoteUser?.username}</h1>
                    </Link>
                    {
                        (userChat?.members?.length >= 1)
                            ? <ul className='flex space-x-2 text-sm text-gray-500 line-clamp-1 overflow-auto hide-scroll'>
                                <li key={uuidv4()} className='text-yellow-500 flex items-center sticky left-0'>
                                    <PeopleAltOutlinedIcon style={{ fontSize: '1rem' }} className='mb-1 me-1' />
                                    <span>{userChat?.members?.length}</span>
                                </li>
                                {
                                    userChat?.members?.map((joinUser) => (
                                        <li key={uuidv4()}>
                                            <Link to={`/u/profile/${joinUser._id}`}>{joinUser.user.username}</Link>
                                        </li>
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
                <Menu anchorEl={anchorEl1} open={open1} onClose={() => setAnchorEl1(null)} className='mt-4 ms-2 '>
                    <MenuItem onClick={handleBlockUser} className='text-gray-100'>
                        <Block fontSize="small" className="mr-1" /> Block
                    </MenuItem>
                    <MenuItem onClick={handleClearChats} className='text-gray-100'>
                        <DeleteSweepOutlined fontSize="small" className="mr-1" /> Clear Chat
                    </MenuItem>
                    <MenuItem onClick={handleProfileShare} className='text-gray-100'>
                        <Share fontSize="small" className="mr-1" /> Share Profile
                    </MenuItem>
                    <MenuItem onClick={() => setAnchorEl1(null)} className='text-gray-100'>
                        <Link to={"/playground/wallpaper"} className="no-underline flex items-center">
                            <Wallpaper fontSize="small" className="mr-1" />
                            Wallpaper
                        </Link>
                    </MenuItem>
                </Menu>
            </div>
        </>
    )
}