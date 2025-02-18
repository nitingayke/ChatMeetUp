import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import UserContext from '../context/UserContext';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { changeBackgroundWallpaper } from '../services/chatService';
import LinearProgress from '@mui/material/LinearProgress';

export default function BackgroundWallpaper() {

    const navigate = useNavigate();

    const { enqueueSnackbar } = useSnackbar();
    const { loginUser, setLoginUser } = useContext(UserContext);

    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setQuoteIndex((prevIndex) => (prevIndex + 1) % wallpaperQuotes.length);
                setIsVisible(true);
            }, 500);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleBackgroundImage = async (imgUrl) => {
        if (!loginUser) {
            enqueueSnackbar('User not logged in, please log in first.', { variant: 'error' });
            navigate('/login');
            return;
        }

        try {
            setIsLoading(true);
            const response = await changeBackgroundWallpaper(loginUser._id, imgUrl);

            if (response.success) {
                setLoginUser((prev) => ({
                    ...prev,
                    backgroundImage: response.imgUrl,
                }));
                enqueueSnackbar("Updated background wallpaper.", { variant: 'success' });
            } else {
                enqueueSnackbar("Failed to update background wallpaper. Please try again.", { variant: 'error' });
            }

        } catch (error) {
            enqueueSnackbar(error.message || "Something went wrong", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{ height: '100%', overflowY: 'scroll' }} className='flex-1 relative'>
            <div className="sticky top-0 z-10 pb-2 text-xl text-center text-lg font-semibold bg-black">
                <p
                    className={`py-3 transition-opacity duration-500 ease-in-out bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent font-bold ${isVisible ? "opacity-100" : "opacity-0"}`}
                    style={{ fontWeight: '600' }}
                >
                    {wallpaperQuotes[quoteIndex]}
                </p>
                {isLoading && (
                    <div>
                        <LinearProgress color="inherit" className="h-1 w-full" />
                        <p className="text-sm text-gray-500">Please wait...</p>
                    </div>
                )}

            </div>

            <div className='px-4'>
                <ImageList variant="masonry" cols={3} gap={30}>

                    {itemData.map((item) => (
                        <ImageListItem key={item.img} className='group relative'>
                            <img
                                srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                src={`${item.img}?w=248&fit=crop&auto=format`}
                                className='rounded-lg'
                                alt=''
                                loading="lazy"
                            />

                            <button
                                onClick={() => handleBackgroundImage(item.img)}
                                className='md:opacity-0 group-hover:opacity-100 absolute top-2 left-2 md:left-4 hover:opacity-100 text-md bg-[#000000ab] hover:bg-black px-2 md:px-4 md:py-1 rounded cursor-pointer'>
                                Set
                            </button>
                        </ImageListItem>
                    ))}
                </ImageList>
            </div>

            <button className='sticky bottom-3 left-5 mt-5 z-100 mb-5 px-4 py-1 rounded bg-[#808080cc] hover:bg-[#00ff0285] cursor-pointer' onClick={() => handleBackgroundImage('null')}>Reset</button>

        </Box>
    );
}

const wallpaperQuotes = [
    "Let your wallpaper reflect the beauty of your dreams!",
    "Every background tells a story - choose one that inspires you!",
    "Surround yourself with visuals that uplift your soul!",
    "A stunning wallpaper is the first step to a positive mindset!",
    "Transform your space, transform your energy!",
    "The right background can set the tone for your day!",
    "Let your screen remind you of your goals and ambitions!",
    "Choose a wallpaper that fuels your creativity and passion!",
    "Your space, your vibe - pick a wallpaper that empowers you!",
    "A background full of colors, a life full of possibilities!",
    "Find motivation in every detail of your screen!",
    "Make your wallpaper a daily source of inspiration!",
    "A beautiful backdrop for a beautiful mindset!",
    "Let your background be a reminder of how far you've come!",
    "Pick a wallpaper that sparks joy and positivity!",
    "Every image holds power - choose one that lifts you up!",
    "Turn your screen into a vision board for success!",
    "A peaceful wallpaper, a peaceful mind!",
    "Colors, textures, and patterns - let them inspire you daily!",
    "Your background, your energy - choose wisely!"
];

const itemData = [
    {
        img: 'https://static.vecteezy.com/system/resources/thumbnails/035/757/238/small_2x/ai-generated-sport-car-firewall-wallpaper-free-photo.jpg',
        title: 'Bed',
    },
    {
        img: 'https://t4.ftcdn.net/jpg/03/64/47/27/360_F_364472783_x7S8RhZDcdPCILQFUNPCbwodmbDfX0xL.jpg',
        title: 'Books',
    },
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTnixrrT-YlC0iFp7sHCGSPZ-y2kkP0crWHA&s',
        title: 'Sink',
    },
    {
        img: 'https://static.vecteezy.com/system/resources/thumbnails/023/285/138/small_2x/a-cup-off-tea-with-teapot-ai-generate-photo.jpg',
        title: 'Kitchen',
    },
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3UamVL_UpWzDDV7AJYwsBB5jnF58bh-LWNg&s',
        title: 'Blinds',
    },
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvoIMAwL6qlSsslo99pbISWNtPPxZlK1NSEA&s',
        title: 'Chairs',
    },
    {
        img: 'https://dtcslo72w0h2o.cloudfront.net/assetbank/Arenal_Volcano_Costa_Rica_965611.jpg',
        title: 'Laptop',
    },
    {
        img: 'https://thumbs.dreamstime.com/b/beautiful-nature-thailand-james-bond-island-reflection-reflects-water-near-phuket-61039131.jpg',
        title: 'Doors',
    },
    {
        img: 'https://thumbs.dreamstime.com/b/earth-moon-view-space-night-europe-46110305.jpg',
        title: 'Coffee',
    },
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9fL7bR3fVFv_qGFRv7-oKTbiPUCQ0QhkD0g&s',
        title: 'Storage',
    },
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_sXDTZAkeo9QXpOj6Gx2mD3X9VAh1kP8VDQ&s',
        title: 'Candle',
    },
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa8XzBFhOTMCh4P19UL6nK-2KQroYXQQjD8Q&s',
        title: 'Coffee table',
    },
];
