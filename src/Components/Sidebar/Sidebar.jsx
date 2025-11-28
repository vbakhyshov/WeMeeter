import React from 'react';
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
    { id: 1, title: "New Spider-Man movie", desc: "i wanna watch new spider-man movie in Ulm cinema but not single.", dist: "2 km", avatar: "🦸‍♂️" },
    { id: 2, title: "football next sunday", desc: "15 people are looking for 7 guys to play football on donaustadium", dist: "2.3 km", avatar: "⚽️" },
    { id: 3, title: "uni party", desc: "“HALLO, ULM” PARTY NEXT MONDAY", dist: "3 km", avatar: "🎉" },
    { id: 4, title: "coffee, huh?", desc: "let's drink coffee. why not?", dist: "7 km", avatar: "☕️" },
    { id: 5, title: "Kloster Wiblingen", desc: "let's buy group ticket", dist: "9 km", avatar: "🏰" },
    { id: 6, title: "New Spider-Man movie", desc: "i wanna watch new spider-man movie in Ulm cinema but not single.", dist: "12 km", avatar: "🦸‍♂️" },
    { id: 7, title: "football next sunday", desc: "15 people are looking for 7 guys to play football on donaustadium", dist: "12.3 km", avatar: "⚽️" },
    { id: 8, title: "fesfsfsgsg", desc: "i wanna watch new spider-man movie in Ulm cinema but not single.", dist: "12.3 km", avatar: "🦸‍♂️" },
    { id: 9, title: "football next sunday", desc: "15 people are looking for 7 guys to play football on donaustadium", dist: "2.3 km", avatar: "⚽️" },
    { id: 10, title: "uni party", desc: "“HALLO, ULM” PARTY NEXT MONDAY", dist: "3 km", avatar: "🎉" },
    { id: 11, title: "coffee, huh?", desc: "let's drink coffee. why not?", dist: "7 km", avatar: "☕️" },
    { id: 12, title: "Kloster Wiblingen", desc: "let's buy group ticket", dist: "9 km", avatar: "🏰" },
    { id: 13, title: "anyone can play guitar", desc: "anyone can play guitar? ", dist: "10 km", avatar: "🦸‍♂️" },
    { id: 14, title: "football next sunday", desc: "15 people are looking for 7 guys to play football on donaustadium", dist: "22.3 km", avatar: "⚽️" },
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
        <div
            className={`h-screen w-full bg-[#BA4631] text-white flex flex-col shadow-xl relative overflow-hidden`}
        >

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
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 custom-scrollbar">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className={`flex items-start gap-3 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all duration-200 
                        ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                    >
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-xl shadow-sm">
                                {post.avatar}
                            </div>
                            <span className="text-[10px] font-bold mt-1 text-white/80 whitespace-nowrap">
                                {post.dist}
                            </span>
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col text-left overflow-hidden pt-0.5">
                                <h3 className="font-bold text-sm leading-tight mb-1 truncate">{post.title}</h3>
                                <p className="text-xs text-white/80 leading-snug truncate">
                                    {post.desc}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            {!isCollapsed && (
                <div className={'py-4 text-center border-t border-white/20 transition-all duration-300 block'}>
                    <p className="text-[10px] text-white/60">
                        Vahid Bakhyshov 2025
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