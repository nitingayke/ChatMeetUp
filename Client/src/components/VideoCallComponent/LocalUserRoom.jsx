import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVert, Mic, MicOff, Videocam, VideocamOff, Person } from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import VideoCallContext from '../../context/VideoCallContext';

export default function LocalUserRoom() {

    const { localMic, setLocalMic, localVideoRef, localVideo, setLocalVideo } = useContext(VideoCallContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [position, setPosition] = useState("topRight");
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handlePositionChange = (pos) => {
        setPosition(pos);
        handleMenuClose();
    };

    const handleLocalMic = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject;
            const audioTracks = stream.getAudioTracks();
            audioTracks.enabled = !audioTracks.enabled; 
            setLocalMic(prev => !prev);
        }
    };


    const handleLocalVideo = () => {
        if (localVideoRef.current?.srcObject) {
            const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
            videoTracks.forEach(track => track.enabled = !track.enabled);
            setLocalVideo(prev => !prev);
        }
    };

    const positionStyles = {
        topRight: { top: "1rem", right: "1rem", bottom: "auto", left: "auto" },
        topLeft: { top: "1rem", left: "1rem", bottom: "auto", right: "auto" },
        bottomRight: { bottom: "1rem", right: "1rem", top: "auto", left: "auto" },
        bottomLeft: { bottom: "1rem", left: "1rem", top: "auto", right: "auto" }
    };

    return (
        <motion.div
            className="absolute rounded-2xl w-55 h-30 md:w-64 md:h-36 bg-black shadow-lg overflow-hidden border border-gray-800"
            animate={positionStyles[position]}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >

            <button
                onClick={handleLocalVideo}
                className='absolute right-20 top-2 z-40 rounded-full w-7 h-7 flex justify-center items-center bg-[#3f3f3f82] hover:bg-[#3f3f3f] cursor-pointer'
            >
                {localVideo ? <Videocam sx={{ fontSize: '1.1rem', color: 'white' }} /> : <VideocamOff sx={{ fontSize: '1.1rem', color: 'white' }} />}
            </button>

            <button
                onClick={handleLocalMic}
                className='absolute right-11 top-2 z-40 rounded-full w-7 h-7 flex justify-center items-center bg-[#3f3f3f82] hover:bg-[#3f3f3f] cursor-pointer'
            >
                {localMic ? <Mic sx={{ fontSize: '1.1rem', color: 'white' }} /> : <MicOff sx={{ fontSize: '1.1rem', color: 'white' }} />}
            </button>

            <button
                className='absolute right-2 top-2 z-40 rounded-full w-7 h-7 flex justify-center items-center bg-[#3f3f3f82] hover:bg-[#3f3f3f] cursor-pointer'
                onClick={handleMenuOpen}
            >
                <MoreVert sx={{ fontSize: '1.1rem', color: 'white' }} />
            </button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
                <div className='grid grid-cols-2 gap-2 px-2'>
                    {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos) => (
                        <MenuItem
                            key={pos}
                            sx={{
                                border: "1px solid #97979757",
                                borderRadius: '5px',
                                fontSize: '0.8rem',
                                textAlign: "center",
                                transition: "0.3s",
                                "&:hover": {
                                    color: "orange",
                                    backgroundColor: "#ffa50047",
                                    borderColor: 'orange'
                                }
                            }}
                            onClick={() => handlePositionChange(pos)}
                        >
                            {(pos.charAt(0) + (pos.includes('Left') ? 'L' : 'R')).toUpperCase()}
                        </MenuItem>
                    ))}
                </div>
            </Menu>


            <video
                ref={localVideoRef}
                className="w-full h-full rounded-xl"
                autoPlay
                playsInline
                muted
            ></video>

            {
                !localVideo && <div className='absolute top-0 w-full h-full flex justify-center items-center'>
                    <Person sx={{ fontSize: '3rem' }} className='text-gray-600' />
                </div>
            }

        </motion.div>
    );
}
