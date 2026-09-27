import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import PlaceIcon from '@mui/icons-material/Place';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { useNavigate } from 'react-router-dom';

import { auth, db } from '../../firebase/firebase';
import {
    doc,
    getDoc,
    updateDoc,
    setDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'firebase/firestore';
import { extractCity } from '../../utils/geoUtils';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const PostItem = ({ post, isCollapsed }) => {
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const isLiked = post.likes?.includes(currentUser?.uid);
    const targetUserId = post.userId;
    const isMyPost = Boolean(currentUser && targetUserId === currentUser.uid);

    // city
    const displayCity = post.city || extractCity(post.location) || "Ulm";
    const fullAddress = post.location || "";

    // likes
    const handleLike = async (e) => {
        e.stopPropagation();
        if (!currentUser || !post.id) return;

        const postRef = doc(db, "posts", post.id);
        const notifId = `like_${post.id}_${currentUser.uid}`;
        const notifRef = doc(db, "notifications", notifId);

        try {
            if (isLiked) {
                await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
                if (targetUserId && targetUserId !== currentUser.uid) {
                    await deleteDoc(notifRef);
                }
            } else {
                await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
                if (targetUserId && targetUserId !== currentUser.uid) {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : null;

                    await setDoc(notifRef, {
                        type: "like",
                        status: "pending",
                        read: false,
                        recipientId: targetUserId,
                        senderId: currentUser.uid,
                        senderUsername: userData?.username || currentUser.email?.split('@')[0] || "User",
                        senderAvatar: userData?.avatar || DEFAULT_AVATAR,
                        postId: post.id,
                        postTitle: post.title || "",
                        text: `liked your post: "${post.title || 'Untitled'}"`,
                        createdAt: serverTimestamp()
                    });
                }
            }
        } catch (err) {
            console.error("Error updating likes:", err);
        }
    };

    // go to chat
    const handleGoToChat = (e) => {
        e.stopPropagation();
        if (isMyPost) {
            navigate('/me');
            return;
        }

        if (targetUserId) {
            navigate(`/messages/${targetUserId}`);
        } else {
            navigate('/messages');
        }
    };

    const handleAvatarClick = (e) => {
        e.stopPropagation();
        if (isMyPost) {
            navigate('/me');
        } else if (targetUserId) {
            navigate(`/profile/${targetUserId}`);
        }
    };

    if (isCollapsed) {
        return (
            <div
                onClick={handleAvatarClick}
                className="flex justify-center p-2 hover:bg-white/10 rounded-xl cursor-pointer"
            >
                <Avatar
                    src={post.avatar || DEFAULT_AVATAR}
                    alt={post.username || "Avatar"}
                    sx={{ width: 40, height: 40 }}
                />
            </div>
        );
    }

    return (
        <Accordion
            sx={{
                backgroundColor: 'rgba(48,13,0,0.88)',
                color: 'white',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                borderRadius: '16px !important',
                overflow: 'hidden',
                mb: 1.5
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                sx={{
                    padding: '0 12px',
                    '& .MuiAccordionSummary-content': { margin: '12px 0' }
                }}
            >
                <div className="flex items-center gap-3 w-full overflow-hidden">
                    <div
                        onClick={handleAvatarClick}
                        className="transition-transform hover:scale-95 active:scale-90 cursor-pointer flex-shrink-0"
                    >
                        <Avatar
                            src={post.avatar || DEFAULT_AVATAR}
                            alt={post.username || "Avatar"}
                            sx={{ width: 44, height: 44 }}
                        />
                    </div>

                    <div className="flex flex-col text-left overflow-hidden w-full">
                        <div className="flex items-center gap-1.5">
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1.2 }}>
                                {post.name || post.username} {post.age ? `| ${post.age}` : ""}
                            </Typography>
                            {isMyPost && (
                                <span className="text-[9px] bg-white/20 text-white font-bold px-1.5 py-0.2 rounded">
                                    You
                                </span>
                            )}
                        </div>

                        <Typography sx={{ fontSize: '0.85rem', opacity: 0.95, mt: 0.3 }} className="truncate">
                            {post.title}
                        </Typography>

                        {/* city and distance when closed */}
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs opacity-75">
                            <span className="truncate">{displayCity}</span>
                            {typeof post.distanceKm === 'number' && (
                                <>
                                    <span>•</span>
                                    <span className="text-[#ff9d80] font-semibold">{post.distanceKm} km away</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </AccordionSummary>

            {/* full address when open */}
            <AccordionDetails sx={{ pt: 0, px: 2 }}>
                {fullAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1.5, opacity: 0.85, fontSize: '0.75rem', color: '#ffb3a1' }}>
                        <PlaceIcon sx={{ fontSize: 16, mt: 0.2, flexShrink: 0 }} />
                        <span className="leading-snug">{fullAddress}</span>
                    </Box>
                )}

                {post.eventDateTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, opacity: 0.85, fontSize: '0.75rem' }}>
                        <EventRoundedIcon sx={{ fontSize: 16 }} />
                        <span>{new Date(post.eventDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </Box>
                )}

                <Typography
                    sx={{
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        opacity: 0.9,
                        width: '100%',
                        whiteSpace: 'pre-line',
                        lineHeight: 1.5
                    }}
                >
                    {post.desc}
                </Typography>

                {post.mediaUrl && (
                    <Box sx={{ mt: 1.5, borderRadius: 2, overflow: 'hidden' }}>
                        <img
                            src={post.mediaUrl}
                            alt="Post Attachment"
                            style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }}
                        />
                    </Box>
                )}
            </AccordionDetails>

            <AccordionActions sx={{ p: 1, px: 2, justifyContent: 'flex-end', gap: 1 }}>
                <IconButton
                    size="small"
                    onClick={handleLike}
                    sx={{
                        color: isLiked ? '#ff0000' : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 75, 43, 0.15)' }
                    }}
                >
                    <FavoriteIcon fontSize="small" />
                </IconButton>

                {/* no messages if it's yours */}
                {!isMyPost && (
                    <IconButton
                        size="small"
                        onClick={handleGoToChat}
                        sx={{
                            color: '#00ff34',
                            opacity: 0.9,
                            '&:hover': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }
                        }}
                    >
                        <SendIcon fontSize="small" />
                    </IconButton>
                )}
            </AccordionActions>
        </Accordion>
    );
};

export default PostItem;