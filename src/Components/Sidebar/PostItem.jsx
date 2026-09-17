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

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const PostItem = ({ post, isCollapsed }) => {
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const isLiked = post.likes?.includes(currentUser?.uid);
    const targetUserId = post.userId;

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!currentUser || !post.id) return;

        const postRef = doc(db, "posts", post.id);
        const notifId = `like_${post.id}_${currentUser.uid}`;
        const notifRef = doc(db, "notifications", notifId);

        try {
            if (isLiked) {
                // remove like
                await updateDoc(postRef, {
                    likes: arrayRemove(currentUser.uid)
                });

                // remove notif if it was before
                if (targetUserId && targetUserId !== currentUser.uid) {
                    await deleteDoc(notifRef);
                }
            } else {
                // add like notif
                await updateDoc(postRef, {
                    likes: arrayUnion(currentUser.uid)
                });

                // send like notif to other
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
            console.error("Error updating likes and notifications:", err);
        }
    };

    const handleGoToChat = (e) => {
        e.stopPropagation();
        if (targetUserId) {
            navigate(`/messages/${targetUserId}`);
        } else {
            navigate('/messages');
        }
    };

    if (isCollapsed) {
        return (
            <div
                onClick={() => targetUserId && navigate(`/profile/${targetUserId}`)}
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
                backgroundColor: 'rgba(48,13,0,0.84)',
                color: 'white',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                borderRadius: '12px !important',
                overflow: 'hidden',
                mb: 1
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                sx={{
                    padding: '0 8px',
                    '& .MuiAccordionSummary-content': { margin: '12px 0' }
                }}
            >
                <div className="flex items-center gap-3 w-full overflow-hidden">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (targetUserId) navigate(`/profile/${targetUserId}`);
                        }}
                        className="transition-transform hover:scale-95 active:scale-90 cursor-pointer flex-shrink-0"
                    >
                        <Avatar
                            src={post.avatar || DEFAULT_AVATAR}
                            alt={post.username || "Avatar"}
                            sx={{ width: 40, height: 40 }}
                        />
                    </div>

                    <div className="flex flex-col text-left overflow-hidden">
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1.2 }}>
                            {post.name || post.username} {post.age ? `| ${post.age}` : ""}
                        </Typography>

                        <Typography sx={{ fontSize: '0.8rem', opacity: 0.9, mt: 0.5 }} className="truncate">
                            {post.title}
                        </Typography>

                        {post.location && (
                            <Typography sx={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                {post.location}
                            </Typography>
                        )}
                    </div>
                </div>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
                <Typography
                    sx={{
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        opacity: 0.8,
                        width: '100%',
                        whiteSpace: 'pre-line'
                    }}
                >
                    {post.desc}
                </Typography>

                {post.mediaUrl && (
                    <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden' }}>
                        <img
                            src={post.mediaUrl}
                            alt="Post Attachment"
                            style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                        />
                    </Box>
                )}
            </AccordionDetails>

            <AccordionActions sx={{ p: 1, justifyContent: 'flex-end', gap: 1 }}>
                <IconButton
                    size="small"
                    onClick={handleLike}
                    sx={{
                        color: isLiked ? '#ff0000' : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 75, 43, 0.1)' }
                    }}
                >
                    <FavoriteIcon fontSize="small" />
                </IconButton>

                <IconButton
                    size="small"
                    onClick={handleGoToChat}
                    sx={{
                        color: '#00ff34',
                        opacity: 0.8,
                        '&:hover': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                >
                    <SendIcon fontSize="small" />
                </IconButton>
            </AccordionActions>
        </Accordion>
    );
};

export default PostItem;