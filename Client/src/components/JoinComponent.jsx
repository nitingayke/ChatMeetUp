import React, { useContext, useEffect, useState, forwardRef } from 'react';
import UserContext from './../context/UserContext';
import { connectToUser, getTotalConnectionData, joinGroup } from './../services/userchatService';
import { useSnackbar } from 'notistack';
import LeftSidebar from './SidebarLayout/LeftSidebar';
import { Link, useNavigate } from 'react-router-dom';
import AuthOptions from './AuthOptions';
import { PersonAdd, Search, ArrowDropDown, ArrowDropUp, Group, Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { Avatar, CircularProgress, Dialog, DialogContent, DialogActions, DialogTitle, Button, Slide, Menu, MenuItem, Fade, Tooltip } from '@mui/material'

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function JoinComponent() {

    const navigate = useNavigate();
    const { loginUser } = useContext(UserContext);

    const [searchQuery, setSearchQuery] = useState("");
    const [totalConnections, setTotalConnections] = useState([]);

    const [groupJoinId, setGroupJoinId] = useState("");
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [groupPassword, setGroupPassword] = useState("");
    const [isShowPassword, setIsShowPassword] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const { enqueueSnackbar } = useSnackbar();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Users');

    const connectedUserIds = loginUser?.connections?.map(connection =>
        connection?.user1?._id === loginUser?._id ? connection?.user2?._id : connection?.user1?._id
    );
    const connectedGroupIds = loginUser?.groups?.map(group => group?._id);

    const handleClose = (filter) => {
        if (filter) setSelectedFilter(filter);
        setAnchorEl(null);
    };

    const handleFetchData = async () => {
        try {
            setIsLoading(true);

            const response = await getTotalConnectionData([...connectedUserIds, loginUser?._id], connectedGroupIds);

            if (response?.success) {
                setTotalConnections({ users: response.users, groups: response.groups });
            } else {
                enqueueSnackbar(response?.message || 'Failed to fetch data', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error?.message || 'An error occurred while fetching data', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {

        if (!loginUser) return;

        handleFetchData();
    }, [loginUser]);

    const handleGroupJoinPassword = (groupProfile) => {
        setGroupJoinId(groupProfile?._id);
        if (groupProfile?.password) {
            setPasswordDialog(true);
        } else {
            handleGroupJoin();
        }
    }

    const handleGroupJoin = async () => {

        if (!groupJoinId || !loginUser) {
            enqueueSnackbar('Group not found, please try again.', { variant: 'error' });
            return;
        }

        try {
            setIsLoading(true);
            setPasswordDialog(false);

            const response = await joinGroup(groupJoinId, loginUser?._id, groupPassword);

            if (response?.success) {
                setTotalConnections((prev) => ({
                    ...prev,
                    groups: prev.groups.filter((group) => group._id !== groupJoinId),
                }));
                enqueueSnackbar(`Successfully joined the group.`, { variant: 'success' });
            } else {
                enqueueSnackbar(response?.message || 'Failed to join the group.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error?.message || 'An error occurred while joining the group.', { variant: 'error' });
        } finally {
            setGroupPassword("");
            setIsLoading(false);
        }
    }

    const handleUserConnection = async (remoteUserId) => {

        if (!remoteUserId || !loginUser) {
            enqueueSnackbar('User not found, please try again.', { variant: 'error' });
            return;
        }

        try {
            setIsLoading(true);
            const response = await connectToUser(remoteUserId, loginUser?._id);

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

    const filteredData = totalConnections[selectedFilter.toLowerCase()]?.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleSelectedComponent = () => {
        return (
            <ul className="space-y-4">
                {filteredData
                    .filter((item) => item?._id !== loginUser?._id)
                    .map((item) => (
                        <li key={item?._id} className="p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition duration-300 shadow-md border border-gray-700 flex space-x-3">

                            <Link to={selectedFilter === "Users" ? `/u/profile/${item?.username}` : `/community/${item?._id}`} className='h-fit'>
                                <Avatar
                                    src={item?.image || "/default-avatar.png"}
                                    sx={{ height: "3rem", width: "3rem" }}
                                    // alt={selectedFilter === "Users" ? item?.username : item?.name}
                                    className='sticky top-0 left-0'
                                />
                            </Link>

                            <div className="flex gap-4 flex-1">

                                <div className="flex-1">
                                    <Link to={selectedFilter === "Users" ? `/u/profile/${item?.username}` : `/community/${item?._id}`}>
                                        <h2 className="text-lg text-white" style={{ fontWeight: '600' }}>{selectedFilter === "Users" ? item?.username : item?.name}</h2>
                                    </Link>
                                    {
                                        selectedFilter === "Users" && <p className="text-sm text-gray-400">{item?.email}</p>
                                    }
                                    <i className="text-sm text-gray-400" style={{ fontStyle: 'italic' }}>"{item?.description || "No bio available"}"</i>

                                    {selectedFilter === "Groups" && (
                                        <div className='flex items-center space-x-2 mt-1'>
                                            <p className="text-sm bg-orange-500 text-white px-3 py-1 rounded-lg w-fit">
                                                <span className='me-2'>
                                                    {item?.members?.length || 1}
                                                </span>
                                                Members
                                            </p>
                                            {
                                                (item?.password) && <Tooltip title="This group is password protected">
                                                    <Lock className="text-gray-500" sx={{ fontSize: "1.1rem" }} />
                                                </Tooltip>
                                            }

                                        </div>
                                    )}

                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={selectedFilter === "Users" ? () => handleUserConnection(item?._id) : () => handleGroupJoinPassword(item)} className="text-sm rounded-lg px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-orange-500 transition flex items-center gap-2 cursor-pointer">
                                            <PersonAdd sx={{ fontSize: "1.2rem" }} />
                                            <span>{selectedFilter === "Users" ? "Connect" : "Join Group"}</span>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </li>
                    ))}
            </ul>
        );
    };

    return (
        <>
            <div className='bg-gradient-to-r from-black to-gray-800 md:bg-none'>
                <LeftSidebar />
            </div>

            <div className='flex-1 bg-gradient-to-r from-black to-gray-800 h-full overflow-auto'>

                <header className='h-fit sticky top-0 p-4 md:flex items-center justify-center w-full z-10 bg-gradient-to-r from-black to-gray-800 sm:space-x-2'>
                    <div className='flex justify-between items-center'>
                        <h1 className='text-2xl text-orange-500 flex items-center md:border md:px-3 rounded'
                            style={{ fontWeight: "800" }}>
                            Join
                        </h1>
                        <div className='flex md:hidden text-gray-300 items-center space-x-1'>
                            <span className='text-sm'>{filteredData?.length || 0}</span>
                            <Group sx={{ fontSize: '1.2rem' }} />
                        </div>
                    </div>

                    <div className='flex space-x-2 w-full md:w-fit mt-2 md:mt-0'>
                        <div className='flex flex-nowrap border border-gray-500 rounded flex-1'>
                            <input type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className='flex-1 p-1 text-sm md:w-[22rem] lg:w-[31rem]' />
                            <button className='py-1 px-2 text-gray-500 bg-gray-800 rounded-e hover:bg-gray-700 hover:text-white cursor-pointer'>
                                <Search sx={{ fontSize: "1.3rem" }} />
                            </button>
                        </div>

                        <button onClick={(e) => setAnchorEl(e.currentTarget)} className='border px-3 py-1 text-md rounded border-gray-500 cursor-pointer flex flex-nowrap' >
                            <span className='whitespace-nowrap'>{selectedFilter}</span>
                            {open ? <ArrowDropUp /> : <ArrowDropDown />}
                        </button>
                    </div>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                        TransitionComponent={Fade}
                        sx={{ marginTop: '0.2rem' }}
                    >
                        <MenuItem onClick={() => handleClose("Users")}>
                            <span className='px-3'>Users</span>
                        </MenuItem>
                        <MenuItem onClick={() => handleClose("Groups")}>
                            <span className='px-3'>Groups</span>
                        </MenuItem>
                    </Menu>
                </header>

                {
                    (isLoading)
                        ? <div className='mt-15 text-gray-500 flex justify-center space-x-5 items-center'>
                            <CircularProgress size={30} />
                            <span>Loading...</span>
                        </div>
                        : <div className="p-4 mx-auto flex-1 md:w-[37rem] lg:w-[46rem]">
                            {filteredData?.length > 0 ? (
                                <ul className="space-y-3 pb-15">
                                    {
                                        handleSelectedComponent()
                                    }
                                </ul>
                            ) : (
                                <div className="text-center text-gray-500 text-lg mt-10">
                                    No <span className='text-white break-words'>{searchQuery}</span> {selectedFilter} available to join.
                                </div>
                            )}
                        </div>
                }
            </div>

            <Dialog
                open={passwordDialog}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setPasswordDialog(false)}
                aria-describedby="alert-dialog-slide-description"
            >

                <DialogTitle className='text-gray-500' >This Group is Password Protected</DialogTitle>
                <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <div className="border w-full flex items-center p-1 rounded">
                        <input
                            type={isShowPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="flex-1 px-2 py-1 outline-none"
                            value={groupPassword}
                            onChange={(e) => setGroupPassword(e.target.value)}
                            title='Group password'
                        />

                        <button
                            type="button"
                            onClick={() => setIsShowPassword(!isShowPassword)}
                            className="p-2 cursor-pointer focus:outline-none text-gray-500"
                            aria-label={isShowPassword ? "Hide password" : "Show password"}
                        >
                            {!isShowPassword ? <Visibility /> : <VisibilityOff />}
                        </button>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialog(false)} sx={{ color: "gray", borderColor: "gray" }} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (groupPassword.length >= 8 && groupPassword.length <= 30) {
                                handleGroupJoin();
                            } else {
                                enqueueSnackbar("Password must be between 8 and 30 characters", { variant: "info" });
                            }
                        }}
                        sx={{
                            backgroundColor: groupPassword.length >= 8 && groupPassword.length <= 30 ? "#00c500" : "#d32f2f",
                            color: "white",
                        }}
                        variant="contained"
                    >
                        Join
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}