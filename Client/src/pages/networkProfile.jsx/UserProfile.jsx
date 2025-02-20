import React, { useContext, useEffect, useState, forwardRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { connectToUser, getUserProfile } from '../../services/userchatService';
import UserContext from '../../context/UserContext';
import AuthOptions from '../../components/AuthOptions';
import { Avatar, CircularProgress, Dialog, DialogContent, Slide } from '@mui/material';
import { VideoCall, PersonAdd } from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import LeftSidebar from '../../components/SidebarLayout/LeftSidebar';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function UserProfile() {

    const navigate = useNavigate();
    const { id } = useParams();
    const { loginUser } = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();

    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedComponent, setSelectedComponent] = useState("connections");
    const [isEditOn, setIsEditOn] = useState(false);

    const [description, setDescription] = useState(loginUser?.description || "");
    const [userMobileNo, setUserMobileNo] = useState(loginUser?.mobileNo || '');

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const response = await getUserProfile(id);
            if (response.success) {
                setUserProfile(response.user);
            } else {
                enqueueSnackbar(response.message || "Failed to fetch user data", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "An error occurred", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loginUser || !id) return;
        fetchUserProfile();
    }, [loginUser]);

    const userConnection = loginUser?.connections?.find(
        connection => connection?.user1?.username === id || connection?.user2?.username === id
    );

    const isUserConnected = Boolean(userConnection);

    const handleConnectUser = async () => {

        if (isUserConnected) {
            enqueueSnackbar('User are already joined.', { variant: 'info' });
            const userConnection = loginUser?.connections?.find(
                connection => connection?.user1?.username === id || connection?.user2?.username === id
            );
            navigate(`/u/chatting/${userConnection?._id}`);
            return;
        }

        try {
            setIsLoading(true);
            const response = await connectToUser(userProfile?._id, loginUser?._id);

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

    const handleCancelButton = () => {
        setDescription("");
        setUserMobileNo();
        setIsEditOn(false);
    }

    const handleSaveButton = () => {
        try {
            setIsLoading(true);
            
        } catch (error) {
            enqueueSnackbar(error.message || "Unable to edit user data, please try again.", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    if (!loginUser) {
        return <AuthOptions />;
    }

    if (!userProfile) {
        return (
            <div className='h-full border w-full flex justify-center items-center text-gray-500 text-3xl bg-gradient-to-r from-black to-gray-800'>
                User Not Found, please try again.
            </div>
        )
    }

    const getListComponent = () => {
        const joinConnectionFilter = userProfile.connections.filter(connection =>
            connection?.user1?._id === loginUser?._id ||
            connection?.user2?._id === loginUser?._id
        );

        const joinGroupsFilter = userProfile?.groups?.filter(group =>
            group?.members?.some(member => member?.user === loginUser?._id)
        );

        let component = null;

        if (selectedComponent === 'connections') {
            component = joinConnectionFilter.length > 0 ? (
                <ul className="space-y-3">
                    {joinConnectionFilter.map((connection) => {
                        const chatUser = (connection.user1.username === id) ? connection.user2 : connection.user1;

                        return (
                            <li key={connection._id}>
                                <Link to={`/u/chatting/${connection?._id}`} className="flex items-center gap-4 p-3 border border-gray-700 rounded-lg shadow-sm hover:bg-[#80808023] cursor-pointer transition" >
                                    <Avatar src={chatUser.image} alt={chatUser.username} className="w-12 h-12" />

                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{chatUser.username}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-1">{chatUser.description || "No description available"}</p>
                                    </div>

                                    <span className="text-sm bg-orange-500 text-white px-2 py-1 rounded-full">
                                        {connection.messages.length} Messages
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-gray-500 text-center mt-10">No connections found.</p>
            );

        } else if (selectedComponent === 'groups') {
            component = joinGroupsFilter.length > 0 ? (
                <ul className="space-y-3">
                    {joinGroupsFilter.map((group) => (
                        <li key={group._id}>
                            <Link to={`/u/chatting/${group?._id}`} className="flex items-center gap-4 p-3 border border-gray-700 rounded-lg shadow-sm hover:bg-[#80808023] cursor-pointer transition" >
                                <Avatar src={group?.image} alt={group?.name} className="w-12 h-12" />

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{group?.name || "Unknown"}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-1">{group?.description || "No description available"}</p>
                                </div>

                                <span className="text-sm bg-orange-500 text-white px-2 py-1 rounded-full">
                                    {group?.members?.length || 1} Users
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center mt-10">No groups joined.</p>
            );
        }

        return component;
    };

    return (
        <div className='w-full h-full overflow-auto bg-gradient-to-r from-black to-gray-800'>

            <div className='block md:hidden sticky top-0 bg-gradient-to-r from-black to-gray-800 z-10'>
                <LeftSidebar />
            </div>

            <div className="w-full text-white flex flex-col items-center py-10">
                {isLoading ? (
                    <div className="flex justify-center items-center h-screen">
                        <CircularProgress color="inherit" />
                    </div>
                ) : (
                    userProfile && (
                        <div className="w-[90%] md:w-[50%]">

                            <div className="flex justify-center">
                                <Avatar
                                    src={userProfile.image || "#"}
                                    // alt={userProfile.username}
                                    sx={{ width: "10rem", height: "10rem", cursor: "pointer" }}
                                    className="border-2 border-gray-500 shadow-lg"
                                    onClick={() => {
                                        setSelectedImage(userProfile.image);
                                        setOpen(true);
                                    }}
                                />
                            </div>

                            <h2 className="text-2xl font-bold text-center mt-4">{userProfile.username}</h2>
                            <p className="text-center text-gray-400">{userProfile.email}</p>

                            {loginUser?._id !== userProfile?._id && <div className="grid grid-cols-2 gap-4 mt-6">
                                <button className="font-bold text-lg py-3 border border-gray-500 rounded flex items-center justify-center gap-2 bg-[#80808023] hover:bg-[#80808050] cursor-pointer">
                                    <VideoCall fontSize="small" /> Call
                                </button>

                                {
                                    (isUserConnected) ? <Link to={`/u/chatting/${userConnection?._id}`} className="font-bold text-lg py-3 border border-gray-500 rounded flex items-center justify-center gap-2 bg-[#80808023] hover:bg-[#80808050] cursor-pointer">
                                        <VisibilityIcon fontSize="small" /> View
                                    </Link>
                                        : <button onClick={handleConnectUser} className="font-bold text-lg py-3 border border-gray-500 rounded flex items-center justify-center gap-2 bg-[#80808023] hover:bg-[#80808050] cursor-pointer">
                                            <PersonAdd fontSize="small" /> Join
                                        </button>
                                }
                            </div>}

                            <div className='mt-4'>
                                <p>About: </p>
                                {
                                    (isEditOn && loginUser?.username === id)
                                        ? <div>
                                            <div className='flex items-center border p-1 rounded border-gray-500'>
                                                <input
                                                    type="text"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder={`"Hi, I am using ChatMeetUp! Let's connect. 😊"`}
                                                    className="text-gray-500 flex-1"
                                                />
                                                <span className='text-sm ps-2 pe-1'>{200 - description.length}</span>
                                            </div>
                                            {(200 - description.length <= 0) && <p className='text-sm text-red-500 pt-1' style={{ fontStyle: 'italic' }}>You crossed the limit.</p>}
                                        </div>
                                        : <p className="text-gray-500 italic break-words" style={{ fontStyle: 'italic' }}>"{userProfile.description || "none"}"</p>
                                }
                            </div>

                            <div className='mt-4 mb-3'>
                                <p>Mobile No: </p>
                                {
                                    (isEditOn && loginUser?.username === id)
                                        ? <input
                                            type="number"
                                            value={userMobileNo}
                                            onChange={(e) => setUserMobileNo(e.target.value)}
                                            placeholder={'+91 00000 00000'}
                                            className="text-gray-500 border p-1 rounded"
                                        />
                                        : <p className="text-gray-500 italic" style={{ fontStyle: 'italic' }}>
                                            {userProfile?.mobileNo ?? '+91 00000 00000'}
                                        </p>
                                }

                            </div>

                            {isEditOn && <div className='space-x-3'>
                                <button onClick={handleSaveButton} className='border rounded px-5 py-1 text-green-500 bg-[#00800030] hover:bg-[#00800055] cursor-pointer'>Save</button>
                                <button onClick={handleCancelButton} className='border rounded px-4 py-1 bg-[#80808030] hover:bg-[#80808055] cursor-pointer'>Cancel</button>
                            </div>}

                            {(loginUser?.username === id && !isEditOn) && <buttton onClick={() => setIsEditOn(true)} className="border mt-10 rounded px-5 py-1 text-gray-500 cursor-pointer">Edit</buttton>}

                            <div className="grid grid-cols-3 justify-between mt-6 space-x-2">
                                <div className="text-center border border-gray-500 rounded p-2 bg-[#80808023]">
                                    <p className="text-xl font-bold">{userProfile.connections.length}</p>
                                    <p className="text-gray-400 break-words">Connections</p>
                                </div>
                                <div className="text-center border border-gray-500 rounded p-2 bg-[#80808023]">
                                    <p className="text-xl font-bold">{userProfile.groups.length}</p>
                                    <p className="text-gray-400">Join Groups</p>
                                </div>
                                <div className="text-center border border-gray-500 rounded p-2 bg-[#80808023]">
                                    <p className="text-xl font-bold">{userProfile.blockUser.length}</p>
                                    <p className="text-gray-400">Blocked</p>
                                </div>
                            </div>

                            <div className='mt-5'>
                                <ul className="flex justify-between w-full space-x-2">
                                    {["connections", "groups"].map((tab) => (
                                        <li key={tab} className="flex-1">
                                            <button
                                                onClick={() => setSelectedComponent(tab)}
                                                className={`${selectedComponent === tab && 'bg-[#80808023] text-orange-500'} border border-gray-500 px-3 w-full rounded py-1 cursor-pointer`}
                                            >
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>


                                <div className='mt-2'>
                                    {
                                        getListComponent()
                                    }
                                </div>
                            </div>
                        </div>
                    )
                )}

                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => setOpen(false)}
                    aria-describedby="alert-dialog-slide-description"
                    PaperProps={{
                        sx: { backgroundColor: "transparent", boxShadow: "none" }
                    }}
                >
                    <DialogContent
                        className="flex justify-center items-center"
                        sx={{ backgroundColor: "transparent", padding: 0 }}
                    >
                        <Avatar
                            alt="User Image"
                            src={selectedImage}
                            className="border-2 border-gray-500 shadow-lg"
                            sx={{ width: "15rem", height: "15rem" }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
