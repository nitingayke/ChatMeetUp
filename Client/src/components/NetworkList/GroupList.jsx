import React, { useState, useEffect, useContext } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ChatContext from '../../context/ChatContext.js';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';


export default function GroupList() {

    const [selectedUser, setSelectedUser] = useState(null);

    const { setUserChat } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const handleSelectUser = (value) => {
        setUserChat(value);
        setSelectedUser(value._id);
    }

    useEffect(() => {
        if (loginUser?.groups?.length > 0) {
            setUserChat(loginUser.groups[0]);
            setSelectedUser(loginUser.groups[0]._id);
        }
    }, []);

    return (
        <>
            {
                loginUser?.groups.map((value, idx) => (
                    <ListItem
                        key={value._id}
                        sx={{ padding: 0 }}
                        className={`border-b border-gray-900 hover:bg-gray-800 ${selectedUser === value._id && 'bg-[#80808045]'}`}
                    >
                        <ListItemButton onClick={() => handleSelectUser(value)} >
                            <ListItemAvatar >
                                <Avatar alt={value.name} src={value?.image} />
                            </ListItemAvatar>

                            <div className='flex-1'>
                                <div className='flex items-center justify-between space-x-2'>

                                    <h1 className='font-semibold truncate w-40'>{value.name}</h1>
                                    <div className='text-[0.7rem]'>
                                        {
                                            value?.messages?.length > 0
                                                ? <p className='text-gray-300 line-clamp-1'>{formatTime(value?.messages[value?.messages?.length - 1]?.createdAt)}</p>
                                                : <div className='space-x-1 flex items-center text-gray-500'>
                                                    <PeopleAltOutlinedIcon style={{ fontSize: "1rem" }} />
                                                    <span className='text-sm'>{value.members.length}</span>
                                                </div>
                                        }
                                    </div>

                                </div>
                                <div className='text-sm flex-1 text-gray-400'>
                                    {
                                        (value?.messages.length > 0)
                                            ? <div className='flex items-center text-[0.8rem] space-x-1'>
                                                {
                                                    (loginUser.username === value?.messages[value?.messages?.length - 1]?.sender) && <p>
                                                        {
                                                            (value?.messages[value?.messages?.length - 1]?.readBy?.length === value?.members?.length)
                                                                ? <CheckCircleOutlinedIcon className='mb-1 text-green-500' style={{ fontSize: '0.9rem' }} />
                                                                : <Brightness1Icon className='mb-1' style={{ fontSize: '0.9rem' }} />
                                                        }
                                                    </p>
                                                }
                                                <p className='text-yellow-500 whitespace-nowrap'>{value?.messages[value?.messages?.length - 1]?.sender} &#58;</p>
                                                <p className='line-clamp-1'>{value?.messages[value?.messages?.length - 1]?.message}</p>
                                            </div>
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