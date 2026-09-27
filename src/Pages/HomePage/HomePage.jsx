import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

import { auth, db } from '../../firebase/firebase';
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    getDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'firebase/firestore';
import { useAppTheme } from '../../context/ThemeContext';
import { extractCity } from '../../utils/geoUtils';

import Avatar from '@mui/material/Avatar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import PlaceIcon from '@mui/icons-material/Place';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import CircularProgress from '@mui/material/CircularProgress';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const DEFAULT_CENTER = [48.3994, 9.9933];

// Custom circular pin marker displaying the post author's avatar
const createCustomPinIcon = (avatarUrl, isLiked) => {
    const pinColor = isLiked ? '#ef4444' : '#BA4631';
    const pinBg = isLiked ? '#BA4631' : '#ffffff';

    return L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
            <div style="
                position: relative;
                width: 46px;
                height: 46px;
                border-radius: 50%;
                background-color: ${pinBg};
                box-shadow: 0 4px 14px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                border-width: 3px;
                border-style: solid;
                border-color: ${pinColor};
                cursor: pointer;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                <img 
                    src="${avatarUrl || DEFAULT_AVATAR}" 
                    style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" 
                />
                <div style="
                    position: absolute;
                    bottom: -6px;
                    width: 0;
                    height: 0;
                    border-left-width: 6px;
                    border-left-style: solid;
                    border-left-color: transparent;
                    border-right-width: 6px;
                    border-right-style: solid;
                    border-right-color: transparent;
                    border-top-width: 7px;
                    border-top-style: solid;
                    border-top-color: ${pinColor};
                "></div>
            </div>
        `,
        iconSize: [46, 52],
        iconAnchor: [23, 50],
        popupAnchor: [0, -48]
    });
};

const HomePage = () => {
    const navigate = useNavigate();
    const { mode } = useAppTheme();
    const currentUser = auth.currentUser;

    const [posts, setPosts] = useState([]);
    const [currentUserFriends, setCurrentUserFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    // Listen to current user friends list to enforce visibility rules
    useEffect(() => {
        if (!currentUser) return;
        const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                setCurrentUserFriends(docSnap.data().friends || []);
            }
        });
        return () => unsubUser();
    }, [currentUser]);

    // Realtime posts listener with expiration and privacy filtering
    useEffect(() => {
        const postsRef = collection(db, "posts");
        const unsubscribe = onSnapshot(postsRef, (snapshot) => {
            const now = Date.now();
            const list = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            const visiblePosts = list.filter(post => {
                // Hide past meetups if expiration timestamp has arrived
                if (post.expiresAtMs && post.expiresAtMs <= now) {
                    return false;
                }

                // Verify post visibility permissions
                const postVisibility = post.visibility || 'all';
                const isOwner = currentUser && post.userId === currentUser.uid;

                if (postVisibility === 'all') return true;
                if (postVisibility === 'private') return isOwner;
                if (postVisibility === 'friends') {
                    return isOwner || currentUserFriends.includes(post.userId);
                }
                return true;
            });

            // Ensure valid coordinates or apply fallback dispersion
            const postsWithCoords = visiblePosts.map((post, idx) => {
                let coords = post.coordinates;
                if (!coords || !Array.isArray(coords) || coords.length !== 2) {
                    const randomOffsetLat = (Math.sin(idx * 4.7) * 0.018);
                    const randomOffsetLng = (Math.cos(idx * 3.3) * 0.024);
                    coords = [DEFAULT_CENTER[0] + randomOffsetLat, DEFAULT_CENTER[1] + randomOffsetLng];
                }
                return { ...post, coordinates: coords };
            });

            setPosts(postsWithCoords);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching map posts:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, currentUserFriends]);

    const handleLike = async (post, e) => {
        if (e) e.stopPropagation();
        if (!currentUser || !post.id) return;

        const isLiked = post.likes?.includes(currentUser.uid);
        const postRef = doc(db, "posts", post.id);
        const notifId = `like_${post.id}_${currentUser.uid}`;
        const notifRef = doc(db, "notifications", notifId);

        try {
            if (isLiked) {
                await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
                if (post.userId && post.userId !== currentUser.uid) {
                    await deleteDoc(notifRef);
                }
            } else {
                await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
                if (post.userId && post.userId !== currentUser.uid) {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : null;

                    await setDoc(notifRef, {
                        type: "like",
                        status: "pending",
                        read: false,
                        recipientId: post.userId,
                        senderId: currentUser.uid,
                        senderUsername: userData?.username || currentUser.email?.split('@')[0] || "User",
                        senderAvatar: userData?.avatar || DEFAULT_AVATAR,
                        postId: post.id,
                        postTitle: post.title || "",
                        text: `liked your meetup: "${post.title || 'Untitled'}"`,
                        createdAt: serverTimestamp()
                    });
                }
            }
        } catch (err) {
            console.error("Error toggling like on map:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-gray-100 dark:bg-[#121212]">
                <CircularProgress sx={{ color: '#BA4631' }} />
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative z-0">
            {/* Custom styling for Leaflet popups and markers */}
            <style>{`
                /* Dark mode filter applied directly to OpenStreetMap tiles */
                .dark-mode-tiles .leaflet-tile {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
                }
                
                .leaflet-popup-content-wrapper {
                    padding: 0 !important;
                    border-radius: 24px !important;
                    overflow: hidden !important;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.25) !important;
                    background: ${mode === 'dark' ? '#1c1c1e' : '#ffffff'} !important;
                    color: ${mode === 'dark' ? '#ffffff' : '#1c1c1e'} !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    line-height: normal !important;
                }
                .leaflet-popup-tip {
                    background: ${mode === 'dark' ? '#1c1c1e' : '#ffffff'} !important;
                }
                .custom-leaflet-pin:hover > div {
                    transform: scale(1.15) translateY(-4px);
                }
            `}</style>

            <MapContainer
                center={DEFAULT_CENTER}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
            >
                {/* Standard OpenStreetMap with dynamic CSS filter for dark mode */}
                <TileLayer
                    className={mode === 'dark' ? 'dark-mode-tiles' : ''}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {posts.map((post) => {
                    const isLiked = post.likes?.includes(currentUser?.uid);
                    const isMyPost = Boolean(currentUser && post.userId === currentUser.uid);
                    const pinIcon = createCustomPinIcon(post.avatar, isLiked);
                    const displayCity = post.city || extractCity(post.location) || "Ulm";

                    return (
                        <Marker
                            key={post.id}
                            position={post.coordinates}
                            icon={pinIcon}
                        >
                            <Popup minWidth={290} maxWidth={320} closeButton={false}>
                                <div className="p-4 flex flex-col gap-2.5">

                                    {/* Author row */}
                                    <div
                                        className="flex items-center gap-3 cursor-pointer group"
                                        onClick={() => {
                                            if (isMyPost) {
                                                navigate('/me');
                                            } else if (post.userId) {
                                                navigate(`/profile/${post.userId}`);
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={post.avatar || DEFAULT_AVATAR}
                                            alt={post.username}
                                            sx={{ width: 44, height: 44, border: '2px solid #BA4631' }}
                                        />
                                        <div className="flex flex-col text-left overflow-hidden">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-sm text-gray-900 dark:text-zinc-100 group-hover:text-[#BA4631] transition-colors leading-snug">
                                                    {post.name || post.username}
                                                </span>
                                                {isMyPost && (
                                                    <span className="text-[10px] bg-[#BA4631]/10 text-[#BA4631] font-semibold px-1.5 py-0.5 rounded-md">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-zinc-400">
                                                @{post.username || "user"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meetup details */}
                                    <div className="text-left mt-0.5">
                                        <h4 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                            {post.title}
                                        </h4>

                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex items-center gap-1 text-[11px] text-[#BA4631] font-medium">
                                                <PlaceIcon sx={{ fontSize: 13 }} />
                                                <span className="truncate">{displayCity}</span>
                                            </div>

                                            {post.eventDateTime && (
                                                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <EventRoundedIcon sx={{ fontSize: 13 }} />
                                                    <span>
                                                        {new Date(post.eventDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {post.desc && (
                                        <p className="text-xs text-gray-700 dark:text-zinc-300 text-left line-clamp-3 leading-relaxed">
                                            {post.desc}
                                        </p>
                                    )}

                                    {post.mediaUrl && (
                                        <div className="w-full h-32 rounded-xl overflow-hidden mt-1 bg-gray-100 dark:bg-zinc-800">
                                            <img
                                                src={post.mediaUrl}
                                                alt="Post media"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 mt-1">
                                        <button
                                            type="button"
                                            onClick={(e) => handleLike(post, e)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                                isLiked
                                                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600'
                                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-red-500'
                                            }`}
                                        >
                                            <FavoriteIcon sx={{ fontSize: 16 }} />
                                            <span>{post.likes?.length || 0}</span>
                                        </button>

                                        {/* Navigate to own profile if post author is current user, otherwise open chat */}
                                        {isMyPost ? (
                                            <button
                                                type="button"
                                                onClick={() => navigate('/me')}
                                                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 transition-all"
                                            >
                                                Your Meetup
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => post.userId && navigate(`/messages/${post.userId}`)}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#BA4631] text-white hover:bg-[#a33d2a] shadow-sm transition-all"
                                            >
                                                <SendIcon sx={{ fontSize: 14 }} />
                                                <span>Message</span>
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default HomePage;