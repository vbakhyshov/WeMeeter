import React from 'react';
import PostItem from './PostItem';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import MenuIcon from '@mui/icons-material/Menu';
import SyncIcon from '@mui/icons-material/Sync';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';
import wemeeter_logo from '../../Pictures/wemeeter_logo_test.png';

const posts = [
    {
        id: 1,
        name: "Peter",
        age: "25",
        title: "New Spider-Man movie",
        desc: "I wanna watch the new Spider-Man movie in Ulm cinema. Who's in?",
        dist: "2 km",
        avatar: "🦸‍♂️",
        username: "peterparker"
    },
    {
        id: 2,
        name: "Cristiano",
        age: "39",
        title: "Football next Sunday",
        desc: "15 people are looking for 7 more guys to play football at Donaustadion.",
        dist: "2.3 km",
        avatar: "⚽️",
        username: "cronaldo"
    },
    {
        id: 3,
        name: "Olena",
        age: "24",
        title: "Techno Party tonight",
        desc: "Going to Gleis 44 tonight. If anyone wants to join the pre-party at my place, let me know!",
        dist: "2.5 km",
        avatar: "💃",
        username: "olena_dance"
    },
    {
        id: 4,
        name: "Lukas",
        age: "28",
        title: "Morning Run at Danube",
        desc: "Planning a 5km run along the river tomorrow at 7:00 AM. Pace around 5:30 min/km.",
        dist: "2.8 km",
        avatar: "🏃‍♂️",
        username: "lukas_runner"
    },
    {
        id: 5,
        name: "Sophie",
        age: "22",
        title: "Study Session: CS",
        desc: "Struggling with Algorithms & Data Structures. Anyone from THU wants to study together in the library?",
        dist: "3.2 km",
        avatar: "📚",
        username: "sophie_codes"
    },
    {
        id: 6,
        name: "Marco",
        age: "31",
        title: "Italian Cooking Night",
        desc: "Making homemade lasagna tonight. I have extra portions and wine. Come over!",
        dist: "4.5 km",
        avatar: "🍝",
        username: "marco_chef"
    },
    {
        id: 7,
        name: "Anna",
        age: "20",
        title: "Table Tennis partner",
        desc: "Looking for someone to play table tennis in the evening. I'm near Ehinger Tor.",
        dist: "5.2 km",
        avatar: "🏓",
        username: "annapong"
    },
    {
        id: 8,
        name: "David",
        age: "26",
        title: "Hiking to Blaubeuren",
        desc: "Taking the train to Blaubeuren on Saturday for a hike around Blautopf. Join us!",
        dist: "9 km",
        avatar: "🥾",
        username: "david_hikes"
    },
    {
        id: 9,
        name: "Julia",
        age: "23",
        title: "Coffee & Board Games",
        desc: "Found a cool board game cafe. Does anyone want to play Catan this afternoon?",
        dist: "9.4 km",
        avatar: "🎲",
        username: "jules_games"
    },
    {
        id: 10,
        name: "Kevin",
        age: "25",
        title: "Gym Buddy needed",
        desc: "Going to McFit daily. Looking for a partner to push each other for heavy sets.",
        dist: "10.5 km",
        avatar: "💪",
        username: "kevin_gainz"
    },
    {
        id: 11,
        name: "Maria",
        age: "27",
        title: "Language Exchange",
        desc: "I can teach you Spanish in exchange for German practice. Let's meet for a beer!",
        dist: "10.7 km",
        avatar: "🇪🇸",
        username: "maria_esp"
    },
    {
        id: 12,
        name: "Thomas",
        age: "35",
        title: "Jazz Bar Visit",
        desc: "Any jazz lovers here? Going to a small live session downtown tonight.",
        dist: "13.0 km",
        avatar: "🎷",
        username: "tom_jazz"
    }
];

const Sidebar = ({ isCollapsed, toggleSidebar, onOpenCreatePost, onOpenNotifications, onCloseNotifications, isNotifOpen }) => {

    const handleNotificationClick = () => {
        if (isNotifOpen) {
            onCloseNotifications();
        } else {
            onOpenNotifications();
        }
    };

    return (
        <div className={`h-screen w-full bg-[#BA4631] text-white flex flex-col shadow-xl relative overflow-hidden`}>

            {/* Logo */}
            <div className="flex flex-col items-center py-6 transition-all duration-300">
                <Link to="/" className="flex items-center justify-center">
                    {isCollapsed ? (
                        <HomeIcon sx={{ fontSize: 30 }} />
                    ) : (
                        <img
                            src={wemeeter_logo}
                            alt="weMeeter Logo"
                            className="w-[80%] object-contain"
                        />
                    )}
                </Link>
            </div>

            {/* Menu Bar */}
            <div className={`flex items-center px-2 pb-4 transition-all duration-300 ${isCollapsed ? 'flex-col gap-6 mt-12' : 'flex-row justify-between px-7'}`}>

                <IconButton
                    onClick={toggleSidebar}
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                    <MenuIcon fontSize="medium"/>
                </IconButton>

                <Link to="/me">
                    <IconButton sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                        <AccountCircleIcon fontSize="medium"/>
                    </IconButton>
                </Link>

                <Link to="/messages">
                    <IconButton sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                        <ChatBubbleOutlineIcon fontSize="medium" />
                    </IconButton>
                </Link>

                <IconButton
                    onClick={handleNotificationClick}
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                    <FavoriteIcon fontSize="medium" />
                </IconButton>

                <IconButton
                    onClick={onOpenCreatePost}
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                    <AddCircleOutlineRoundedIcon fontSize="medium" />
                </IconButton>
            </div>

            {/* --- SEARCH FIELD --- */}
            <div className={`px-4 mb-6 transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="new movie?.."
                        className="w-full py-3 pl-5 pr-10 rounded-full text-gray-700 text-sm focus:outline-none bg-pink-50/90"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-500">
                        <SyncIcon />
                    </div>
                </div>
            </div>

            {/* POSTS */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
                {posts.map((post) => (
                    <PostItem
                        key={post.id}
                        post={post}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </div>

            {/* FOOTER */}
            {!isCollapsed && (
                <div className={'py-4 text-center border-t border-white/20 transition-all duration-300 block'}>
                    <p className="text-[10px] text-white/60">
                        Vahid Bakhyshov 2026
                    </p>
                </div>
            )}

            {isCollapsed && (
                <div className={'py-4 text-center border-t border-white/20 transition-all duration-300 block'}>
                    <p className="text-[10px] text-white/60">
                        Bakhyshov
                    </p>
                </div>
            )}

        </div>
    )
}

export default Sidebar;