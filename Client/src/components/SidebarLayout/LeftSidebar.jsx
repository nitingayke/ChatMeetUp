import React, { useContext, useState } from 'react';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';


import { Link } from 'react-router-dom';
import UserContext from '../../context/UserContext';


export default function LeftSidebar() {

    const { loginUser } = useContext(UserContext);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setIsDrawerOpen(open);
    };

    const sections = [
        { icon: MessageIcon, title: 'Message', redirectLink: '/u/chatting' },
        { icon: PersonIcon, title: 'Private Status', redirectLink: '/private-status' },
        { icon: PublicIcon, title: 'Public Status', redirectLink: '/public-status' },
        { icon: GroupIcon, title: 'Live Users', redirectLink: '/live-users' },
        { icon: ForumOutlinedIcon, title: 'Global Message', redirectLink: '/global-message' },
        { icon: PersonIcon, title: 'Profile', redirectLink: `/u/profile/${loginUser?.username}` }
    ];

    return (
        <>
            <div className='hidden md:flex group px-3 py-2 w-16 hover:w-60 transition-all duration-300 overflow-hidden overflow-y-auto hide-scroll'>
                <div className='w-full space-y-4'>
                    <Link
                        to={'/'}
                        className="flex items-center space-x-3 mt-1 p-1 transition-all hover:cursor-pointer z-10 sticky top-0 left-0"
                    >
                        <span className='border-2 p-1 rounded-full border-orange-500'>
                            <PersonAddRoundedIcon className='text-orange-500' />
                        </span>
                        <div className="tracking-wide text-2xl bg-gradient-to-r from-[#ef4136] to-[#fbb040] bg-clip-text text-transparent whitespace-nowrap transition-all duration-300 opacity-0 translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0"
                            style={{ fontWeight: '900', fontFamily: 'cursive' }}>
                            ChatMeetUp
                        </div>
                    </Link>

                    {
                        sections.map((section, idx) => (
                            <Link
                                to={section.redirectLink}
                                className={`flex text-gray-500 hover:text-white items-center space-x-3 p-[0.65rem] hover:cursor-pointer bg-[#80808045] shadow-lg hover:bg-gray-700 rounded-xl`}
                                key={section.redirectLink}
                            >
                                {React.createElement(section.icon, { style: { fontSize: '1.2rem' } })}
                                <span className={`opacity-0 translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap transition-all duration-300`}>
                                    {section.title}
                                </span>
                            </Link>

                        ))
                    }
                </div>
            </div>

            <div>
                <div className="text-2xl bg-gradient-to-r from-[#ef4136] to-[#fbb040] bg-clip-text text-transparent">
                    <Link to={'/'} className="hover:cursor-pointer z-10" style={{ fontWeight: '900', fontFamily: 'cursive' }} >
                        ChatMeetUp
                    </Link>
                </div>

                <div className='space-y-2'>
                    {
                        sections.map((section, idx) => (
                            <Link
                                to={section.redirectLink}
                                className={`flex text-gray-500 hover:text-white items-center space-x-3 border hover:cursor-pointer`}
                                key={section.redirectLink}
                            >
                                {React.createElement(section.icon, { style: { fontSize: '1.2rem' } })}
                                <span className={`whitespace-nowrap`}>
                                    {section.title}
                                </span>
                            </Link>

                        ))
                    }
                </div>
                <Drawer
                    anchor={'top'}
                    open={isDrawerOpen}
                    onClose={() => toggleDrawer(false)}
                >
                    lorem
                </Drawer>


            </div>
        </>
    )
}