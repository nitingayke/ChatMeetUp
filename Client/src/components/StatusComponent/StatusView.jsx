import React, { useContext, useEffect, useRef, useState } from 'react';
import StatusContext from '../../context/StatusContext';
import { useSnackbar } from 'notistack';
import { Collapse } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";


export default function StatusView() {

    const { enqueueSnackbar } = useSnackbar();
    const { isVideoPlaying, setIsVideoPlaying, isVideoMuted } = useContext(StatusContext);
    const videoRef = useRef(null);

    const [progress, setProgress] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            if (isVideoPlaying) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
            videoRef.current.muted = isVideoMuted;
        }
    }, [isVideoMuted, isVideoPlaying]);

    const handlePreviousStatus = () => {
        enqueueSnackbar('move prev status', { variant: 'info' });
    }

    const handleNextStatus = () => {
        enqueueSnackbar('move next status', { variant: 'info' });
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const progressPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progressPercent);
        }

        if (progress === 100) {
            setIsVideoPlaying(false);
        }
    };

    return (
        <>
            <div className="relative w-full h-full flex justify-center items-center p-1">
                <div className='absolute top-0 w-full h-1 bg-gray-200 rounded'>
                    <div
                        className='h-full bg-blue-500 transition-all duration-150 rounded'
                        style={{ width: `${progress}%` }}>

                    </div>
                </div>

                <video
                    width="100%"
                    ref={videoRef}
                    className="rounded-lg"
                    onTimeUpdate={handleTimeUpdate}
                >
                    <source src="/assets/temp.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className={`absolute w-[90%] z-10 text-sm bottom-2 bg-[#2c2c2cb5] rounded px-2 pb-2 text-center transition duration-700 ${(showMessage) ? "overflow-auto max-h-[60%] edit-scroll" : ""}`}>
                    <button
                        onClick={() => setShowMessage(!showMessage)}
                        className='z-10 top-0 text-white w-full sticky top-0'>
                        {showMessage ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                    </button>

                    <div className={`break-words text-gray-200 ${!showMessage && "line-clamp-1"}`}>
                        Enjoying my day at the beach! 🌊🏖️
                    </div>
                </div>
            </div>

            <button
                onClick={handlePreviousStatus}
                className="absolute left-0 h-full w-1/3 flex justify-center items-center group"
            >
                <span className="hidden md:flex justify-center items-center rounded-full bg-[#80808040] w-10 h-10 group-hover:bg-gray-500">
                    <ArrowBackIcon sx={{ fontSize: '1.5rem' }} />
                </span>
            </button>

            <button
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className='absolute left-1/3 h-full w-1/3 flex justify-center items-center group'>
                <span className="hidden justify-center items-center rounded-full bg-[#80808040] w-12 h-12 group-hover:flex">
                    {isVideoPlaying ? (
                        <PauseIcon sx={{ fontSize: '1.8rem' }} />
                    ) : (
                        <PlayArrowIcon sx={{ fontSize: '1.8rem' }} />
                    )}
                </span>
            </button>

            <button
                onClick={handleNextStatus}
                className="absolute right-0 h-full w-1/3 flex justify-center items-center group"
            >
                <span className="hidden md:flex justify-center items-center rounded-full bg-[#80808040] w-10 h-10 group-hover:bg-gray-500">
                    <ArrowForwardIcon sx={{ fontSize: '1.5rem' }} />
                </span>
            </button>
        </>
    );
}
