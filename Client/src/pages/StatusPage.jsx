import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

import StatusHeader from '../components/StatusComponent/StatusHeader';
import StatusView from '../components/StatusComponent/StatusView';
import StatusFooter from '../components/StatusComponent/StatusFooter'
import UserContext from '../context/UserContext';
import AuthOptions from '../components/AuthOptions';

export default function StatusPage() {

    const { statusType } = useParams();
    const { loginUser } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
 
    if (!statusType || statusType !== "private" && statusType !== "public") {
        return (
            <div className="w-full h-full text-gray-300 flex justify-center items-center text-3xl bg-gradient-to-b from-black to-gray-800">
                <span className="text-red-500 pe-1">404</span> | Not Found
            </div>
        );
    }

    if (!loginUser) {
        return <AuthOptions />
    }

    return (

        <div className="sm:p-2 w-full h-full flex justify-center bg-gradient-to-b from-black to-gray-800">
            <div className="flex flex-col w-full sm:w-[450px] h-full sm:rounded">
                <nav className='z-100 flex items-center gap-3 p-3 bg-gray-900 border-b border-gray-700 sm:rounded-t'>
                    <StatusHeader />
                </nav>

                <div className='flex-1 overflow-hidden w-full h-full flex justify-center items-center'>
                    <StatusView />
                </div>

                <footer className='z-100 flex items-center gap-3 p-3 bg-gray-900 border-t border-gray-700 sm:rounded-b'>
                    <StatusFooter />
                </footer>
            </div>
        </div>

    )
}