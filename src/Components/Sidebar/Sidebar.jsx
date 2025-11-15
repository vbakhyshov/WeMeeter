import React from 'react';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import SearchIcon from '@mui/icons-material/Search';

const posts = [
    { id: 1, title: "New Spider-Man movie", desc: "i wanna watch new spider-man movie in Ulm cinema but not single.", dist: "2 km", avatar: "🦸‍♂️" },
    { id: 2, title: "football next sunday", desc: "15 people are looking for 7 guys to play football on donaustadium", dist: "2.3 km", avatar: "⚽️" },
    { id: 3, title: "uni party", desc: "“HALLO, ULM” PARTY NEXT MONDAY", dist: "3 km", avatar: "🎉" },
    { id: 4, title: "coffee, huh?", desc: "let's drink coffee. why not?", dist: "7 km", avatar: "☕️" },
    { id: 5, title: "Kloster Wiblingen", desc: "let's buy group ticket", dist: "9 km", avatar: "🏰" },
    { id: 6, title: "New Spider-Man movie", desc: "i wanna watch new spider-man movie in Ulm cinema but not single.", dist: "2 km", avatar: "🦸‍♂️" },
    { id: 7, title: "football next sunday", desc: "15 people are looking for 7 guys to play football on donaustadium", dist: "2.3 km", avatar: "⚽️" },
    { id: 8, title: "uni party", desc: "“HALLO, ULM” PARTY NEXT MONDAY", dist: "3 km", avatar: "🎉" },
    { id: 9, title: "coffee, huh?", desc: "let's drink coffee. why not?", dist: "7 km", avatar: "☕️" },
    { id: 10, title: "Kloster Wiblingen", desc: "let's buy group ticket", dist: "9 km", avatar: "🏰" },

];

const Sidebar = () => {
    return (
        <div className="h-screen fixed left-0 top-0 bg-[#BA4631] text-white flex flex-col shadow-2xl z-50 w-1/4">

            {/* Menu Bar */}
            <div className="flex justify-between items-center px-7 py-3">
                <IconButton sx={{ color: 'white' }}><AccountCircleIcon fontSize="medium" /></IconButton>
                <IconButton sx={{ color: 'white' }}><ChatBubbleOutlineIcon fontSize="medium" /></IconButton>
                <IconButton sx={{ color: 'white' }}><NotificationsNoneIcon fontSize="medium" /></IconButton>
                <IconButton sx={{ color: 'white' }}><AddCircleOutlineRoundedIcon fontSize="medium" /></IconButton>
            </div>

            {/* Search Field */}
            <div className="px-4 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="let's watch new movie?.."
                        className="w-full py-3 pl-5 pr-10 rounded-full text-gray-700 text-sm focus:outline-none bg-pink-50/90"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-500">
                        <SearchIcon />
                    </div>
                </div>
            </div>

            {/* Posts */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 custom-scrollbar">
                {posts.map((post) => (
                    <div key={post.id} className="flex items-start gap-3 cursor-pointer hover:bg-white/10 p-2 rounded transition">
                        {/* PfP */}
                        <div className="flex flex-col items-center min-w-[40px]">
                            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-xl shadow-sm">
                                {post.avatar}
                            </div>
                            <span className="text-[10px] font-bold mt-1 text-white/80">{post.dist}</span>
                        </div>

                        {/* Text */}
                        <div className="flex flex-col text-left">
                            <h3 className="font-bold text-sm leading-tight mb-1">{post.title}</h3>
                            <p className="text-xs text-white/80 leading-snug">{post.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default Sidebar;