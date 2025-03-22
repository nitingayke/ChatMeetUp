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
import CreatePoll from '../InputComponent.jsx/CreatePoll.jsx';
import ImageUpload from '../InputComponent.jsx/ImageUpload.jsx';
import PdfUpload from '../InputComponent.jsx/PdfUpload.jsx';
import VideoUpload from '../InputComponent.jsx/VideoUpload.jsx';
import LoaderContext from '../../context/LoaderContext.js';
import { enqueueSnackbar } from 'notistack';


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

    const { setIsMessageProcessing } = useContext(LoaderContext);
    const { userChat, inputComponent, setInputComponent, pollOptions, setPollOptions, inputFile, setInputFile, joinedUsers } = useContext(ChatContext);
    const { loginUser } = useContext(UserContext);

    const [menuOpen, setMenuOpen] = useState(false);
    const anchorRef = useRef(null);

    const [openModal, setOpenModal] = useState(false);

    const handleToggleMenu = () => {
        setMenuOpen((prevOpen) => !prevOpen);
    };

    const handleCloseMenu = (event, componentType) => {
        if (anchorRef?.current?.contains(event.target)) {
            return;
        }

        setInputComponent(componentType);
        setMenuOpen(false);
        setInputFile(null);
        setPollOptions([]);
    };

    const handleEmojiClick = (emojiData) => {
        setMessage((prevMsg) => prevMsg + emojiData.emoji);
        setOpenModal(false);
    }

    const handleMessageSubmit = () => {

        if (!joinedUsers?.includes(loginUser?._id)) {
            enqueueSnackbar('You are not a member of this chat.', { variant: 'warning' });
            return;
        }

        if ((message || "").trim().length === 0 && (!pollOptions || pollOptions.length === 0) && (!inputFile)) {
            enqueueSnackbar("Please enter a message, select a file, or add poll options before sending.", {
                variant: "warning"
            });
            return;
        }

        setIsMessageProcessing(true);
        socket.emit("add-chat-message", {
            message: (message || "").trim(),
            pollOptions,
            video: (inputComponent === "video") ? inputFile : null,
            pdf: (inputComponent === "pdf") ? inputFile : null,
            image: (inputComponent === "image") ? inputFile : null,
            userId: loginUser?._id,
            recipientId: userChat?._id
        });

        setPollOptions([]);
        setInputFile(null);
        setMessage("");
        setInputComponent(null);
    };

    const inputOptionComponent = () => {

        let component = null;

        if (inputComponent === "poll") {
            component = <CreatePoll />
        } else if (inputComponent === 'image') {
            component = <ImageUpload />
        } else if (inputComponent === 'pdf') {
            component = <PdfUpload />
        } else if (inputComponent === 'video') {
            component = <VideoUpload />
        }

        return <>{component}</>;
    }

    return (
        <>
            {
                inputOptionComponent()
            }

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
                                    <ClickAwayListener onClickAway={(event) => handleCloseMenu(event, "")}>
                                        <MenuList style={{ marginBottom: "1.2rem" }} className='text-gray-800' >
                                            <MenuItem onClick={(event) => handleCloseMenu(event, "image")}>
                                                <ImageIcon style={{ fontSize: '1rem' }} className="mr-2" />
                                                <span>Image</span>
                                            </MenuItem>

                                            <MenuItem onClick={(event) => handleCloseMenu(event, "pdf")}>
                                                <PictureAsPdfIcon style={{ fontSize: '1rem' }} className="mr-2" />
                                                <span>PDF</span>
                                            </MenuItem>

                                            <MenuItem onClick={(event) => handleCloseMenu(event, "video")}>
                                                <OndemandVideoIcon style={{ fontSize: '1rem' }} className="mr-2" />
                                                <span>Video</span>
                                            </MenuItem>

                                            <MenuItem onClick={(event) => handleCloseMenu(event, "poll")}>
                                                <PollIcon style={{ fontSize: '1rem' }} className="mr-2" />
                                                <span>Poll</span>
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

                <form className='flex flex-1'>
                    <textarea
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='bg-[#80808045] text-sm flex-1 rounded-s px-2 py-[0.4rem] text-gray-200 resize-none h-8 overflow-hidden focus:outline-none'
                        placeholder='Enter message'
                    ></textarea>
                    <button
                        type={'button'}
                        onClick={handleMessageSubmit}
                        className={`text-sm py-1 px-3 rounded-e cursor-pointer bg-[#8080806e] ${(message || "").trim().length > 0 || inputFile || (pollOptions && pollOptions.length > 0) ? 'text-white' : 'text-gray-500'
                            }`}
                    >
                        <SendOutlinedIcon style={{ fontSize: '1.3rem' }} />
                    </button>
                </form>
            </div>
        </>
    );
}
