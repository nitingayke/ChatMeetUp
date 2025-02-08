import React, { useContext } from 'react';
import ChatContext from '../../context/ChatContext.js';
import ChatHeader from './ChatHeader.jsx';
import ChatFooter from './ChatFooter.jsx';
import { ChatMain } from './ChatMain.jsx';

export default function ChatRoom() {

    const { userChat } = useContext(ChatContext);

    if (!userChat) {
        return (
            <div className='flex justify-center items-center h-full'>
                <h1 className='text-3xl font-bold text-gray-300'>Please Select Chat</h1>
            </div>
        );
    }

    return (
        <>
            <header className='py-2 px-3 bg-[#000000d1] flex justify-between items-center w-full'>
                <ChatHeader />
            </header>

            <main className='flex-1 h-full overflow-auto p-3'>
                <ChatMain />
            </main>

            <footer className='bg-[#000000d1] p-3 space-x-3 flex w-full'>
                <ChatFooter />
            </footer>
        </>
    );
}
