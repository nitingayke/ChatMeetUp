import React from 'react';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

import GoogleIcon from '@mui/icons-material/Google';

import { Link } from 'react-router-dom';


export default function LeftSidebar() {

    const sections = [
        { icon: GoogleIcon, title: 'BRAND NAME', redirectLink: '/' },
        { icon: MessageIcon, title: 'Message', redirectLink: '/u/chatting' },
        { icon: PersonIcon, title: 'Private Status', redirectLink: '/private-status' },
        { icon: PublicIcon, title: 'Public Status', redirectLink: '/public-status' },
        { icon: GroupIcon, title: 'Live Users', redirectLink: '/live-users' },
        { icon: ForumOutlinedIcon, title: 'Global Message', redirectLink: '/global-message' }
    ];

    return (
        <div className='group px-3 py-2 w-16 hover:w-60 transition-all duration-300 overflow-hidden overflow-y-auto hide-scroll'>
            <ul className='w-full space-y-4'>
                {
                    sections.map((section, idx) => (
                        <Link
                            to={section.redirectLink}
                            className={`flex items-center space-x-3 p-2 transition-all hover:cursor-pointer ${idx === 0 ? 'z-10 sticky top-0 left-0 bg-black' : 'bg-[#80808045] shadow-lg hover:bg-gray-700 rounded-xl'}`}
                            key={section.redirectLink}
                        >
                            {React.createElement(section.icon, { className: idx === 0 ? 'text-orange-500' : 'text-white' })}
                            <span className={`opacity-0 translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap transition-all duration-300 ${idx === 0 ? 'font-bold text-2xl text-white' : 'text-white'}`}>
                                {section.title} 
                            </span>
                        </Link>

                    ))
                }
            </ul>
        </div>
    )
}