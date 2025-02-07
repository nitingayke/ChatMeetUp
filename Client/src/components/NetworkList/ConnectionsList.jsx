import React, { useEffect, useState, useContext } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ChatContext from '../../context/ChatContext.js';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';
import { Link } from 'react-router-dom';

export default function ConnectionsList() {

    const [selectedUser, setSelectedUser] = useState(null);

    const { setUserChat } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const handleSelectUser = (value) => {
        setUserChat(value);
        setSelectedUser(value._id);
    }
    
    useEffect(() => {
        if (loginUser?.connections?.length > 0) {
            setUserChat(loginUser.connections[0]);
            setSelectedUser(loginUser.connections[0]._id);
        }
    }, []);

    if (!loginUser?.connections || loginUser.connections.length === 0) {
        return (
            <div className='text-center space-y-2 mt-5 text-sm text-gray-500'>
                <h1>You have not joined any user yet</h1>
                <p>
                    You can join user <Link to={'/join-users'} className='text-blue-500 hover:text-blue-700'>here</Link>.
                </p>
            </div>
        );
    }
    

    return (
        <>
            {
                loginUser?.connections.map((value, idx) => (
                    <ListItem
                        key={value._id}
                        sx={{ padding: 0 }}
                        className={`border-b border-gray-900 hover:bg-gray-800 ${selectedUser === value._id && 'bg-[#80808045]'}`}
                    >
                        <ListItemButton onClick={() => handleSelectUser(value)} >
                            <ListItemAvatar >
                                <Avatar alt={''} src={loginUser?.username === value?.user1.username ? value?.user2?.image : value?.user1?.image} />
                            </ListItemAvatar>

                            <div className='flex-1'>
                                <div className='flex items-center justify-between'>

                                    <h1 className='font-semibold truncate w-35 mb-1'>{loginUser?.username === value?.user1.username ? value?.user2?.username : value?.user1?.username}</h1>
                                    
                                    {idx % 2 !== 0 ? (
                                        <p className="text-xs text-green-400 flex items-center">Online</p>
                                    ) : (
                                        <div className='text-[0.7rem]'>
                                            {
                                                value?.messages?.length > 0
                                                    ? <span className='text-gray-300'>{formatTime(value?.messages[value?.messages?.length - 1]?.createdAt)}</span>
                                                    : <span className='text-red-500'>Offline</span>
                                            }
                                        </div>
                                    )}

                                </div>
                                <div className='text-sm flex-1 text-gray-400'>
                                    {
                                        (value?.messages.length > 0)
                                            ? <p className='line-clamp-1 text-[0.8rem]'>{value?.messages[value?.messages?.length - 1]?.message}</p>
                                            : <p className='text-[0.8rem]'>No messages yet</p>
                                    }
                                </div>
                            </div>
                        </ListItemButton>
                    </ListItem>
                ))
            }
        </>
    )
}