import React, { useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                uid: user.uid,
                createdAt: new Date(),
                avatar: "",
                verified: false
            });

            console.log("Registered and Profile Created!");
            navigate("/");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 4 }}>
                    <Typography component="h1" variant="h5" fontWeight="bold" color="#BA4631" gutterBottom>
                        Sign Up for weMeeter
                    </Typography>
                    <Box component="form" onSubmit={handleSignup} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal" required fullWidth label="Username"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Email Address"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Password" type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit" fullWidth variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: '#BA4631', '&:hover': { bgcolor: '#a33d2a' } }}
                        >
                            Sign Up
                        </Button>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" color="text.secondary" align="center">
                                Already have an account? Log In
                            </Typography>
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default SignupPage;