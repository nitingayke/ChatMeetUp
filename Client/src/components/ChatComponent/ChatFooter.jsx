import React, { useState, useRef, useContext } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import DashboardSharpIcon from '@mui/icons-material/DashboardSharp';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PollIcon from '@mui/icons-material/Poll';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import { Modal, Box } from "@mui/material";
import EmojiPicker from 'emoji-picker-react';

import ChatContext from '../../context/ChatContext.js';
import UserContext from '../../context/UserContext.js';
import { socket } from '../../services/socketService.js';


const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "10px",
};


export default function ChatFooter() {

    const [message, setMessage] = useState("");


    const { userChat } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);


    const [menuOpen, setMenuOpen] = useState(false);
    const anchorRef = useRef(null);

    const [openModal, setOpenModal] = useState(false);

    const handleToggleMenu = () => {
        setMenuOpen((prevOpen) => !prevOpen);
    };

    const handleCloseMenu = (event) => {
        if (anchorRef?.current?.contains(event.target)) {
            return;
        }
        setMenuOpen(false);
    };

    const handleEmojiClick = (emojiData) => {
        setMessage((prevMsg) => prevMsg + emojiData.emoji);
    }

    const handleMessageSubmit = (e) => {
        e.preventDefault();
        try {

            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex items-center space-x-2 w-full">

            <div>
                <button
                    ref={anchorRef}
                    className='text-gray-500 hover:text-white cursor-pointer'
                    onClick={handleToggleMenu}
                >
                    <DashboardSharpIcon />
                </button>

                <Popper
                    open={menuOpen}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    placement="top-start"
                    transition
                    disablePortal

                >
                    {({ TransitionProps }) => (
                        <Grow {...TransitionProps}>
                            <Paper className="bg-gray-900 text-white shadow-md rounded-md">
                                <ClickAwayListener onClickAway={handleCloseMenu}>
                                    <MenuList style={{ marginBottom: "1.2rem" }}>
                                        <MenuItem onClick={handleCloseMenu}>
                                            <ImageIcon className="mr-2" /> Image
                                        </MenuItem>
                                        <MenuItem onClick={handleCloseMenu}>
                                            <PictureAsPdfIcon className="mr-2" /> PDF
                                        </MenuItem>
                                        <MenuItem onClick={handleCloseMenu}>
                                            <OndemandVideoIcon className="mr-2" /> Video
                                        </MenuItem>
                                        <MenuItem onClick={handleCloseMenu}>
                                            <PollIcon className="mr-2" /> Poll
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>

            <button onClick={() => setOpenModal(true)} className='text-gray-500 hover:text-white cursor-pointer'>
                <SentimentSatisfiedOutlinedIcon />
            </button>
            <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="modal-title">
                <Box sx={style}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Box>
            </Modal>

            <form className='flex flex-1' onSubmit={handleMessageSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='bg-[#80808045] text-sm flex-1 rounded-s px-2 py-2 text-gray-200'
                    placeholder='Enter message'
                />
                <button
                    type={message.length === 0 ? 'button' : 'submit'}
                    className={`text-sm py-1 px-3 rounded-e cursor-pointer bg-[#8080806e] ${message.length === 0 ? 'text-gray-500' : 'text-white'}`}
                >
                    <SendOutlinedIcon style={{ fontSize: '1.3rem' }} />
                </button>
            </form>
        </div>
    );
}
