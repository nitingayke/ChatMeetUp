import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import UserContext from '../context/UserContext';
import { useSnackbar } from 'notistack';
import { Link, useNavigate } from 'react-router-dom';
import { changeBackgroundWallpaper } from '../services/chatService';
import LinearProgress from '@mui/material/LinearProgress';
import { Dialog } from '@mui/material';

export default function BackgroundWallpaper() {

    const navigate = useNavigate();

    const { enqueueSnackbar } = useSnackbar();
    const { loginUser, setLoginUser } = useContext(UserContext);

    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [showImage, setShowImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

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

        setShowImage(false);
        setSelectedImage(null);

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
        <>
            <Box sx={{ height: '100%', overflowY: 'scroll' }} className='flex-1 relative'>
                <div className="sticky top-0 z-10 pb-2 text-xl text-center font-semibold bg-black">
                    <div className='w-full md:flex px-4' >

                        <div className="text-2xl py-2 bg-gradient-to-r from-[#ef4136] to-[#fbb040] bg-clip-text text-transparent">
                            <Link
                                to={"/"}
                                className="hover:cursor-pointer z-10"
                                style={{ fontWeight: "900", fontFamily: "cursive" }}
                            >
                                ChatMeetUp
                            </Link>
                        </div>

                        <div className='flex-1'>
                            <p
                                className={`md:py-3 transition-opacity duration-500 ease-in-out bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent font-bold ${isVisible ? "opacity-100" : "opacity-0"}`}
                                style={{ fontWeight: '600' }}
                            >
                                {wallpaperQuotes[quoteIndex]}
                            </p>
                        </div>
                    </div>
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
                            <ImageListItem
                                key={item.img}
                                onClick={() => {
                                    setShowImage(true);
                                    setSelectedImage(item);
                                }}
                            >
                                <img
                                    srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                    src={`${item.img}?w=248&fit=crop&auto=format`}
                                    className='rounded-lg'
                                    alt=''
                                    loading="lazy"
                                />
                            </ImageListItem>

                        ))}
                    </ImageList>
                </div>

                <button className='sticky bottom-3 left-5 mt-5 z-100 mb-5 px-4 py-1 rounded bg-[#808080cc] hover:bg-[#00ff0285] cursor-pointer' onClick={() => handleBackgroundImage('null')}>Reset</button>
            </Box>

            {
                (selectedImage) && <Dialog
                    onClose={() => setShowImage(false)}
                    open={showImage}
                >
                    <div className='relative'>
                        <img src={selectedImage?.img} alt={selectedImage?.title} />

                        <button
                            onClick={() => handleBackgroundImage(selectedImage.img)}
                            className='hover:block absolute top-0 left-0 w-full h-full text-5xl text-white hover:bg-[#1b1b1b8f] cursor-pointer'
                        >
                            Set
                        </button>
                    </div>
                </Dialog>
            }
        </>
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
    // Nature & Landscapes
    {
        img: 'https://images.pexels.com/photos/30059245/pexels-photo-30059245/free-photo-of-serene-sunset-over-ocean-waves-at-twilight.jpeg',
        title: 'Serene Sunset',
    },
    {
        img: 'https://www.freevector.com/uploads/vector/preview/22108/sunset_landscape.jpg',
        title: 'Sunset Landscape',
    },
    {
        img: 'https://w0.peakpx.com/wallpaper/337/943/HD-wallpaper-background-sunset-view-trees-sunset-garden.jpg',
        title: 'Sunset View',
    },
    {
        img: 'https://png.pngtree.com/thumb_back/fh260/background/20250121/pngtree-a-beautiful-landscape-of-sunrise-or-sunset-image_16888432.jpg',
        title: 'Sunrise or Sunset',
    },

    // Space & Galaxy
    {
        img: 'https://w0.peakpx.com/wallpaper/228/467/HD-wallpaper-night-moon-galaxy-space-thumbnail.jpg',
        title: 'Moon Galaxy',
    },
    {
        img: 'https://w0.peakpx.com/wallpaper/318/659/HD-wallpaper-galaxy-earth-space.jpg',
        title: 'Galaxy Earth',
    },

    // Futuristic & Tech
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn5zlRztRIF0_9zFAJe0YdFd7v7fyRTEv57Q&s',
        title: 'Future',
    },
    {
        img: 'https://thegadgetflow.com/wp-content/uploads/2020/11/10-Futuristic-tech-that-will-simply-blow-your-mind.jpg',
        title: 'Future Tech 1',
    },
    {
        img: 'https://thegadgetflow.com/wp-content/uploads/2022/08/The-most-futuristic-tech-gadgets-you-will-want-to-buy-someday-blog-featured.jpeg',
        title: 'Future Tech 2',
    },
    {
        img: 'https://techstory.in/wp-content/uploads/2016/10/future-tech.jpg',
        title: 'Future Tech 3',
    },

    // City & Urban
    {
        img: 'https://images.unsplash.com/photo-1740738895087-ec912c4718af?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Cityscape',
    },
    {
        img: 'https://images.unsplash.com/photo-1741079746665-8fa95a1105e2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'People Waiting',
    },
    {
        img: 'https://plus.unsplash.com/premium_photo-1714023800301-83390690e1f0?q=80&w=1915&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Building with Windows',
    },

    // Abstract & Artistic
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRap98RO9UCUrq1yhD18Vi_HZJMh9YB1tCghw&s',
        title: 'Abstract & Artistic',
    },

    // Home & Lifestyle
    {
        img: 'https://static.vecteezy.com/system/resources/thumbnails/035/757/238/small_2x/ai-generated-sport-car-firewall-wallpaper-free-photo.jpg',
        title: 'Sport Car',
    },
    {
        img: 'https://images.unsplash.com/photo-1740395816867-1d6dbd89d49c?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Books',
    },
    {
        img: 'https://static.vecteezy.com/system/resources/thumbnails/023/285/138/small_2x/a-cup-off-tea-with-teapot-ai-generate-photo.jpg',
        title: 'Tea Time',
    },
    {
        img: 'https://images6.alphacoders.com/351/thumb-1920-351530.jpg',
        title: 'Blinds',
    },
    {
        img: 'https://images.squarespace-cdn.com/content/v1/5c1e4e00506fbef56473b460/5095db7e-8a18-473d-a4ea-f3ade24d864b/minimalist+living+room.jpg',
        title: 'Minimalist Living Room',
    },
    {
        img: 'https://www.speakeragency.co.uk/media/sywnphls/green-690x460.png',
        title: 'Storage',
    },
    {
        img: 'https://cdn11.bigcommerce.com/s-x49po/images/stencil/1500x1500/products/126569/293575/8-min__91194.1709215678.jpg?c=2&imbypass=on',
        title: 'Candle',
    },

    // Cartoon & Creative
    {
        img: 'https://t3.ftcdn.net/jpg/05/58/60/72/360_F_558607298_B9OvR1MA57BY1SUcNxNqDUFqsWNosso1.jpg',
        title: 'Cartoon Background',
    },
    {
        img: 'https://rukminim3.flixcart.com/image/850/1000/klphn680/sticker/o/5/h/medium-animal-cartoon-jerry-wall-sticker-3d-60-ap-72-approach-original-imagyre76pmk2yyz.jpeg?q=90&crop=false',
        title: 'Wall Sticker',
    },
    {
        img: 'https://t3.ftcdn.net/jpg/09/19/55/54/360_F_919555443_nMcSl34R8Z4aGaN7Zi6CLt2KqaIQoxoG.jpg',
        title: 'Cartoon Nature',
    }
];
