import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import {TextField, Box, Typography, Chip, Stack} from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';

const currentUser = {
    avatar: "https://cdn.pixabay.com/photo/2023/08/20/20/36/irish-setter-8203156_1280.jpg",
    username: "vbakhyshov",
    location: "Location",
    age: "Age"
};

const SUGGESTED_TAGS = [
    "🎥 Movie", "☕️ Coffee", "🧑‍🧑‍🧒‍🧒 Subscription",
    "🎫 Ticket", "⚽️ Sport", "🎉 Party",
    "🏞️ Hang out", "🍕 Eat out"
];

export default function CreatePostPage({ onClose }) {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [mediaPreview, setMediaPreview] = React.useState(null);

    const [tags, setTags] = React.useState([]);
    const [tagInput, setTagInput] = React.useState('');

    const handlePost = () => {
        console.log("Posting:", { title, description, tags });
        if (onClose) onClose();
    };

    const handleAttachPhoto = () => {
        setMediaPreview("https://cdn.pixabay.com/photo/2023/11/10/21/13/paella-8380096_1280.png");
    }

    const handleAddTag = (tagToAdd) => {
        if (!tags.includes(tagToAdd)) {
            setTags([...tags, tagToAdd]);
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault(); // Чтобы не переносило строку
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput(''); // Очищаем поле
        }
    };

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

                    {/* SELECTED TAGS DISPLAY*/}
                    {tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
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
                        placeholder="Add tags (press Enter to add custom)..."
                        variant="standard"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: <LocalOfferIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                            sx: { fontSize: '0.9rem', color: 'text.secondary' }
                        }}
                    />

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Suggestions:
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 1 }}
                    >
                        {SUGGESTED_TAGS.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                variant="outlined"
                                onClick={() => handleAddTag(tag)}
                                clickable
                                disabled={tags.includes(tag)}
                            />
                        ))}
                    </Stack>
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