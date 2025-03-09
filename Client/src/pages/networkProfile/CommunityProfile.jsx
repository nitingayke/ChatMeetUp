import React, { useContext, useEffect, useState, forwardRef, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { PersonAdd, GroupAdd, ExitToApp, Close, SentimentSatisfiedAlt, Visibility, VisibilityOff, PhotoCameraOutlined } from "@mui/icons-material";
import { Avatar, CircularProgress, Dialog, DialogContent, DialogActions, DialogTitle, Button, Slide } from '@mui/material';

import { connectToUser, getGroupProfile, joinGroup, leaveGroup } from '../../services/userchatService';
import LeftSidebar from '../../components/SidebarLayout/LeftSidebar';
import { userExitGroup } from '../../services/chatService';
import UserContext from '../../context/UserContext';
import AuthOptions from '../../components/AuthOptions';
import { changeGroupDetails } from '../../services/groupService';
import EmojiPicker from 'emoji-picker-react';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function CommunityProfile() {

    const navigate = useNavigate();
    const { id } = useParams();
    const { loginUser } = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();

    const [groupProfile, setGroupProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);

    const [passwordDialog, setPasswordDialog] = useState(false);
    const [groupPassword, setGroupPassword] = useState("");
    const [isShowPassword, setIsShowPassword] = useState(false);

    const [isEditOn, setIsEditOn] = useState(false);
    const [newDescription, setNewDescription] = useState(groupProfile?.description || "");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [newImage, setNewImage] = useState(null);

    const fileInputRef = useRef(null);

    const fetchGroupProfile = async () => {
        try {
            setIsLoading(true);
            const response = await getGroupProfile(id);
            if (response.success) {
                setGroupProfile(response.group);
                const member = response?.group?.members.find(member => member.user._id === loginUser?._id);

                if (member) {
                    setIsAdmin(member?.role === 'admin');
                }
                setNewDescription(response.group.description);
            } else {
                enqueueSnackbar(response.message || "Failed to fetch group data", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "An error occurred", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loginUser || !id) return;
        fetchGroupProfile();
    }, [loginUser || id]);

    const isUserInGroup = groupProfile?.members?.some(member => member?.user?._id === loginUser?._id);
    const connectedUsersId = loginUser?.connections?.map(connection => {
        return connection?.user1?._id === loginUser?._id ? connection?.user2?._id : connection?.user1?._id;
    });

    const handleConnectUser = async (remoteId) => {

        if (connectedUsersId.includes(remoteId)) {
            enqueueSnackbar('User are already joined.', { variant: 'info' });
            const userConnection = loginUser?.connections?.find(
                connection => connection?.user1?._id === remoteId || connection?.user2?._id === remoteId
            );
            navigate(`/u/chatting/${userConnection?._id}`);
            return;
        }

        try {
            setIsLoading(true);
            const response = await connectToUser(remoteId, loginUser?._id);

            if (response.success) {
                navigate(`/u/chatting/${response?.connectionId}`);
            } else {
                enqueueSnackbar(response.message || "Can not connect to user, please try again.", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "Can not connect to user, please try again.", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGroupJoinPassword = () => {

        if (groupProfile?.password) {
            setPasswordDialog(true);
        } else {
            handleJoinGroup();
        }
    }

    const handleJoinGroup = async () => {

        try {
            setIsLoading(true);
            setPasswordDialog(false);
            setGroupPassword("");

            const response = await joinGroup(groupProfile?._id, loginUser?._id, groupPassword);

            if (response.success) {
                setGroupProfile(prev => ({
                    ...prev,
                    members: [...prev.members, response.user],
                }));
                enqueueSnackbar(`User joined '${groupProfile?.name}' successfully.`, { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || 'Failed to join the group.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'An error occurred while joining the group.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveGroup = async () => {
        try {
            setIsLoading(true);

            const response = await leaveGroup(groupProfile._id, loginUser._id);

            if (response.success) {
                setGroupProfile(prev => ({
                    ...prev,
                    members: prev.members.filter(member => member?.user._id !== response?.userId),
                }));

                setIsAdmin(false);
                enqueueSnackbar(`You left '${groupProfile?.name}' successfully.`, { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || 'Failed to leave the group.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'An error occurred while leaving the group.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotifyDeleteUser = async (user) => {
        setDeleteUser(user);
        setIsDialogOpen(true);
    }

    const handleUserRemove = async () => {

        if (!deleteUser?.user || !groupProfile?._id) {
            enqueueSnackbar("Invalid user or group data.", { variant: "error" });
            return;
        }

        try {
            setIsLoading(true);
            const response = await userExitGroup(groupProfile?._id, deleteUser?.user?._id);

            if (response.success) {
                setGroupProfile((prev) => ({
                    ...prev,
                    members: prev?.members?.filter((member) => member?.user?._id !== deleteUser?.user?._id)
                }));
                enqueueSnackbar("Successfully removed user from the group.", { variant: "success" });
            } else {
                enqueueSnackbar(response.message || "Failed to exit the group.", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
        }
    };

    const handleGroupProfileUpdate = async () => {
        try {
            setIsLoading(true);
            setIsEditOn(false);

            const response = await changeGroupDetails(groupProfile?._id, newDescription, newImage);

            if (response?.success === true) {
                enqueueSnackbar("Group profile updated successfully!", { variant: 'success' });

                setGroupProfile((prev) => ({
                    ...prev,
                    description: newDescription,
                    image: newImage ? URL.createObjectURL(newImage) : prev.image
                }));
            } else {
                enqueueSnackbar(response?.message || "Failed to update group profile", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error?.message || "Something went wrong!", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        if (emojiObject) {
            setNewDescription((prev) => prev + emojiObject.emoji);
            setShowEmojiPicker(false);
        }
    };

    if (!loginUser) {
        return <AuthOptions />;
    }

    if (!groupProfile) {
        return (
            <div className='border h-full w-full flex justify-center items-center p-3 text-gray-500 text-xl text-center bg-gradient-to-r from-black to-gray-800'>
                <h1>Group Not Found, please try again.</h1>
            </div>
        )
    }

    return (
        <div className='w-full overflow-auto h-full bg-gradient-to-r from-black to-gray-800'>
            <div className='block md:hidden sticky top-0 z-10 bg-gradient-to-r from-black to-gray-800'>
                <LeftSidebar />
            </div>

            <div className="w-full p-4 text-white flex flex-col items-center py-10 overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-screen">
                        <CircularProgress color="inherit" />
                    </div>
                ) : (
                    groupProfile && (
                        <div className="w-full md:w-[50%]">

                            <div className="relative flex justify-center">
                                <Avatar
                                    src={(isEditOn && newImage) ? URL.createObjectURL(newImage) : (groupProfile.image || "/default-group.png")}
                                    // alt={groupProfile.name}
                                    sx={{ width: "10rem", height: "10rem", cursor: "pointer" }}
                                    className="border-2 border-gray-500 shadow-lg"
                                    onClick={() => {
                                        setSelectedImage(groupProfile.image);
                                        setOpen(true);
                                    }}
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => handleImageChange(e)}
                                />

                                {
                                    (isEditOn) && <button
                                        className='absolute h-full opacity-60 bg-gray-400 hover:bg-gray-500 rounded-full w-[10rem] cursor-pointer'
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <PhotoCameraOutlined sx={{ fontSize: '5rem' }} />
                                    </button>
                                }

                            </div>

                            <h2 className="text-2xl text-center mt-4 hover:text-blue-500 w-fit mx-auto mb-2" >
                                <Link to={`/u/chatting/${groupProfile?._id}`} style={{fontWeight: '700'}}>{groupProfile?.name}</Link>
                            </h2>

                            {
                                (!isEditOn) && <div className='text-center md:flex justify-center items-center'>
                                    <p className="text-center break-words text-gray-400">{groupProfile.description || "No description available"}</p>
                                    {
                                        isAdmin && <button onClick={() => setIsEditOn(true)} className='border text-gray-500 hover:text-white cursor-pointer h-fit text-sm rounded px-3 py-1 md:ms-2 mt-1 md:mt-0'>Edit</button>
                                    }
                                </div>
                            }

                            {
                                (isAdmin && isEditOn) && <div className='text-sm text-center sm:flex items-center justify-center w-full space-x-2'>

                                    <div className='flex-1 flex space-x-2 mb-2 sm:mb-0'>
                                        <input
                                            type="text"
                                            placeholder='Enter Description'
                                            className='flex-1 p-1 border rounded border-gray-500'
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                        />
                                        <button onClick={() => setShowEmojiPicker(true)} className='border p-1 rounded text-gray-500 cursor-pointer'>
                                            <SentimentSatisfiedAlt sx={{ fontSize: '1.2rem' }} />
                                        </button>
                                    </div>
                                    <button onClick={() => setIsEditOn(false)} className='border p-1 rounded border-gray-500 bg-[#80808020] text-white cursor-pointer'>Cancel</button>
                                    <button onClick={handleGroupProfileUpdate} className='border p-1 rounded border-gray-500 bg-[#00ff0020] text-green-500 cursor-pointer'>Save</button>
                                </div>
                            }


                            {showEmojiPicker && (
                                <Dialog
                                    open={showEmojiPicker}
                                    onClose={() => setShowEmojiPicker(false)}
                                    sx={{ color: "#fff", zIndex: 50, backdropFilter: "blur(5px)" }}
                                >
                                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                                </Dialog>
                            )}


                            <div className="mt-6">
                                {isUserInGroup ? (
                                    <button onClick={handleLeaveGroup} className="w-full font-bold text-lg py-3 rounded flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 cursor-pointer">
                                        <ExitToApp fontSize="small" /> Leave Group
                                    </button>
                                ) : (
                                    <button onClick={handleGroupJoinPassword} className="w-full font-bold text-lg py-3 rounded flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer">
                                        <GroupAdd fontSize="small" /> Join Group
                                    </button>
                                )}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold">Group Members ({groupProfile.members.length})</h3>
                                <ul className="mt-3 space-y-2">
                                    {groupProfile?.members?.map((member) => (
                                        <li key={member.user._id} className="flex items-center gap-4 p-2 border border-gray-700 rounded-lg shadow-sm">
                                            <Avatar src={member.user.image} alt="User" className="w-10 h-10" />
                                            <div className="flex-1">
                                                <p className="font-semibold">{member.user.username}</p>
                                                <p className={`text-sm ${member.role === 'admin' ? 'text-orange-500' : 'text-gray-400'}`}>
                                                    {member.role}
                                                </p>
                                                {
                                                    (loginUser?._id !== member?.user?._id && isAdmin) && <button onClick={() => handleNotifyDeleteUser(member)} className='text-sm text-red-500 bg-[#ff000020] flex items-center border px-1 mt-1 rounded cursor-pointer'>
                                                        <Close className='text-sm' sx={{ fontSize: '1rem' }} />
                                                        <span>Remove</span>
                                                    </button>
                                                }
                                            </div>
                                            {
                                                (loginUser?._id !== member?.user?._id) && ((connectedUsersId?.includes(member.user._id))
                                                    ? <button className='rounded px-3 py-2 flex items-center cursor-pointer bg-[#80808023] text-sm'>
                                                        <PersonAdd sx={{ fontSize: '1rem' }} className='me-1' />Connected
                                                    </button>
                                                    : <button onClick={() => handleConnectUser(member.user._id)} className='rounded px-3 py-1 flex items-center cursor-pointer bg-green-500 hover:bg-green-600 text-sm'>
                                                        <PersonAdd sx={{ fontSize: '1rem' }} className='me-1' />Join
                                                    </button>)
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold">Total Messages</h3>
                                <p className="text-gray-400 text-sm">{groupProfile.messages.length} messages in this group.</p>
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
                            alt="Group Image"
                            src={selectedImage}
                            className="border-2 border-gray-500 shadow-lg"
                            sx={{ width: "15rem", height: "15rem" }}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isDialogOpen}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => setIsDialogOpen(false)}
                    aria-describedby="alert-dialog-slide-description"
                >

                    <DialogTitle>Remove User from {groupProfile?.name}?</DialogTitle>
                    <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar src={deleteUser?.user?.image} alt={deleteUser?.user?.username} sx={{ width: 50, height: 50 }} />
                        <span className='text-xl' style={{ fontWeight: '800' }}>{deleteUser?.user?.username}</span>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDialogOpen(false)} sx={{ color: "gray", borderColor: "gray" }} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleUserRemove} sx={{ backgroundColor: "red", color: "white" }} variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

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
                                {isShowPassword ? <Visibility /> : <VisibilityOff />}
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
                                    handleJoinGroup();
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
            </div>
        </div>
    );
}
