import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { TextField, Box, Typography } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';

const currentUser = {
    avatar: "https://cdn.pixabay.com/photo/2023/08/20/20/36/irish-setter-8203156_1280.jpg",
    username: "vbakhyshov",
    location: "Ulm, Germany",
    age: "21"
};

export default function CreatePostPage({ onClose }) {
    // 1. Создаем два отдельных состояния для заголовка и описания
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [mediaPreview, setMediaPreview] = React.useState(null);

    const handlePost = () => {
        // Логируем оба поля
        console.log("Posting:", { title, description });
        if (onClose) onClose();
    };

    const handleAttachPhoto = () => {
        setMediaPreview("https://cdn.pixabay.com/photo/2023/11/10/21/13/paella-8380096_1280.png");
    }

    // Кнопка активна, если есть (Заголовок ИЛИ Описание) ИЛИ Картинка
    const isPostDisabled = (!title.trim() && !description.trim() && !mediaPreview);

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3, overflow: 'hidden' }}>

            {/* HEADER */}
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
                {/* USER INFO */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={currentUser.avatar}
                        alt={currentUser.username}
                        sx={{ width: 48, height: 48, mr: 2 }}
                    />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {currentUser.username} | {currentUser.age}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
                            <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {currentUser.location}
                        </Box>
                    </Box>
                </Box>

                {/* INPUT FIELDS */}
                <Box sx={{ mb: 2 }}>
                    {/* TITLE */}
                    <TextField
                        fullWidth
                        placeholder="Give your post a title..."
                        variant="standard"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                mb: 1
                            }
                        }}
                    />

                    {/* DESCRIPTION */}
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
                            sx: {
                                fontSize: '1rem',
                                color: 'text.primary',
                                lineHeight: 1.5
                            }
                        }}
                    />
                </Box>

                {/* MEDIA PREVIEW */}
                {mediaPreview && (
                    <Box sx={{ position: 'relative', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                        <IconButton
                            onClick={() => setMediaPreview(null)}
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                )}

                {/* ACTIONS */}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={handleAttachPhoto} color="primary" title="Photo/Video">
                            <InsertPhotoIcon />
                        </IconButton>
                        <IconButton color="error" title="Tag People">
                            <LocalOfferIcon />
                        </IconButton>
                        <IconButton color="warning" title="Feeling/Activity">
                            <EmojiEmotionsIcon />
                        </IconButton>
                        <IconButton color="success" title="Check in">
                            <LocationOnIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* POST BUTTON */}
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
                    Post
                </Button>
            </Box>
        </Box>
    );
}