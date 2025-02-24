import React, { useContext, useEffect, useState } from 'react';
import { Avatar, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OnlineIcon from '@mui/icons-material/FiberManualRecord';
import UserContext from '../../context/UserContext';
import { connectToUser, getUsersData } from '../../services/userchatService';
import { useSnackbar } from 'notistack';
import LeftSidebar from '../SidebarLayout/LeftSidebar';
import { Link, useNavigate } from 'react-router-dom';
import { PersonAdd } from "@mui/icons-material"
import AuthOptions from '../AuthOptions';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import GroupIcon from "@mui/icons-material/Group";

export default function LiveUserList() {

    const navigate = useNavigate();
    const { loginUser } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [liveUserData, setLiveUserData] = useState([]);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const { enqueueSnackbar } = useSnackbar();
    const { onlineUsers } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const handleClose = (filter) => {
        if (filter) setSelectedFilter(filter);
        setAnchorEl(null);
    };

    const connectedUsersMap = loginUser?.connections?.reduce((acc, connection) => {
        const userX = connection?.user1?._id === loginUser?._id ? connection?.user2 : connection?.user1;
        if (userX?._id) {
            acc[userX._id] = connection._id;
        }
        return acc;
    }, {});

    const handleLiveUserData = async () => {
        try {
            setIsLoading(true);
            const response = await getUsersData(onlineUsers);

            if (response.success) {
                setLiveUserData(response.users);
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'Unable to fetch live users data.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (onlineUsers?.length <= 1) return;

        handleLiveUserData();
    }, [onlineUsers]);

    const handleUserConnection = async (remoteUserId) => {

        if (connectedUsersMap[remoteUserId]) {
            enqueueSnackbar('User are already joined.', { variant: 'info' });
            navigate(`/u/chatting/${connectedUsersMap[remoteUserId]}`);
            return;
        }

        try {
            setIsLoading(true);
            const response = await connectToUser(remoteUserId, loginUser._id);

            if (response.success) {
                navigate(`/u/chatting/${response?.connectionId}`);
                enqueueSnackbar('Connected successfully! Redirecting to chat...', { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || "Can not connect to user, please try again.", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "Can not connect to user, please try again.", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }


    if (!loginUser) {
        return <AuthOptions />
    }

    const filteredUsers = liveUserData?.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());

        if (user?.username === loginUser?.username)
            return false;

        if (selectedFilter === "All") {
            return matchesSearch;
        }

        if (selectedFilter === "Joined") {
            return matchesSearch && connectedUsersMap[user._id];
        }

        if (selectedFilter === "Not Joined") {
            return matchesSearch && !connectedUsersMap[user._id];
        }

        return false;
    });


    return (
        <>
            <div className='block md:hidden bg-gradient-to-r from-black to-gray-800'>
                <LeftSidebar />
            </div>
            <div className='flex-1 bg-gradient-to-r from-black to-gray-800 h-full overflow-auto'>

                <header className='h-fit sticky top-0 p-4 md:flex items-center justify-center w-full z-10 bg-gradient-to-r from-black to-gray-800 sm:space-x-2'>

                    <div className='flex justify-between items-center'>
                        <h1 className='text-2xl text-orange-500 flex items-center md:border md:px-3 rounded'
                            style={{ fontWeight: "800" }}>
                            Live Users
                        </h1>
                        <div className='block md:hidden text-green-500 flex items-center space-x-1'>
                            <span className='text-xl'>{liveUserData?.length > 0 ? liveUserData.length - 1 : 0}</span>
                            <GroupIcon />
                        </div>
                    </div>

                    <div className='flex space-x-2 w-full md:w-fit mt-2 md:mt-0'>
                        <div className='flex flex-nowrap border border-gray-500 rounded flex-1'>
                            <input type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className='flex-1 p-1 text-sm md:min-w-[29rem]' />
                            <button className='py-1 px-2 text-gray-500 bg-gray-800 rounded-e hover:bg-gray-700 hover:text-white cursor-pointer'>
                                <SearchIcon sx={{ fontSize: "1.3rem" }} />
                            </button>
                        </div>

                        <button onClick={(e) => setAnchorEl(e.currentTarget)} className='border px-3 py-1 text-md rounded border-gray-500 cursor-pointer flex flex-nowrap' >
                            <span className='whitespace-nowrap'>{selectedFilter}</span>
                            {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                        </button>
                    </div>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                        TransitionComponent={Fade}
                        sx={{ marginTop: '0.2rem' }}
                    >
                        <MenuItem onClick={() => handleClose("All")}>All</MenuItem>
                        <MenuItem onClick={() => handleClose("Joined")}>Joined</MenuItem>
                        <MenuItem onClick={() => handleClose("Not Joined")}>Not Joined</MenuItem>
                    </Menu>

                </header>

                {
                    (isLoading)
                        ? <div className='mt-15 text-gray-500 flex justify-center space-x-5 items-center'>
                            <CircularProgress size={30} />
                            <span>Loading...</span>
                        </div>
                        : <div className="p-4 mx-auto flex-1 md:w-190">
                            {filteredUsers?.length > 0 ? (
                                <ul className="space-y-3 pb-15">
                                    {filteredUsers
                                        .map((user) => (
                                            <li key={user?._id} className="p-3 bg-[#80808012] hover:bg-[#80808024] rounded-lg transition">

                                                <div className='flex items-center mb-3'>
                                                    <Avatar
                                                        src={user?.image || "/default-avatar.png"}
                                                        alt={user.username}
                                                        className="w-10 h-10 border-2 border-green-500"
                                                    />

                                                    <div className="ml-3 flex-1">
                                                        <Link to={`/u/profile/${user?.username}`}>
                                                            <h2 className="text-lg" style={{ fontWeight: '600' }}>{user?.username}</h2>
                                                        </Link>
                                                        <p className="text-gray-400 text-sm">{user?.description || "No bio available"}</p>
                                                    </div>

                                                    <OnlineIcon className="text-green-500" />
                                                </div>

                                                <div className='flex justify-end'>
                                                    {connectedUsersMap[user._id] ? (
                                                        <Link to={`/u/chatting/${connectedUsersMap[user._id]}`} className='border text-sm rounded px-3 py-1 text-gray-500 hover:text-orange-500 cursor-pointer'>
                                                            View
                                                        </Link>
                                                    ) : (
                                                        <button onClick={() => handleUserConnection(user?._id)} className='border text-sm rounded px-3 py-1 text-gray-500 hover:text-orange-500 cursor-pointer flex items-center'>
                                                            <PersonAdd sx={{ fontSize: '1rem' }} className='me-1' />
                                                            <span>Connect</span>
                                                        </button>
                                                    )}
                                                </div>

                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <div className="text-center text-gray-500 text-lg mt-10">
                                    No User is Online
                                </div>
                            )}

                        </div>
                }
            </div>
        </>
    );
}
