import React, { useContext, useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { IconButton } from "@mui/material";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SendIcon from "@mui/icons-material/Send";
import { useSnackbar } from "notistack";
import UserContext from "../../context/UserContext";
import StatusContext from "../../context/StatusContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socketService";

export default function StatusFooter() {

    const navigate = useNavigate();

    const { enqueueSnackbar } = useSnackbar();
    const { loginUser } = useContext(UserContext);
    const { currentPlayingStatus } = useContext(StatusContext);

    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleMessageSend = ({ message }) => {
        enqueueSnackbar(message, { variant: 'success' });
    };

    useEffect(() => {
        socket.on('message-sent', handleMessageSend);

        return () => {
            socket.off('message-sent', handleMessageSend);
        };
    }, []);


    const onEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const sendMessage = () => {

        if (!message.trim()) {
            enqueueSnackbar("Please enter a message", { variant: "warning" });
            return;
        }

        if (loginUser?._id === currentPlayingStatus?.user?._id) {
            enqueueSnackbar("You cannot send a message to your own status.", { variant: 'info' });
            return;
        }

        const connection = loginUser.connections.find(c =>
            c.user1._id === currentPlayingStatus?.user?._id || c.user2._id === currentPlayingStatus?.user?._id
        );

        if (!connection) {
            enqueueSnackbar('You are not connected with this user. Create a new connection.', {
                variant: 'info'
            });
            navigate(`/u/profile/${currentPlayingStatus?.user?.username}`);
            return
        }

        socket.emit('status-message', {
            userId: loginUser?._id,
            remoteUserId: connection.user1._id === loginUser._id
                ? connection.user2._id
                : connection.user1._id,
            message: message,
            connectionId: connection._id
        });


        setMessage("");
    };

    return (
        <>
            <div style={{ position: "relative" }}>
                <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <InsertEmoticonIcon sx={{ color: "white" }} />
                </IconButton>

                {showEmojiPicker && (
                    <div style={{ position: "absolute", bottom: "50px", left: "0", backgroundColor: "#424242", padding: "8px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                    </div>
                )}
            </div>

            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg outline-none"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <IconButton
                onClick={sendMessage}
                disabled={!message.trim()}
                sx={{
                    color: message.trim() ? "#1E88E5" : "#757575",
                    cursor: message.trim() ? "pointer" : "default",
                }}
            >
                <SendIcon />
            </IconButton>
        </>
    );
}