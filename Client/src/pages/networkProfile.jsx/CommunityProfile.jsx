import React, { useContext, useEffect, useState, forwardRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { PersonAdd } from "@mui/icons-material";
import UserContext from '../../context/UserContext';
import AuthOptions from '../../components/AuthOptions';
import { Avatar, CircularProgress, Dialog, DialogContent, Slide } from '@mui/material';
import { GroupAdd, ExitToApp } from "@mui/icons-material";
import { connectToUser, getGroupProfile, joinGroup, leaveGroup } from '../../services/userchatService';
import LeftSidebar from '../../components/SidebarLayout/LeftSidebar';

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

    const fetchGroupProfile = async () => {
        try {
            setIsLoading(true);
            const response = await getGroupProfile(id);
            if (response.success) {
                setGroupProfile(response.group);
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
    }, [loginUser]);

    const isUserInGroup = groupProfile?.members?.some(member => member?.user?._id === loginUser?._id);
    const connectedUsersId = loginUser?.connections?.map(connection => {
        return connection?.user1?._id === loginUser?._id ? connection?.user2?._id : connection?.user1?._id;
    });

    const handleConnectUser = async (remoteId) => {

        if (connectedUsersId.includes(remoteId)) {
            enqueueSnackbar('User are already joined.', { variant: 'info' });
            const userConnection = loginUser?.connections?.find(
                connection => connection?.user1?.username === id || connection?.user2?.username === id
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

    const handleJoinGroup = async () => {
        try {
            setIsLoading(true);

            const response = await joinGroup(groupProfile?._id, loginUser?._id);

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


    if (!loginUser) {
        return <AuthOptions />;
    }

    if (!groupProfile) {
        return (
            <div className='border h-full w-full flex justify-center items-center text-gray-500 text-3xl bg-gradient-to-r from-black to-gray-800'>
                Group Not Found, please try again.
            </div>
        )
    }

    return (
        <div className='w-full overflow-auto h-full bg-gradient-to-r from-black to-gray-800'>
            <div className='block md:hidden sticky top-0 z-10 bg-gradient-to-r from-black to-gray-800'> 
                <LeftSidebar/>
            </div>

            <div className="w-full p-4 text-white flex flex-col items-center py-10 overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-screen">
                        <CircularProgress color="inherit" />
                    </div>
                ) : (
                    groupProfile && (
                        <div className="w-full md:w-[50%]">

                            <div className="flex justify-center">
                                <Avatar
                                    src={groupProfile.image || "/default-group.png"}
                                    // alt={groupProfile.name}
                                    sx={{ width: "10rem", height: "10rem", cursor: "pointer" }}
                                    className="border-2 border-gray-500 shadow-lg"
                                    onClick={() => {
                                        setSelectedImage(groupProfile.image);
                                        setOpen(true);
                                    }}
                                />
                            </div>

                            <Link to={`/u/chatting/${groupProfile?._id}`}>
                                <h2 className="text-2xl font-bold text-center mt-4">{groupProfile.name}</h2>
                            </Link>
                            <p className="text-center text-gray-400">{groupProfile.description || "No description available"}</p>

                            <div className="mt-6">
                                {isUserInGroup ? (
                                    <button onClick={handleLeaveGroup} className="w-full font-bold text-lg py-3 rounded flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 cursor-pointer">
                                        <ExitToApp fontSize="small" /> Leave Group
                                    </button>
                                ) : (
                                    <button onClick={handleJoinGroup} className="w-full font-bold text-lg py-3 rounded flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer">
                                        <GroupAdd fontSize="small" /> Join Group
                                    </button>
                                )}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold">Group Members ({groupProfile.members.length})</h3>
                                <ul className="mt-3 space-y-2">
                                    {groupProfile?.members?.slice()?.reverse().map((member) => (
                                        <li key={member.user._id} className="flex items-center gap-4 p-2 border border-gray-700 rounded-lg shadow-sm">
                                            <Avatar src={member.user.image} alt="User" className="w-10 h-10" />
                                            <div className="flex-1">
                                                <p className="font-semibold">{member.user.username}</p>
                                                <p className={`text-sm ${member.role === 'admin' ? 'text-orange-500' : 'text-gray-400'}`}>
                                                    {member.role}
                                                </p>
                                            </div>
                                            {
                                                (loginUser?._id !== member?.user?._id) && ((connectedUsersId?.includes(member.user._id))
                                                    ? <button className='rounded px-3 py-1 flex items-center cursor-pointer bg-[#80808023]'>
                                                        <PersonAdd sx={{ fontSize: '1.2rem' }} className='me-1' />Connected
                                                    </button>
                                                    : <button onClick={() => handleConnectUser(member.user._id)} className='rounded px-3 py-1 flex items-center cursor-pointer bg-green-500 hover:bg-green-600'>
                                                        <PersonAdd sx={{ fontSize: '1.2rem' }} className='me-1' />Join
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
            </div>
        </div>
    );
}
