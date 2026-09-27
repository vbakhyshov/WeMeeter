import React, { useEffect, useState } from 'react';
import PostItem from './PostItem';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import MenuIcon from '@mui/icons-material/Menu';
import SyncIcon from '@mui/icons-material/Sync';
import HomeIcon from '@mui/icons-material/Home';
import Badge from '@mui/material/Badge';
import { Link } from 'react-router-dom';
import wemeeter_logo from '../../Pictures/wemeeter_logo_test.png';

import { auth, db } from '../../firebase/firebase';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const calculateDistanceKm = (coord1, coord2) => {
    if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return null;

    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
};

const Sidebar = ({
                     isCollapsed,
                     toggleSidebar,
                     onOpenCreatePost,
                     onOpenNotifications,
                     onCloseNotifications,
                     isNotifOpen,
                     unreadNotifsCount = 0,
                     unreadMessagesCount = 0
                 }) => {
    const [posts, setPosts] = useState([]);
    const [currentUserCoords, setCurrentUserCoords] = useState(null);
    const [currentUserFriends, setCurrentUserFriends] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // friends and posts
    useEffect(() => {
        let unsubUserDoc = () => {};

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            unsubUserDoc();
            if (user) {
                setCurrentUserId(user.uid);
                unsubUserDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setCurrentUserCoords(data.coordinates || null);
                        setCurrentUserFriends(data.friends || []);
                    }
                });
            } else {
                setCurrentUserId(null);
                setCurrentUserCoords(null);
                setCurrentUserFriends([]);
            }
        });

        return () => {
            unsubAuth();
            unsubUserDoc();
        };
    }, []);

    // privacy
    useEffect(() => {
        const postsRef = collection(db, "posts");
        const q = query(postsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = Date.now();
            const fetched = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            // check rules and time
            const accessiblePosts = fetched.filter((post) => {
                // remove old
                if (post.expiresAtMs && post.expiresAtMs <= now) {
                    return false;
                }

                const postVis = post.visibility || 'all';
                const isOwner = currentUserId && post.userId === currentUserId;

                if (postVis === 'all') return true;
                if (postVis === 'private') return isOwner;
                if (postVis === 'friends') {
                    return isOwner || currentUserFriends.includes(post.userId);
                }
                return true;
            });

            setPosts(accessiblePosts);
        }, (error) => {
            console.error("Error fetching live posts in sidebar:", error);
        });

        return () => unsubscribe();
    }, [currentUserId, currentUserFriends]);

    const handleNotificationClick = () => {
        if (isNotifOpen) {
            onCloseNotifications();
        } else {
            onOpenNotifications();
        }
    };

    const processedPosts = posts.map(post => {
        const dist = currentUserCoords && post.coordinates
            ? calculateDistanceKm(currentUserCoords, post.coordinates)
            : null;
        return {
            ...post,
            distanceKm: dist
        };
    });

    processedPosts.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
            return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== null) return -1;
        if (b.distanceKm !== null) return 1;

        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return timeB - timeA;
    });

    const filteredPosts = processedPosts.filter((post) => {
        const queryLower = searchQuery.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(queryLower);
        const descMatch = post.desc?.toLowerCase().includes(queryLower);
        const authorMatch = post.name?.toLowerCase().includes(queryLower) || post.username?.toLowerCase().includes(queryLower);
        const cityMatch = post.city?.toLowerCase().includes(queryLower) || post.location?.toLowerCase().includes(queryLower);
        return titleMatch || descMatch || authorMatch || cityMatch;
    });

    return (
        <div className="h-screen w-full bg-[#BA4631] text-white flex flex-col shadow-2xl relative overflow-hidden">
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

            {/* Menu */}
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
                        <Badge
                            badgeContent={unreadMessagesCount}
                            color="error"
                            overlap="circular"
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#ffffff',
                                    color: '#BA4631',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem'
                                }
                            }}
                        >
                            <ChatBubbleOutlineIcon fontSize="medium" />
                        </Badge>
                    </IconButton>
                </Link>

                <IconButton
                    onClick={handleNotificationClick}
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                    <Badge
                        badgeContent={unreadNotifsCount}
                        color="error"
                        overlap="circular"
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: '#ffffff',
                                color: '#BA4631',
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                            }
                        }}
                    >
                        <FavoriteIcon fontSize="medium" />
                    </Badge>
                </IconButton>

                <IconButton
                    onClick={onOpenCreatePost}
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                    <AddCircleOutlineRoundedIcon fontSize="medium" />
                </IconButton>
            </div>

            {/* Live Search */}
            <div className={`px-4 mb-6 transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full py-3 pl-5 pr-10 rounded-full text-gray-700 text-sm focus:outline-none bg-pink-50/90"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-500">
                        <SyncIcon />
                    </div>
                </div>
            </div>

            {/* Sorted Posts List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <PostItem
                            key={post.id}
                            post={post}
                            isCollapsed={isCollapsed}
                        />
                    ))
                ) : (
                    <div className="text-center text-white/60 text-xs py-4">
                        {posts.length === 0 ? "No posts yet. Create one!" : "No matching posts"}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="py-4 text-center border-t border-white/20 transition-all duration-300 block">
                <p className="text-[10px] text-white/60">
                    {isCollapsed ? "Bakhyshov" : "Vahid Bakhyshov 2026"}
                </p>
            </div>
        </div>
    );
};

export default Sidebar;