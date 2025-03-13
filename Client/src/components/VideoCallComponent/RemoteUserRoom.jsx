import React from 'react';
import { CallEnd } from '@mui/icons-material';

export default function RemoteUserRoom() {
    return (
        <div className="border-gray-500 rounded-xl h-full w-full">
            <video
                src="https://res.cloudinary.com/dnpg99izj/video/upload/v1740663353/status_uploads/s35quv4784dyptfn7ojj.mp4"
                className="w-full h-full rounded-xl"
                autoPlay
                muted
            ></video>

            <div className='sticky bottom-10 flex justify-center items-center'>
                <button className="w-12 h-12 flex justify-center items-center bg-red-600 hover:bg-red-500 text-white rounded-full shadow-md transition-all duration-200 cursor-pointer">
                    <CallEnd   sx={{fontSize: '1.4rem'}}   />
                </button>
            </div>
        </div>
    )
}