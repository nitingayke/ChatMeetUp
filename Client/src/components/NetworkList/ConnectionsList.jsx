import React, { useState, useContext } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';
import { Link, useNavigate } from 'react-router-dom';
import ChatContext from '../../context/ChatContext.js';

export default function ConnectionsList({ searchQuery }) {

    const navigate = useNavigate();

    const { selectedUser, setSelectedUser } = useContext(ChatContext);
    const { loginUser, onlineUsers } = useContext(UserContext);

    const handleSelectUser = (value) => {
        setSelectedUser(value._id);
        navigate(`/u/chatting/${value._id}`);
    };

    if (!loginUser?.connections || loginUser.connections.length === 0) {
        return (
            <div className='text-center space-y-2 mt-5 text-sm text-gray-500'>
                <h1>You have not connected with any users yet</h1>
                <p>
                    You can connect with users <Link to={'/join-users'} className='text-blue-500 hover:text-blue-700'>here</Link>.
                </p>
            </div>
        );
    }


    const blockedUserIds = new Set(loginUser.blockUser.map(id => id.toString())); 

    const filteredConnections = loginUser.connections
        .filter(value => {
            if (!value?.user1 || !value?.user2) return false;

            const otherUser = loginUser.username === value.user1.username ? value.user2 : value.user1;

            if (blockedUserIds.has(value._id?.toString())) return false;

            return (otherUser.username || "").toLowerCase().includes((searchQuery || "").toLowerCase());
        })
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));



    if (filteredConnections.length === 0) {
        return (
            <div className='text-center text-gray-500 py-5'>
                <h1>No user found matching <b className='text-white break-words'>{searchQuery}</b>.</h1>
                <Link to={'/u/block-users'} className='text-blue-500 text-sm underline hover:text-blue-800'>Blocked Profiles</Link>
            </div>
        );
    }

    return (
        <>
            {filteredConnections.map((connection, idx) => {
                const isUser1 = loginUser?.username === connection?.user1?.username;
                const otherUser = isUser1 ? connection?.user2 : connection?.user1;
                const lastMessage = (connection.messages ?? []).at(-1);

                return (
                    <ListItem
                        key={connection._id}
                        sx={{ padding: 0 }}
                        className={`border-b border-gray-900 hover:bg-gray-800 ${selectedUser === connection._id ? 'bg-[#80808045]' : ''}`}
                    >
                        <ListItemButton onClick={() => handleSelectUser(connection)}>
                            <ListItemAvatar className='relative'>
                                <Avatar alt={otherUser?.username} src={otherUser?.image} />
                            </ListItemAvatar>

                            <div className='flex-1'>
                                <div className='flex items-center justify-between'>
                                    <h1 className='font-semibold truncate w-35 mb-1'>{otherUser?.username ?? 'Unknown'}</h1>

                                    {(onlineUsers?.includes(connection?._id)) ? (
                                        <p className="text-xs text-green-400 flex items-center">Online</p>
                                    ) : (
                                        <div className='text-[0.7rem]'>
                                            {lastMessage ? (
                                                <span className='text-gray-300'>{formatTime(lastMessage.createdAt)}</span>
                                            ) : (
                                                <span className='text-red-500'>Offline</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className='text-sm flex-1 text-gray-400'>
                                    {lastMessage ? (
                                        <p className='line-clamp-1 text-[0.8rem]'>{lastMessage?.message ?? ''}</p>
                                    ) : (
                                        <p className='text-[0.8rem]'>No messages yet</p>
                                    )}
                                </div>
                            </div>
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </>
    );
}
