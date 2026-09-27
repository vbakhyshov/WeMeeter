import React, { useState, useEffect } from "react";
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
    TextField,
    Button,
    Typography,
    CircularProgress,
    Avatar,
    IconButton,
    Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const textFieldThemeSx = {
    '& .MuiOutlinedInput-root': {
        color: 'inherit',
        backgroundColor: 'transparent',
        borderRadius: '16px',
        '& fieldset': {
            borderColor: 'rgba(156, 163, 175, 0.35)',
        },
        '&:hover fieldset': {
            borderColor: '#BA4631',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#BA4631',
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'text.secondary',
        '&.Mui-focused': {
            color: '#BA4631',
        },
    },
    '& .MuiFormHelperText-root': {
        color: 'text.secondary',
    }
};

const EditProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        avatar: "",
        name: "",
        surname: "",
        age: "",
        nationality: "",
        location: "",
        interestsBio: "",
        languagesBio: "",
        countriesBio: "",
        bio: "",
        picture1: "",
        picture2: "",
        picture3: "",
        picture4: ""
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setFormData({
                            avatar: data.avatar || "",
                            name: data.name || "",
                            surname: data.surname || "",
                            age: data.age || "",
                            nationality: data.nationality || "",
                            location: data.location || "",
                            interestsBio: data.interestsBio || "",
                            languagesBio: data.languagesBio || "",
                            countriesBio: data.countriesBio || "",
                            bio: data.bio || "",
                            picture1: data.picture1 || "",
                            picture2: data.picture2 || "",
                            picture3: data.picture3 || "",
                            picture4: data.picture4 || ""
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                navigate("/login");
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarPrompt = () => {
        const url = window.prompt("Enter new avatar image URL:", formData.avatar);
        if (url !== null) {
            setFormData(prev => ({ ...prev, avatar: url.trim() }));
        }
    };

    const handleGalleryPrompt = (key) => {
        const currentUrl = formData[key];
        const url = window.prompt("Enter image URL for photo:", currentUrl);
        if (url !== null) {
            setFormData(prev => ({ ...prev, [key]: url.trim() }));
        }
    };

    const handleClearPhoto = (key) => {
        setFormData(prev => ({ ...prev, [key]: "" }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (!auth.currentUser) return;
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, formData);
            setShowSuccess(true);
            setTimeout(() => {
                navigate("/me");
            }, 800);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-[#121212]">
                <CircularProgress sx={{ color: '#BA4631' }} />
            </div>
        );
    }

    const gallerySlots = [
        { key: "picture1", label: "Photo 1" },
        { key: "picture2", label: "Photo 2" },
        { key: "picture3", label: "Photo 3" },
        { key: "picture4", label: "Photo 4" }
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#121212] text-gray-900 dark:text-zinc-100 py-10 px-4 sm:px-6 transition-colors duration-300">
            <div className="max-w-3xl mx-auto">

                {/* header nav */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        type="button"
                        onClick={() => navigate("/me")}
                        className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-[#BA4631] dark:hover:text-[#BA4631] font-semibold transition-colors duration-200"
                    >
                        <ArrowBackIcon fontSize="small" />
                        <span>Back to profile</span>
                    </button>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#BA4631' }}>
                        Edit Profile
                    </Typography>
                    <div className="w-20"></div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">

                    {/* pfp and fields */}
                    <div className="bg-white dark:bg-[#181818] rounded-3xl shadow-sm border border-gray-200/70 dark:border-zinc-800 p-8 transition-colors">
                        <div className="flex flex-col sm:flex-row items-center gap-8 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                            <div className="relative group">
                                <Avatar
                                    src={formData.avatar || DEFAULT_AVATAR}
                                    alt="Avatar Preview"
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '4px solid #BA4631',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAvatarPrompt}
                                    className="absolute bottom-1 right-1 p-2 bg-[#BA4631] text-white rounded-full shadow-lg hover:bg-[#a33d2a] hover:scale-105 transition-all"
                                    title="Change Avatar URL"
                                >
                                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                                </button>
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <TextField
                                    label="Avatar URL"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleInputChange}
                                    placeholder="https://images.unsplash.com/..."
                                    fullWidth
                                    size="small"
                                    sx={textFieldThemeSx}
                                />
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                    Paste a direct link to an image (Unsplash, Pixabay, etc.)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextField
                                label="First Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                fullWidth
                                sx={textFieldThemeSx}
                            />
                            <TextField
                                label="Last Name"
                                name="surname"
                                value={formData.surname}
                                onChange={handleInputChange}
                                fullWidth
                                sx={textFieldThemeSx}
                            />
                            <TextField
                                label="Age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleInputChange}
                                fullWidth
                                sx={textFieldThemeSx}
                            />
                            <TextField
                                label="Nationality"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleInputChange}
                                placeholder="e.g. Ukrainian, German"
                                fullWidth
                                sx={textFieldThemeSx}
                            />
                            <div className="sm:col-span-2">
                                <TextField
                                    label="Current Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Ulm, Germany"
                                    fullWidth
                                    sx={textFieldThemeSx}
                                />
                            </div>
                        </div>
                    </div>

                    {/* bio */}
                    <div className="bg-white dark:bg-[#181818] rounded-3xl shadow-sm border border-gray-200/70 dark:border-zinc-800 p-8 space-y-4 transition-colors">
                        <Typography variant="h6" fontWeight="bold" className="text-gray-900 dark:text-zinc-100">
                            About & Highlights
                        </Typography>

                        <TextField
                            label="About me (Bio)"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            placeholder="Tell people who you are and what you enjoy..."
                            fullWidth
                            sx={textFieldThemeSx}
                        />

                        <TextField
                            label="Interests"
                            name="interestsBio"
                            value={formData.interestsBio}
                            onChange={handleInputChange}
                            placeholder="e.g. Football, Coding, Cinema, Gym, Table Tennis"
                            fullWidth
                            sx={textFieldThemeSx}
                        />

                        <TextField
                            label="Languages"
                            name="languagesBio"
                            value={formData.languagesBio}
                            onChange={handleInputChange}
                            placeholder="e.g. English, German, Ukrainian, Russian"
                            fullWidth
                            sx={textFieldThemeSx}
                        />

                        <TextField
                            label="Countries & Territories Visited"
                            name="countriesBio"
                            value={formData.countriesBio}
                            onChange={handleInputChange}
                            placeholder="e.g. Germany, Ukraine, Azerbaijan, Italy"
                            fullWidth
                            sx={textFieldThemeSx}
                        />
                    </div>

                    {/* photos */}
                    <div className="bg-white dark:bg-[#181818] rounded-3xl shadow-sm border border-gray-200/70 dark:border-zinc-800 p-8 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <Typography variant="h6" fontWeight="bold" className="text-gray-900 dark:text-zinc-100">
                                    Profile Gallery
                                </Typography>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                    Add up to 4 photos to show on your profile grid
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {gallerySlots.map(({ key, label }) => {
                                const photoUrl = formData[key];
                                return (
                                    <div
                                        key={key}
                                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-[#BA4631] dark:hover:border-[#BA4631] transition-all flex flex-col items-center justify-center bg-gray-50 dark:bg-[#202020] group"
                                    >
                                        {photoUrl ? (
                                            <>
                                                <img
                                                    src={photoUrl}
                                                    alt={label}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <Tooltip title="Change photo">
                                                        <IconButton
                                                            onClick={() => handleGalleryPrompt(key)}
                                                            sx={{ bgcolor: 'white', color: '#BA4631', '&:hover': { bgcolor: '#f3f4f6' } }}
                                                            size="small"
                                                        >
                                                            <PhotoCameraIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove photo">
                                                        <IconButton
                                                            onClick={() => handleClearPhoto(key)}
                                                            sx={{ bgcolor: 'white', color: 'red', '&:hover': { bgcolor: '#fee2e2' } }}
                                                            size="small"
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleGalleryPrompt(key)}
                                                className="flex flex-col items-center justify-center w-full h-full text-gray-400 dark:text-zinc-500 hover:text-[#BA4631] dark:hover:text-[#BA4631] transition-colors p-4"
                                            >
                                                <AddPhotoAlternateIcon sx={{ fontSize: 36, mb: 1, opacity: 0.7 }} />
                                                <span className="text-xs font-semibold">{label}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">Click to add URL</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* save button */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => navigate("/me")}
                            disabled={isSaving}
                            sx={{
                                color: 'text.primary',
                                borderColor: 'rgba(156, 163, 175, 0.4)',
                                px: 4,
                                py: 1.5,
                                borderRadius: '9999px',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': { borderColor: 'rgba(156, 163, 175, 0.8)', bgcolor: 'action.hover' }
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSaving}
                            startIcon={showSuccess ? <CheckCircleIcon /> : null}
                            sx={{
                                bgcolor: showSuccess ? '#16a34a' : '#BA4631',
                                px: 5,
                                py: 1.5,
                                borderRadius: '9999px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 14px rgba(186, 70, 49, 0.3)',
                                '&:hover': { bgcolor: showSuccess ? '#15803d' : '#a33d2a' }
                            }}
                        >
                            {isSaving ? "Saving..." : showSuccess ? "Saved!" : "Save Changes"}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;