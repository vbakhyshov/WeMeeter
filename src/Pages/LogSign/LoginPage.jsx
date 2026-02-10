import React, { useState } from 'react';
import { auth } from '../../firebase/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (error) {
            alert("Failed to login. Please check your credentials.");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 4 }}>
                    <Typography component="h1" variant="h5" fontWeight="bold" color="#BA4631" gutterBottom>
                        Log In
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal" required fullWidth label="Email Address"
                            autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Password" type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit" fullWidth variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: '#BA4631', '&:hover': { bgcolor: '#a33d2a' } }}
                        >
                            Log In
                        </Button>
                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" color="text.secondary" align="center">
                                Don't have an account? Sign Up
                            </Typography>
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;