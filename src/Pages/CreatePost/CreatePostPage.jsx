import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { TextField, Box, Typography, Chip, CircularProgress } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';

import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function CreatePostPage({ onClose }) {
    const [authorProfile, setAuthorProfile] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mediaPreview, setMediaPreview] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setAuthorProfile({ uid: currentUser.uid, ...userDoc.data() });
                } else {
                    setAuthorProfile({
                        uid: currentUser.uid,
                        username: currentUser.email?.split('@')[0] || "user",
                        avatar: DEFAULT_AVATAR,
                        location: "",
                        age: ""
                    });
                }
            } catch (err) {
                console.error("Error fetching author details:", err);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    const handlePost = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "posts"), {
                userId: currentUser.uid,
                username: authorProfile?.username || currentUser.email?.split('@')[0] || "user",
                name: authorProfile?.name || authorProfile?.username || "User",
                avatar: authorProfile?.avatar || DEFAULT_AVATAR,
                location: authorProfile?.location || "",
                age: authorProfile?.age || "",
                title: title.trim(),
                desc: description.trim(),
                tags: tags,
                mediaUrl: mediaPreview || "",
                createdAt: serverTimestamp()
            });

            if (onClose) onClose();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to publish post. Please check permissions.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAttachPhoto = () => {
        const url = window.prompt("Enter image URL:");
        if (url && url.trim()) {
            setMediaPreview(url.trim());
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const formatted = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
            if (!tags.includes(formatted)) {
                setTags([...tags, formatted]);
            }
            setTagInput('');
        }
    };

    const isPostDisabled = (!title.trim() && !description.trim() && !mediaPreview) || isSubmitting;

    if (loadingUser) {
        return (
            <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 4, p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#BA4631' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, textAlign: 'center' }}>
                    Create post
                </Typography>
                {onClose && (
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={authorProfile?.avatar || DEFAULT_AVATAR}
                        alt={authorProfile?.username}
                        sx={{ width: 48, height: 48, mr: 2 }}
                    />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {authorProfile?.name || authorProfile?.username} {authorProfile?.age ? `| ${authorProfile.age}` : ""}
                        </Typography>
                        {authorProfile?.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                                <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                {authorProfile.location}
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Give your post a title..."
                        variant="standard"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '1.4rem', fontWeight: 'bold', mb: 1 }
                        }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder="Share your thoughts, description or details..."
                        variant="standard"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '1rem', color: 'text.primary', lineHeight: 1.5 }
                        }}
                    />

                    {tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, mt: 1 }}>
                            {tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    color="primary"
                                    size="small"
                                />
                            ))}
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        placeholder="Type a tag and press Enter..."
                        variant="standard"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: <LocalOfferIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                            sx: { fontSize: '0.9rem', color: 'text.secondary', mt: 1 }
                        }}
                    />
                </Box>

                {mediaPreview && (
                    <Box sx={{ position: 'relative', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                        <IconButton
                            onClick={() => setMediaPreview('')}
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                )}

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    mb: 3
                }}>
                    <Typography variant="body2" fontWeight="bold">Add to your post</Typography>
                    <IconButton onClick={handleAttachPhoto} color="primary" title="Add Photo URL">
                        <InsertPhotoIcon />
                    </IconButton>
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isPostDisabled}
                    onClick={handlePost}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        bgcolor: '#BA4631',
                        '&:hover': { bgcolor: '#a33d2a' }
                    }}
                >
                    {isSubmitting ? "Posting..." : "Post"}
                </Button>
            </Box>
        </Box>
    );
}