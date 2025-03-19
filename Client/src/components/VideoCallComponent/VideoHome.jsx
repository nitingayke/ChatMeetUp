import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../../services/socketService';

import RemoteUserRoom from './RemoteUserRoom';
import LocalUserRoom from './LocalUserRoom';
import VideoCallContext from '../../context/VideoCallContext';

export default function VideoHome() {

    const navigate = useNavigate();
    const { id } = useParams();
    const { localVideoRef, remoteVideoRef, localMic, localVideo, peerConnection } = useContext(VideoCallContext);

    const [isJoin, setIsJoin] = useState(false);

    const handleLeaveCall = () => {
        
        if (localVideoRef?.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef?.current?.srcObject) {
            remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            remoteVideoRef.current.srcObject = null;
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = new RTCPeerConnection();
        }

        socket.off('offer');
        socket.off('answer');
        socket.off('ice-candidate');
        socket.off('leave-call');
    };

    useEffect(() => {
        if (localVideoRef?.current) {
            navigator.mediaDevices.getUserMedia({ video: localVideo, audio: localMic })
                .then((stream) => {
                    localVideoRef.current.srcObject = stream;
                    if (peerConnection.current) {
                        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
                    }
                })
                .catch((err) => console.error('Error accessing media devices', err));
        }

    }, [localVideoRef, localMic, localVideo, peerConnection]);

    useEffect(() => {
        if (peerConnection.current) {
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { candidate: event.candidate, to: id });
                }
            };

            peerConnection.current.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
        }

    }, [peerConnection, remoteVideoRef, id]);

    useEffect(() => {
        const handleOffer = async ({ offer, sender }) => {
            if (!peerConnection.current.remoteDescription) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
            }
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit('answer', { answer, to: sender });
            setIsJoin(true);
        };

        const handleAnswer = async ({ answer }) => {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        const LeaveCall = () => {
            handleLeaveCall();
            navigate(-1);
        };

        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('leave-call', LeaveCall);

        return () => {
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('leave-call', LeaveCall);
        };
    }, []);

    const handleJoinCall = async () => {
        if (peerConnection.current) {
            setIsJoin(true);
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit('offer', { offer, to: id });
        }
    };

    return (
        <>
            {
                (!isJoin) && <div className='flex-1 w-full h-full absolute top-0 bg-[#000000a1] z-50 flex justify-center items-center'>
                    <button
                        onClick={handleJoinCall}
                        className=' px-5 py-2 rounded-full bg-white text-gray-500 hover:bg-amber-500 hover:text-white cursor-pointer'
                    >Join</button>
                </div>
            }

            <div className="h-screen w-screen bg-gradient-to-r from-black to-gray-800 flex justify-center items-center" >
                <div className="p-4 h-full w-full relative">

                    <RemoteUserRoom />

                    <LocalUserRoom />

                </div>
            </div>
        </>
    );
}
