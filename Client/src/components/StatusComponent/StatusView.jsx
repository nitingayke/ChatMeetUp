import React, { useContext, useEffect, useRef, useState } from 'react';
import StatusContext from '../../context/StatusContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router-dom';


export default function StatusView() {

    const { statusType } = useParams();
    const navigate = useNavigate();
    const { isVideoPlaying, setIsVideoPlaying, isVideoMuted, selectedStatus, selectedStatusIdx, setSelectedStatusIdx, currentPlayingStatus, setCurrentPlayingStatus } = useContext(StatusContext);

    const videoRef = useRef(null);

    const [progress, setProgress] = useState(0);
    const [showMessage, setShowMessage] = useState(false);
    const [localStatus, setLocalStatus] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageTimeout, setImageTimeout] = useState(null);

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

    useEffect(() => {

        if (!selectedStatus || selectedStatusIdx >= selectedStatus.length || selectedStatusIdx < 0) {
            return navigate(`/status/${statusType}`);
        }

        setCurrentPlayingStatus(selectedStatus[selectedStatusIdx]);
        setLocalStatus(selectedStatus[selectedStatusIdx]);

    }, [selectedStatusIdx]);

    const getMediaType = (url) => {
        if (!url) return "unknown";
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
        const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;

        if (imageExtensions.test(url)) return "image";
        if (videoExtensions.test(url)) return "video";
        return "unknown";
    };

    useEffect(() => {
        if (!localStatus?.Url) return;

        const computedMediaType = getMediaType(localStatus.Url);
        setMediaType(computedMediaType);

        if (computedMediaType === "video" && videoRef.current) {
            const videoElement = videoRef.current;

            videoElement.src = localStatus.Url;
            videoElement.load();

            const playVideo = async () => {
                try {
                    await videoElement.play();
                    setIsLoading(false);
                } catch (error) {
                    setTimeout(() => {
                        if (!videoElement.paused && videoElement.readyState >= 2) {
                            setIsLoading(false);
                        } else {
                            setIsVideoPlaying(false);
                        }
                    }, 500);
                }
            };

            playVideo();
        } else if (computedMediaType === 'image') {

            setProgress(0);
            const timeout = setTimeout(() => {
                handleNextStatus();
            }, 15000);

            setImageTimeout(timeout);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev + (100 / 15) * 0.5;
                    return newProgress >= 100 ? 100 : newProgress;
                })
            }, 500);

            return () => {
                clearTimeout(timeout);
                clearInterval(interval);
            }
        }

    }, [localStatus?.Url]);

    const resetVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = "";
            videoRef.current.load();
        }
    }

    const handlePreviousStatus = () => {
        if (selectedStatusIdx == 0) {
            return navigate(`/status/${statusType}`);
        }

        resetVideo();
        setProgress(0);
        clearTimeout(imageTimeout);
        setSelectedStatusIdx(prev => prev - 1);
    }

    const handleNextStatus = () => {
        if (selectedStatusIdx == (selectedStatus || []).length - 1) {
            return navigate(`/status/${statusType}`);
        }

        resetVideo();
        setProgress(0);
        clearTimeout(imageTimeout);
        setSelectedStatusIdx(prev => prev + 1);
    }

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            const progressPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progressPercent);
        }
    };

    if (!localStatus) {
        return <div className='text-gray-500'>Select User Status.</div>
    }

    const getPlayingMediaElement = () => {
        if (mediaType === "image") {
            return <img src={localStatus.Url} alt="Status" className="rounded-lg w-full h-auto" />;
        } else if (mediaType === "video") {
            return (
                <video
                    width="100%"
                    ref={videoRef}
                    className="rounded-lg"
                    preload='auto'
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleNextStatus}
                    autoPlay={isVideoPlaying}
                >
                    <source src={localStatus.Url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            );
        } else {
            return <p className="text-gray-500">Unsupported format</p>;
        }
    };

    if (isLoading) {
        return <div><CircularProgress sx={{ color: 'white' }} size={"30px"} /></div>
    }

    return (
        <>
            <div className="relative w-full h-full flex justify-center items-center p-1">
                <div className='absolute top-0 w-full h-1 bg-gray-200 rounded'>
                    <div
                        className='h-full bg-blue-500 transition-all duration-150 rounded'
                        style={{ width: `${progress}%` }}>

                    </div>
                </div>

                {
                    getPlayingMediaElement()
                }

                {
                    (localStatus.message) && <div className={`absolute w-[90%] z-10 text-sm bottom-2 bg-[#000000d1] rounded px-2 pb-2 text-center transition duration-700 ${(showMessage) ? "overflow-auto max-h-[60%] edit-scroll" : ""}`}>
                        <button
                            onClick={() => setShowMessage(!showMessage)}
                            className='z-10 top-0 text-white w-full sticky'>
                            {showMessage ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                        </button>

                        <div className={`break-words text-gray-200 ${!showMessage && "line-clamp-1"}`}>
                            {
                                localStatus.message
                            }
                        </div>
                    </div>
                }
            </div>

            <button
                onClick={handlePreviousStatus}
                className="absolute left-0 h-full w-[25%] flex justify-center items-center group cursor-pointer"
            >
                <span className="hidden md:flex justify-center items-center rounded-full bg-[#80808040] w-10 h-10 group-hover:bg-gray-500">
                    <ArrowBackIcon sx={{ fontSize: '1.5rem' }} />
                </span>
            </button>

            {
               (mediaType === 'video') && <button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className='absolute left-[25%] h-full w-[50%] flex justify-center items-center group cursor-pointer'>
                    <span className="hidden justify-center items-center rounded-full bg-[#80808040] w-12 h-12 group-hover:flex">
                        {isVideoPlaying ? (
                            <PauseIcon sx={{ fontSize: '1.8rem' }} />
                        ) : (
                            <PlayArrowIcon sx={{ fontSize: '1.8rem' }} />
                        )}
                    </span>
                </button>
            }

            <button
                onClick={handleNextStatus}
                className="absolute right-0 h-full w-[25%] flex justify-center items-center group cursor-pointer"
            >
                <span className="hidden md:flex justify-center items-center rounded-full bg-[#80808040] w-10 h-10 group-hover:bg-gray-500">
                    <ArrowForwardIcon sx={{ fontSize: '1.5rem' }} />
                </span>
            </button>
        </>
    );
}
