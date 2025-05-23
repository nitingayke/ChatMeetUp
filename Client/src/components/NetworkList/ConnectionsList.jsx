import React, { useContext } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ChatContext from '../../context/ChatContext.js';

export default function ConnectionsList({ searchQuery }) {

    const { id } = useParams();
    const navigate = useNavigate();

    const { setIsDialogOpen } = useContext(ChatContext);
    const { loginUser, onlineUsers } = useContext(UserContext);

    const handleSelectUser = (value) => {
        setIsDialogOpen(true);
        navigate(`/u/chatting/${value._id}`);
    };

    const getLastReadMEssageIndex = (data) => {
        if (!loginUser || !data) return 0;

        return data?.messages.findLastIndex(chat =>
            chat.readBy.some(userData => userData?._id?.toString() === loginUser._id?.toString())
        );
    }

    if (!loginUser?.connections || loginUser.connections.length === 0) {
        return (
            <div className='text-center space-y-2 mt-5 text-sm text-gray-500'>
                <h1>You have not connected with any users yet</h1>
                <p>
                    You can connect with users <Link to={'/u/join-requests'} className='text-blue-500 hover:text-blue-700'>here</Link>.
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
        .sort((a, b) => {

            const lastMessageATime = a.messages.length > 0
                ? new Date(a.messages[a.messages.length - 1].createdAt)
                : new Date(a.createdAt);

            const lastMessageBTime = b.messages.length > 0
                ? new Date(b.messages[b.messages.length - 1].createdAt)
                : new Date(b.createdAt);

            return lastMessageBTime - lastMessageATime;
        });



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
            {filteredConnections.map((connection) => {
                const isUser1 = loginUser?.username === connection?.user1?.username;
                const otherUser = isUser1 ? connection?.user2 : connection?.user1;
                const lastMessage = (connection.messages ?? []).at(-1);
                const lastUnreadMsg = getLastReadMEssageIndex(connection);

                return (
                    <ListItem
                        key={connection._id}
                        sx={{ padding: 0 }}
                        className={`border-b border-gray-900 hover:bg-gray-800 ${id === connection?._id ? 'bg-[#80808045]' : ''}`}
                    >
                        <ListItemButton onClick={() => handleSelectUser(connection)}>
                            <ListItemAvatar className='relative'>
                                <Avatar alt={otherUser?.username} src={otherUser?.image} />
                            </ListItemAvatar>

                            <div className='flex-1'>
                                <div className='flex items-center justify-between'>
                                    <h1 className='font-semibold truncate w-35 mb-1'>{otherUser?.username ?? 'Unknown'}</h1>

                                    {(onlineUsers?.includes(otherUser?._id)) ? (
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
                                        <p className='line-clamp-1 text-[0.8rem] break-all'>{lastMessage?.message ?? ''}</p>
                                    ) : (
                                        <p className='text-[0.8rem]'>No messages yet</p>
                                    )}
                                </div>

                                {
                                    (lastUnreadMsg < connection?.messages?.length - 1) && <div className="text-sm text-green-500 font-bold space-x-1 mt-1">
                                        <ChatBubbleOutlineIcon sx={{ fontSize: '1rem' }} />
                                        <span>{connection?.messages?.length - lastUnreadMsg - 1}</span>
                                    </div>
                                }

                            </div>
                        </ListItemButton>
                    </ListItem>
                );
            })}

            <div className='text-center mt-10'>
                <Link to={'/u/block-users'} className='text-blue-500 text-sm underline hover:text-blue-800'>Blocked Profiles</Link>
            </div>
        </>
    );
}
