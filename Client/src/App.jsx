import React, { useContext, useEffect, useState } from 'react';

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Slide } from "@mui/material";

import ChatContextProvider from './context/ChatContextProvider';
import { getLoginUser } from './services/authService';
import UserContext from './context/UserContext';
import { useSnackbar } from "notistack";
import { socket } from './services/socketService';
import LoaderContext from './context/LoaderContext';
import AppRoutes from './AppRoutes';
import { useNavigate } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function App() {

    const navigate = useNavigate();

    const { loginUser, setLoginUser, setOnlineUsers } = useContext(UserContext);
    const { setIsMessageProcessing } = useContext(LoaderContext);
    const { enqueueSnackbar } = useSnackbar();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [invitationData, setInvitationData] = useState(null);

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchLoginUser = async () => {
            if (!token) return;

            try {
                const response = await getLoginUser();

                if (response.status === 200) {
                    setLoginUser(response.data.user);
                }
            } catch (error) {
                enqueueSnackbar('User not logged in.');
            }
        };

        fetchLoginUser();
    }, [token, setLoginUser, enqueueSnackbar]);

    useEffect(() => {
        if (loginUser) {
            socket.emit('user-online', { userId: loginUser._id });
        }
    }, [loginUser]);

    const handleUpdateOnlineUsers = (users) => {
        setOnlineUsers(users);
    };

    const handleErrorNotification = ({ message }) => {
        enqueueSnackbar(message, { variant: "error" });
        setIsMessageProcessing(false);
    };

    const handleVideoCallInvitation = ({ from, username }) => {
        setInvitationData({ userId: from, username });
        setIsDialogOpen(true);
    }

    useEffect(() => {

        socket.on("update-online-users", handleUpdateOnlineUsers);
        socket.on('error-notification', handleErrorNotification);
        socket.on('video-call-invitation', handleVideoCallInvitation);

        return () => {
            socket.off("update-online-users", handleUpdateOnlineUsers);
            socket.off('error-notification', handleErrorNotification);
            socket.off('video-call-invitation', handleVideoCallInvitation);
        };
    }, [setOnlineUsers]);

    const handleCallResponse = (action) => {

        setIsDialogOpen(false);

        if (!loginUser?._id) {
            enqueueSnackbar("Error processing the call response. Please try again.", { variant: "error" });
            return;
        }

        if(action === 'allow') {
            navigate(`/video-call/${invitationData?.userId}`);
        } else if (action === "reject") {
            enqueueSnackbar("Call rejected.", { variant: "warning" });
        } else if (action === "block") {
            enqueueSnackbar("User has been blocked. You will no longer receive calls from them.", { variant: "error" });
        }

        socket.emit('video-call-invitation-response', {
            from: loginUser?._id,
            to: invitationData.userId,
            action
        });
    }

    return (
        <div className='h-screen md:flex'>

            <ChatContextProvider>
                <AppRoutes />
            </ChatContextProvider>

            <Dialog
                open={isDialogOpen}
                TransitionComponent={Transition}
            >
                <DialogTitle>Incoming Video Call</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '1.1rem' }}>
                        <span className='text-gray-500' style={{ fontWeight: '800' }}>
                            {invitationData?.username}
                        </span> is calling you. Would you like to accept the call?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCallResponse("allow")} color="primary" variant="contained">
                        Accept
                    </Button>
                    <Button onClick={() => handleCallResponse("reject")} color="secondary" variant="outlined">
                        Decline
                    </Button>
                    <Button onClick={() => handleCallResponse("block")} color="error" variant="contained">
                        Block
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
}

export default App;
