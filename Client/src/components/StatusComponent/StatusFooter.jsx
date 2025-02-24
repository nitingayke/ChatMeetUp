import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { IconButton } from "@mui/material";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SendIcon from "@mui/icons-material/Send";
import { useSnackbar } from "notistack";

export default function StatusFooter() {
    const { enqueueSnackbar } = useSnackbar();
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const onEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const sendMessage = () => {
        if (!message.trim()) {
            enqueueSnackbar("Please enter a message", { variant: "warning" });
            return;
        }

        const newMessage = {
            status: "sent",
            message,
            
        }
        enqueueSnackbar(`Status: Send, Message: ${message}`, { variant: 'info' });
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
