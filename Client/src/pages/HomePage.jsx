import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Chat, Lock, Videocam, Poll, Visibility, People } from '@mui/icons-material';
import UserContext from '../context/UserContext';
import { Avatar, CircularProgress } from '@mui/material';
import { getTotalActiveUsers } from '../services/userService';

export default function HomePage() {

    const { loginUser } = useContext(UserContext);

    const [activeUsers, setActiveUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleTotalUsersCount = async () => {
        try {
            setIsLoading(true);
            const response = await getTotalActiveUsers();
            if (response.success) {
                setActiveUsers(response.count);
            }
        } catch (error) {
            console.log("Unable to get count");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        handleTotalUsersCount();
    }, []);

    return (
        <div className='w-full h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-auto'>

            <header className='flex justify-center py-4 px-3 md:px-4 sticky top-0 z-50'>
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className='space-x-5 sm:space-x-10 text-sm sm:text-lg bg-white/10 backdrop-blur-lg px-4 sm:px-8 py-2 rounded-full shadow-lg flex items-center'
                >
                    <Link to='/' className='text-gray-300 hover:text-blue-400 transition'>Home</Link>
                    <Link to='/u/chatting' className='text-gray-300 hover:text-blue-400 transition'>Messages</Link>
                    <Link to='/live-users' className='text-gray-300 hover:text-blue-400 transition'>Live Users</Link>

                    {
                        (loginUser) ? <Link to={`/u/profile/${loginUser?.username}`} className='text-gray-300 hover:text-blue-400 transition'><Avatar src={loginUser.image} /></Link>
                            : <Link to='/login' className='text-gray-300 hover:text-blue-400 transition'>Login</Link>
                    }
                </motion.div>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className='flex flex-col items-center justify-center h-[70vh] text-center'
            >
                <h1 className='text-5xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500' style={{ fontWeight: '800' }}>
                    ChatMeetUp
                </h1>
                <p className='text-lg text-gray-300 mt-4 max-w-xl px-4'>
                    Connect instantly with real-time chat, video calls, file sharing, live polls, and secure group chats.
                </p>

                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className='mt-6'
                >
                    <Link to='/login' className='px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-lg transition' style={{ fontWeight: '600' }}>
                        Get Started
                    </Link>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className='grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-10 text-center'
            >
                <FeatureBox title="Real-time Chat" description="Send instant messages, images, and files." icon={<Chat fontSize="large" />} />
                <FeatureBox title="Secure Groups" description="Create private chat groups with passwords." icon={<Lock fontSize="large" />} />
                <FeatureBox title="Live Video Calls" description="Connect face-to-face with HD video calls." icon={<Videocam fontSize="large" />} />
                <FeatureBox title="Polls & Voting" description="Engage with polls and instant feedback." icon={<Poll fontSize="large" />} />
                <FeatureBox title="Public & Private Status" description="Share updates with the world or privately." icon={<Visibility fontSize="large" />} />
                <FeatureBox title="Live Users" description="See who's online in real time." icon={<People fontSize="large" />} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className='bg-gradient-to-r from-blue-400 to-purple-500 py-10 text-center rounded-xl mx-6 my-10 flex flex-col items-center justify-center'
            >
                <div className='flex items-center justify-center px-3'>
                    {
                        (!isLoading) ? <>
                            <span className="relative size-5 hidden sm:flex">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ffd0] opacity-75"></span>
                                <span className="relative inline-flex size-5 rounded-full bg-[#00ffd0]"></span>
                            </span>
                            <h1 className='text-4xl ps-5' style={{ fontWeight: '800' }}>
                                <AnimatedNumber target={activeUsers} />+ Active Users
                            </h1>
                        </>
                            : <CircularProgress sx={{ color: 'white' }} size={30} />
                    }
                </div>

                <p className='text-lg text-gray-100 mt-2 px-3'>Join thousands of users connecting every day!</p>
            </motion.div>


            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className='grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-10'
            >
                <TechBox title="Real-time Chat" description="Built with high-performance communication technology to ensure instant messaging and seamless connectivity." />
                <TechBox title="Video Calls" description="Designed using peer-to-peer technology, providing secure and smooth video calling experiences with minimal latency." />
                <TechBox title="Status System" description="Users can post updates that automatically disappear after 24 hours, with reactions and emoji responses supported." />
                <TechBox title="Group Chats" description="Both private and public group chats are available, with password protection for secure conversations." />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className='py-10 text-center rounded-xl mx-6 mb-10 
               bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 
               shadow-lg'
            >
                <h2 className='text-3xl sm:text-4xl' style={{ fontWeight: '900' }}>
                    Video Calls
                </h2>
                <p className='text-lg text-gray-300 mt-2'>
                    Experience high-quality, secure, and real-time video communication.
                </p>
            </motion.div>


        </div>
    );
}

const FeatureBox = ({ title, description, icon }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className='p-6 bg-white/10 rounded-2xl shadow-lg backdrop-blur-md flex flex-col items-center'
        >
            <div className='text-blue-300'>{icon}</div>
            <h3 className='mt-2 text-xl text-white' style={{ fontWeight: '800' }}>{title}</h3>
            <p className='text-gray-300 text-sm mt-1'>{description}</p>
        </motion.div>
    );
};

const TechBox = ({ title, description }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className='p-6 bg-white/10 rounded-2xl shadow-lg backdrop-blur-md'
        >
            <h3 className='text-xl text-white' style={{ fontWeight: '800' }}>{title}</h3>
            <p className='text-gray-300 text-sm mt-1'>{description}</p>
        </motion.div>
    );
};

const AnimatedNumber = ({ target }) => {
    const controls = useAnimation();
    const [value, setValue] = useState(0);

    useEffect(() => {
        controls.start({
            x: [0, target],
            transition: { duration: 2, ease: "easeOut" },
        }).then(() => {
            setValue(target);
        });

        controls.set({ x: 0 });
        controls.start({ x: target, transition: { duration: 2, ease: "easeOut" } }).then(() => {
            setValue(target);
        });

    }, [target, controls]);

    return (
        <motion.span
            animate={controls}
            onUpdate={(latest) => setValue(Math.floor(latest.x))}
            style={{ fontWeight: '800' }}
        >
            {value}
        </motion.span>
    );
};
