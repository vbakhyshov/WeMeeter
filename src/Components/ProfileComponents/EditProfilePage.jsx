import React, { useState, useEffect } from "react";
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Box, TextField, Button, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (!auth.currentUser) return;
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, formData);
            alert("Profile updated successfully!");
            navigate("/me");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        }
    };

    if (loading) {
        return (
            <Box className="flex justify-center items-center min-h-screen bg-gray-100">
                <CircularProgress sx={{ color: '#BA4631' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#BA4631" mb={3}>
                    Edit Profile
                </Typography>

                <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Avatar Image URL"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        fullWidth
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="First Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            name="surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Age"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Box>

                    <TextField
                        label="About me (Bio)"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        fullWidth
                    />

                    <TextField
                        label="Interests"
                        name="interestsBio"
                        value={formData.interestsBio}
                        onChange={handleInputChange}
                        placeholder="e.g. Football, Coding, Movies"
                        fullWidth
                    />

                    <TextField
                        label="Languages"
                        name="languagesBio"
                        value={formData.languagesBio}
                        onChange={handleInputChange}
                        placeholder="e.g. English, German, Ukrainian"
                        fullWidth
                    />

                    <TextField
                        label="Countries & Territories Visited"
                        name="countriesBio"
                        value={formData.countriesBio}
                        onChange={handleInputChange}
                        placeholder="e.g. Germany, Italy, France"
                        fullWidth
                    />

                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                        Profile Gallery URLs (optional)
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            label="Photo 1 URL"
                            name="picture1"
                            value={formData.picture1}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Photo 2 URL"
                            name="picture2"
                            value={formData.picture2}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Photo 3 URL"
                            name="picture3"
                            value={formData.picture3}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Photo 4 URL"
                            name="picture4"
                            value={formData.picture4}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                bgcolor: '#BA4631',
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                '&:hover': { bgcolor: '#a33d2a' }
                            }}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/me")}
                            sx={{
                                color: '#BA4631',
                                borderColor: '#BA4631',
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                '&:hover': { borderColor: '#a33d2a' }
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditProfilePage;