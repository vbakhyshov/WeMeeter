import React, { useState, useEffect, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const INITIAL_MAP_CENTER = [48.3994, 9.9933];

const selectorPinIcon = L.divIcon({
    className: 'selector-pin',
    html: `
        <div style="
            width: 28px;
            height: 28px;
            background: #BA4631;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const MapClickHandler = ({ onLocationPick }) => {
    useMapEvents({
        click(e) {
            onLocationPick([e.latlng.lat, e.latlng.lng]);
        }
    });
    return null;
};

const MapViewController = ({ center }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { animate: true });
        }
    }, [center, map]);
    return null;
};

export default function CreatePostPage({ onClose, postToEdit = null }) {
    const isEditing = Boolean(postToEdit);

    const [authorProfile, setAuthorProfile] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [title, setTitle] = useState(postToEdit?.title || '');
    const [description, setDescription] = useState(postToEdit?.desc || '');
    const [eventDateTime, setEventDateTime] = useState(postToEdit?.eventDateTime || '');
    const [visibility, setVisibility] = useState(postToEdit?.visibility || 'all');
    const [mediaPreview, setMediaPreview] = useState(postToEdit?.mediaUrl || '');
    const [tags, setTags] = useState(postToEdit?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [city, setCity] = useState(postToEdit?.city || 'Ulm');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [locationQuery, setLocationQuery] = useState(postToEdit?.location || '');
    const [selectedCoords, setSelectedCoords] = useState(postToEdit?.coordinates || INITIAL_MAP_CENTER);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(false);
    const searchDebounceRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setAuthorProfile({ uid: currentUser.uid, ...data });
                    if (!isEditing && data.location) {
                        setLocationQuery(data.location);
                    }
                } else {
                    setAuthorProfile({
                        uid: currentUser.uid,
                        username: currentUser.email?.split('@')[0] || "user",
                        avatar: DEFAULT_AVATAR
                    });
                }
            } catch (err) {
                console.error("Error fetching author:", err);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, [isEditing]);

    const handleAddressInputChange = (text) => {
        setLocationQuery(text);

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        if (!text.trim() || text.length < 3) {
            setSearchResults([]);
            return;
        }

        searchDebounceRef.current = setTimeout(async () => {
            setIsSearchingLocation(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5&addressdetails=1`
                );
                const data = await response.json();
                setSearchResults(data || []);
            } catch (err) {
                console.error("Geocoding lookup error:", err);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 400);
    };

    const handleSelectAddressSuggestion = (item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const resolvedCity = item.address?.city ||
            item.address?.town ||
            item.address?.municipality ||
            item.address?.village ||
            "Ulm";

        setSelectedCoords([lat, lon]);
        setLocationQuery(item.display_name);
        setCity(resolvedCity);
        setSearchResults([]);
    };

    const handleMapCoordinatePick = async (coords) => {
        setSelectedCoords(coords);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
            );
            const data = await res.json();
            if (data && data.display_name) {
                setLocationQuery(data.display_name);
                const resolvedCity = data.address?.city ||
                    data.address?.town ||
                    data.address?.municipality ||
                    data.address?.village ||
                    "Ulm";
                setCity(resolvedCity);
            }
        } catch (e) {
            console.error("Reverse geocoding error:", e);
        }
    };

    const handlePost = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser || isSubmitting) return;

        setIsSubmitting(true);
        const resolvedLocation = locationQuery.trim() || "Selected on map";
        const eventExpiresAtMs = eventDateTime ? new Date(eventDateTime).getTime() : null;

        try {
            if (isEditing) {
                // Update existing post
                const postRef = doc(db, "posts", postToEdit.id);
                await updateDoc(postRef, {
                    title: title.trim(),
                    desc: description.trim(),
                    location: resolvedLocation,
                    city: city || "Ulm",
                    coordinates: selectedCoords,
                    eventDateTime: eventDateTime || null,
                    expiresAtMs: eventExpiresAtMs,
                    visibility: visibility,
                    tags: tags,
                    mediaUrl: mediaPreview || "",
                    updatedAt: serverTimestamp()
                });
            } else {
                // Create new post
                await addDoc(collection(db, "posts"), {
                    userId: currentUser.uid,
                    username: authorProfile?.username || currentUser.email?.split('@')[0] || "user",
                    name: authorProfile?.name || authorProfile?.username || "User",
                    avatar: authorProfile?.avatar || DEFAULT_AVATAR,
                    location: resolvedLocation,
                    city: city || "Ulm",
                    coordinates: selectedCoords,
                    age: authorProfile?.age || "",
                    title: title.trim(),
                    desc: description.trim(),
                    eventDateTime: eventDateTime || null,
                    expiresAtMs: eventExpiresAtMs,
                    visibility: visibility,
                    tags: tags,
                    mediaUrl: mediaPreview || "",
                    likes: [],
                    createdAt: serverTimestamp()
                });
            }

            if (onClose) onClose();
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAttachPhoto = () => {
        const url = window.prompt("Enter image URL:", mediaPreview);
        if (url !== null) {
            setMediaPreview(url.trim());
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((t) => t !== tagToDelete));
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
            <div className="bg-white dark:bg-[#181818] rounded-3xl p-10 flex justify-center items-center shadow-xl">
                <CircularProgress sx={{ color: '#BA4631' }} />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#181818] text-gray-900 dark:text-zinc-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col transition-colors">

            {/* Header */}
            <div className="relative px-6 py-4 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {isEditing ? "Edit Meetup / Post" : "Create Meetup / Post"}
                </h3>
                {onClose && (
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            position: 'absolute',
                            right: 14,
                            top: 12,
                            color: 'text.secondary',
                            bgcolor: 'action.hover',
                            '&:hover': { color: '#BA4631' }
                        }}
                    >
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                )}
            </div>

            {/* Form Container */}
            <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto custom-scrollbar">

                {/* Author row & Privacy */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={authorProfile?.avatar || DEFAULT_AVATAR}
                            alt={authorProfile?.username}
                            sx={{ width: 44, height: 44, border: '2px solid #BA4631' }}
                        />
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-sm text-gray-900 dark:text-zinc-100 leading-tight">
                                {authorProfile?.name || authorProfile?.username}
                            </span>
                            <span className="text-xs text-gray-400">
                                @{authorProfile?.username || "user"}
                            </span>
                        </div>
                    </div>

                    <FormControl size="small">
                        <Select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            sx={{
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'text.primary',
                                height: 34,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' }
                            }}
                        >
                            <MenuItem value="all">🌍 Everyone</MenuItem>
                            <MenuItem value="friends">👥 My Friends</MenuItem>
                            <MenuItem value="private">🔒 Only Me</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                {/* Title & Description */}
                <div className="space-y-2 pt-1">
                    <TextField
                        fullWidth
                        placeholder="What is this meetup about? (Title)..."
                        variant="standard"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '1.25rem', fontWeight: 700, color: 'inherit' }
                        }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder="Add details, meetup spot, agenda..."
                        variant="standard"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '0.95rem', color: 'inherit', lineHeight: 1.5 }
                        }}
                    />
                </div>

                {/* Smart Address Search & Event DateTime */}
                <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Live Address Search with Autocomplete */}
                        <div className="relative">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 focus-within:border-[#BA4631] transition-colors">
                                <PlaceOutlinedIcon sx={{ fontSize: 18, color: '#BA4631' }} />
                                <input
                                    type="text"
                                    value={locationQuery}
                                    onChange={(e) => handleAddressInputChange(e.target.value)}
                                    placeholder="Search exact address or place..."
                                    className="w-full bg-transparent text-xs text-gray-800 dark:text-zinc-200 placeholder-gray-400 focus:outline-none"
                                />
                                {isSearchingLocation && (
                                    <CircularProgress size={14} sx={{ color: '#BA4631' }} />
                                )}
                            </div>

                            {searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-zinc-700/60 max-h-48 overflow-y-auto text-left">
                                    {searchResults.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectAddressSuggestion(item)}
                                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-700/60 cursor-pointer text-xs text-gray-800 dark:text-zinc-200 leading-snug"
                                        >
                                            <p className="font-semibold text-[11px] truncate text-[#BA4631]">
                                                {item.name || item.address?.road || "Location"}
                                            </p>
                                            <p className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-1">
                                                {item.display_name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Event DateTime Picker */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80">
                            <EventRoundedIcon sx={{ fontSize: 18, color: '#BA4631' }} />
                            <input
                                type="datetime-local"
                                value={eventDateTime}
                                onChange={(e) => setEventDateTime(e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-800 dark:text-zinc-200 placeholder-gray-400 focus:outline-none"
                                title="Active until event time"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <button
                            type="button"
                            onClick={() => setShowMiniMap(!showMiniMap)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#BA4631] hover:underline"
                        >
                            <MapOutlinedIcon sx={{ fontSize: 16 }} />
                            <span>{showMiniMap ? "Hide Map Picker" : "Select exact point on map"}</span>
                        </button>

                        <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                            Coordinates: {selectedCoords[0].toFixed(4)}, {selectedCoords[1].toFixed(4)}
                        </span>
                    </div>

                    {showMiniMap && (
                        <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700 relative z-10 shadow-inner">
                            <MapContainer
                                center={selectedCoords}
                                zoom={15}
                                style={{ height: "100%", width: "100%" }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap"
                                />
                                <Marker position={selectedCoords} icon={selectorPinIcon} />
                                <MapClickHandler onLocationPick={handleMapCoordinatePick} />
                                <MapViewController center={selectedCoords} />
                            </MapContainer>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] py-1 px-2.5 rounded-lg pointer-events-none text-center">
                                Click anywhere on the map to set the exact meetup spot
                            </div>
                        </div>
                    )}
                </div>

                {/* Media Preview */}
                {mediaPreview && (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-black/5">
                        <img
                            src={mediaPreview}
                            alt="Media Preview"
                            className="w-full max-h-52 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                            <Tooltip title="Remove photo">
                                <IconButton
                                    size="small"
                                    onClick={() => setMediaPreview('')}
                                    sx={{
                                        bgcolor: 'rgba(0, 0, 0, 0.65)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.9)' }
                                    }}
                                >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                onDelete={() => handleDeleteTag(tag)}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(186, 70, 49, 0.1)',
                                    color: '#BA4631',
                                    fontWeight: 600,
                                    borderRadius: '8px'
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800/60 border border-transparent focus-within:border-[#BA4631]/40 transition-all">
                    <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="Add tags (press Enter)..."
                        className="w-full bg-transparent text-xs text-gray-800 dark:text-zinc-200 placeholder-gray-400 focus:outline-none"
                    />
                </div>

                {/* Attachments bar */}
                <div className="flex items-center justify-between p-3 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40">
                    <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        {mediaPreview ? "Change photo attachment" : "Add photo attachment"}
                    </span>
                    <Tooltip title="Attach Image URL">
                        <IconButton
                            onClick={handleAttachPhoto}
                            size="small"
                            sx={{
                                color: '#BA4631',
                                bgcolor: 'rgba(186, 70, 49, 0.08)',
                                '&:hover': { bgcolor: 'rgba(186, 70, 49, 0.15)' }
                            }}
                        >
                            <AddPhotoAlternateRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>

                {/* Submit button */}
                <Button
                    variant="contained"
                    fullWidth
                    disabled={isPostDisabled}
                    onClick={handlePost}
                    sx={{
                        py: 1.4,
                        borderRadius: '9999px',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        bgcolor: '#BA4631',
                        boxShadow: '0 4px 14px rgba(186, 70, 49, 0.3)',
                        '&:hover': { bgcolor: '#a33d2a' }
                    }}
                >
                    {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Post Meetup"}
                </Button>
            </div>
        </div>
    );
}