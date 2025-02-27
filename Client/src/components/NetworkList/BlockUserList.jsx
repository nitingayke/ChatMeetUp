import React, { forwardRef, useContext, useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import CircularProgress from '@mui/material/CircularProgress';

import UserContext from '../../context/UserContext';
import { blockUsersData, setUnblockUser } from '../../services/userchatService';
import { useSnackbar } from 'notistack';
import LeftSidebar from '../SidebarLayout/LeftSidebar';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function BlockUserList() {

    const [selectedImage, setSelectedImage] = useState("");
    const [open, setOpen] = useState(false);
    const [blockUsers, setBlockUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { loginUser } = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();

    const handleBlockUsersData = async () => {

        if (!loginUser?.blockUser || loginUser.blockUser.length === 0) {
            enqueueSnackbar("No user blocked", { variant: "info" });
            return;
        }

        try {
            setIsLoading(true);
            const response = await blockUsersData(loginUser?.blockUser || [], loginUser._id);

            if (response?.success) {
                setBlockUsers(response.users);
            } else {
                enqueueSnackbar("Failed to fetch blocked users", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "Something went wrong", { variant: "error" });
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {

        if (!loginUser?.blockUser) return;

        handleBlockUsersData();
    }, [loginUser]);

    const handleSelectedImage = (img) => {
        setSelectedImage(img);
        setOpen(true);
    }

    const handleUnblockUser = async (blockUserId) => {
        if (!loginUser) {
            enqueueSnackbar("User not logged in, please login first.", { variant: 'error' });
            return;
        }

        try {
            setIsLoading(true);

            const response = await setUnblockUser(blockUserId, loginUser._id);

            if (response.success) {
                setBlockUsers((prev) => prev.filter(user => user._id !== response.blockUserId));
                enqueueSnackbar("User successfully unblocked.", { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || "Failed to unblock user.", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "Something went wrong while unblocking.", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };


    const filteredUsers = blockUsers.filter(user =>
        user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <div className='bg-gradient-to-r from-black to-gray-800 md:bg-none'>
                <LeftSidebar />
            </div>

            <div className='h-screen md:flex flex-col items-center w-full text-white min-h-screen bg-gradient-to-r from-black to-gray-800 overflow-auto'>

                <header className='sm:flex items-center justify-center sticky top-0 w-full p-4 z-10 bg-gradient-to-r from-black to-gray-800 sm:space-x-2'>
                    <h1 className='text-2xl text-orange-500 flex items-center font-bold'
                        style={{ fontWeight: "800" }}>
                        <BlockIcon className='me-1 text-gray-500' sx={{ fontSize: '1.8rem' }} /> Block Users
                    </h1>
                    <div className='mt-2 sm:mt-0 flex flex-nowrap border border-gray-500 rounded'>
                        <input type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className='flex-1 p-1 text-sm sm:min-w-[20rem]' />
                        <button className='py-1 px-2 text-gray-500 bg-gray-800 rounded-e hover:bg-gray-700 hover:text-white cursor-pointer'>
                            <SearchIcon sx={{ fontSize: "1.3rem" }} />
                        </button>
                    </div>
                </header>

                {(isLoading)
                    ? <div className='mt-16'><CircularProgress sx={{ color: 'white' }} /></div>
                    : <ul className='md:w-[30rem] p-3 space-y-6 pb-30'>
                        {
                            (filteredUsers.length == 0)
                                ? <div className="text-center text-gray-400 mt-6">No users found.</div>
                                : filteredUsers.map((data) => (
                                    <li key={data?._id} className='relative flex flex-col items-center p-5 rounded-lg bg-black shadow-lg'>

                                        <button className='absolute -top-3' onClick={() => handleSelectedImage(data?.image)}>
                                            <Avatar
                                                alt={data?.username || data?.name}
                                                src={data?.image}
                                                className='border-2 border-gray-500 shadow-lg'
                                            />
                                        </button>

                                        <div className='flex flex-col items-center pt-5 text-center space-y-2'>
                                            <h1 className='text-lg font-semibold'>{data?.username || data?.name}</h1>
                                            <p className='text-sm text-gray-400'>{data.description || <span className='text-gray-700'>User has not added a description.</span>}</p>
                                        </div>

                                        <button onClick={() => handleUnblockUser(data?._id)} className='text-sm h-fit rounded bg-gray-700 px-4 py-2 hover:bg-green-500 mt-4 cursor-pointer transition'>
                                            Unblock
                                        </button>
                                    </li>
                                ))
                        }
                    </ul>
                }
            </div>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setOpen(false)}
                aria-describedby="alert-dialog-slide-description"
                PaperProps={{
                    sx: { backgroundColor: "transparent", boxShadow: "none" } // Remove Dialog Background & Shadow
                }}
            >
                <DialogContent
                    className="flex justify-center items-center"
                    sx={{ backgroundColor: "transparent", padding: 0 }}
                >
                    <Avatar
                        alt="Unknown"
                        src={selectedImage}
                        className="border-2 border-gray-500 shadow-lg"
                        sx={{ width: "15rem", height: "15rem" }}
                    />
                </DialogContent>
            </Dialog>

        </>
    );
}

