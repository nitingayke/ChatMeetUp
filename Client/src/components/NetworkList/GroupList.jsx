import React, { useContext } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { formatTime } from '../../utils/helpers.js';
import UserContext from '../../context/UserContext.js';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Link, useNavigate } from 'react-router-dom';
import ChatContext from '../../context/ChatContext.js';

export default function GroupList({ searchQuery }) {

    const navigate = useNavigate();

    const { selectedUser, setSelectedUser, setIsDialogOpen } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const handleSelectedGroup = (group) => {
        setSelectedUser(group._id);
        setIsDialogOpen(true);
        navigate(`/u/chatting/${group._id}`);
    }

    const getLastReadMessageIndex = (data) => {
        if (!loginUser || !data || !data.messages?.length) return 0;

        const clearedChat = loginUser.clearedChats.find(cc => cc?.chatId?.toString() === data?._id?.toString());
        const clearedAt = clearedChat ? new Date(clearedChat.clearedAt) : null;

        return data.messages.findLastIndex(chat =>
            chat.readBy.some(userData => userData?._id?.toString() === loginUser._id?.toString()) ||
            (!clearedAt || new Date(chat.createdAt) < clearedAt)
        );
    }

    if (!loginUser?.groups || loginUser.groups.length === 0) {
        return (
            <div className='text-center space-y-2 mt-5 text-sm text-gray-500'>
                <h1>You have not joined any groups yet</h1>
                <p>
                    You can join groups <Link to={'/u/join-requests'} className='text-blue-500 hover:text-blue-700'>here</Link>.
                </p>
            </div>
        );
    }

    const blockedUserIds = new Set(loginUser.blockUser.map(id => id.toString()));

    const filteredGroups = loginUser.groups
        .filter(group => {
            const groupName = group?.name || '';

            if (blockedUserIds.has(group._id?.toString())) return false;

            return groupName.toLowerCase().includes((searchQuery || "").toLowerCase());
        })
        .sort((a, b) => {
            const lastMessageA = a.messages?.length ? new Date(a.messages[a.messages.length - 1].createdAt) : new Date(a.createdAt);
            const lastMessageB = b.messages?.length ? new Date(b.messages[b.messages.length - 1].createdAt) : new Date(b.createdAt);

            return lastMessageB - lastMessageA;
        });

    if (filteredGroups.length === 0) {
        return (
            <div className='text-center text-gray-500 py-5'>
                <h1>No group found matching <b className='text-white break-words'>{searchQuery}</b>.</h1>
                <Link to={'/u/block-users'} className='text-blue-500 text-sm underline hover:text-blue-800'>Blocked Profiles</Link>
            </div>
        );
    }

    return (
        <>
            {filteredGroups.map((group) => {
                const lastMessage = group.messages?.length ? group.messages.at(-1) : null;
                const lastUnreadMsg = getLastReadMessageIndex(group);

                return (
                    <ListItem
                        key={group._id}
                        sx={{ padding: 0 }}
                        className={`border-b border-gray-900 hover:bg-gray-800 ${selectedUser === group._id ? 'bg-[#80808045]' : ''}`}
                    >
                        <ListItemButton onClick={() => handleSelectedGroup(group)}>
                            <ListItemAvatar>
                                <Avatar alt={group?.name} src={group?.image} />
                            </ListItemAvatar>

                            <div className='flex-1'>
                                <div className='flex items-center justify-between space-x-2'>
                                    <h1 className='font-semibold truncate w-35'>{group?.name}</h1>
                                    <div className='text-[0.7rem]'>
                                        {lastMessage ? (
                                            <p className='text-gray-300'>{formatTime(lastMessage.createdAt)}</p>
                                        ) : (
                                            <div className='space-x-1 flex items-center text-gray-500'>
                                                <PeopleAltOutlinedIcon style={{ fontSize: "1rem" }} />
                                                <span className='text-sm'>{group?.members?.length}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='text-sm flex-1 text-gray-400'>
                                    {lastMessage ? (
                                        <div className='text-[0.8rem] space-x-1 line-clamp-2'>
                                            {loginUser?.username === lastMessage?.sender?.username && (
                                                <span>
                                                    {lastMessage?.readBy?.length === group?.members?.length ? (
                                                        <CheckCircleOutlinedIcon className='text-green-500' style={{ fontSize: '0.9rem' }} />
                                                    ) : (
                                                        <Brightness1Icon style={{ fontSize: '0.9rem' }} />
                                                    )}
                                                </span>
                                            )}
                                            <span className='text-yellow-500 whitespace-nowrap pe-1'>
                                                {lastMessage?.sender?.username ?? 'Unknown'}&#58;
                                            </span>
                                            {lastMessage?.message ?? ''}
                                        </div>
                                    ) : (
                                        <p className='text-[0.8rem]'>No messages yet</p>
                                    )}

                                    {
                                        (lastUnreadMsg < group?.messages?.length - 1) && <div className="text-sm text-green-500 font-bold space-x-1 mt-1">
                                            <ChatBubbleOutlineIcon sx={{ fontSize: '1rem' }} />
                                            <span>{group?.messages?.length - lastUnreadMsg - 1}</span>
                                        </div>
                                    }
                                </div>
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
