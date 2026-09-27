import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebase';
import {
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAppTheme } from '../../context/ThemeContext';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { mode, toggleTheme } = useAppTheme();
    const [activeTab, setActiveTab] = useState('view'); // 'view' | 'privacy' | 'login' | 'danger'
    const currentUser = auth.currentUser;

    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    // private
    const [privacySettings, setPrivacySettings] = useState({
        isPrivateProfile: false,
        hideAge: false,
        showOnlineStatus: true
    });

    // change email
    const [newEmail, setNewEmail] = useState('');
    const [emailCurrentPassword, setEmailCurrentPassword] = useState('');

    // change password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // remove account
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchUserSettings = async () => {
            try {
                const userSnap = await getDoc(doc(db, "users", currentUser.uid));
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setPrivacySettings({
                        isPrivateProfile: Boolean(data.isPrivateProfile),
                        hideAge: Boolean(data.hideAge),
                        showOnlineStatus: data.showOnlineStatus !== false
                    });
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserSettings();
    }, [currentUser, navigate]);

    const showNotification = (text, type = 'success') => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
    };

    // save privacy settings
    const handleSavePrivacy = async () => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                ...privacySettings
            });
            showNotification("Privacy settings saved successfully!");
        } catch (err) {
            console.error("Error updating privacy:", err);
            showNotification("Failed to update privacy settings", "error");
        }
    };

    // change email
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        if (!newEmail.trim() || !emailCurrentPassword) {
            showNotification("Please provide new email and current password", "error");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, emailCurrentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updateEmail(currentUser, newEmail.trim());
            await updateDoc(doc(db, "users", currentUser.uid), {
                email: newEmail.trim()
            });
            showNotification("Email updated successfully!");
            setNewEmail('');
            setEmailCurrentPassword('');
        } catch (err) {
            console.error("Error changing email:", err);
            showNotification(err.message || "Failed to change email", "error");
        }
    };

    // change password
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showNotification("New passwords do not match", "error");
            return;
        }
        if (newPassword.length < 6) {
            showNotification("Password must be at least 6 characters", "error");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            showNotification("Password changed successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Error updating password:", err);
            showNotification(err.message || "Failed to update password", "error");
        }
    };

    // remove account
    const handleDeleteAccount = async () => {
        if (!deleteConfirmPassword) {
            alert("Please enter your password to confirm");
            return;
        }
        setIsDeleting(true);

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, deleteConfirmPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // remove user from firebase
            await deleteDoc(doc(db, "users", currentUser.uid));

            // remove user from auth
            await deleteUser(currentUser);
            navigate('/signup');
        } catch (err) {
            console.error("Error deleting user:", err);
            alert(err.message || "Failed to delete account. Please re-authenticate.");
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-zinc-900">
                <CircularProgress sx={{ color: '#BA4631' }} />
            </div>
        );
    }

    const tabs = [
        { id: 'view', label: 'View & Theme', icon: <PaletteIcon fontSize="small" /> },
        { id: 'privacy', label: 'Privacy', icon: <SecurityIcon fontSize="small" /> },
        { id: 'login', label: 'Login & Security', icon: <KeyIcon fontSize="small" /> },
        { id: 'danger', label: 'Danger Zone', icon: <DeleteForeverIcon fontSize="small" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 py-10 px-4 sm:px-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">

                {/* top nav */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/me')}
                        className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-[#BA4631] font-semibold transition-colors"
                    >
                        <ArrowBackIcon fontSize="small" />
                        <span>Back to profile</span>
                    </button>
                    <h1 className="text-2xl font-bold text-[#BA4631]">Settings</h1>
                    <div className="w-20"></div>
                </div>

                {statusMsg.text && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 shadow-sm ${
                        statusMsg.type === 'error'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                        <CheckCircleIcon fontSize="small" />
                        <span className="text-sm font-medium">{statusMsg.text}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* tabs */}
                    <div className="w-full md:w-64 bg-white dark:bg-zinc-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 h-fit space-y-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const isDanger = tab.id === 'danger';
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? isDanger
                                                ? 'bg-red-50 text-red-600 dark:bg-red-950/40'
                                                : 'bg-[#BA4631] text-white shadow-md shadow-[#BA4631]/20'
                                            : isDanger
                                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                                                : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700/50'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* current tab content */}
                    <div className="flex-1 bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-700">

                        {/* 1. VIEW / THEME */}
                        {activeTab === 'view' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Appearance & View</h2>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                                        Customize how weMeeter looks on your device.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div
                                        onClick={() => toggleTheme('light')}
                                        className={`cursor-pointer p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                            mode === 'light'
                                                ? 'border-[#BA4631] bg-orange-50/40 shadow-md'
                                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <LightModeIcon sx={{ fontSize: 40, color: mode === 'light' ? '#BA4631' : 'gray' }} />
                                        <span className="font-bold text-gray-800 dark:text-zinc-200">Light Theme</span>
                                        <p className="text-xs text-center text-gray-400">Default bright clean look</p>
                                    </div>

                                    <div
                                        onClick={() => toggleTheme('dark')}
                                        className={`cursor-pointer p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                            mode === 'dark'
                                                ? 'border-[#BA4631] bg-zinc-900 text-white shadow-md'
                                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <DarkModeIcon sx={{ fontSize: 40, color: mode === 'dark' ? '#BA4631' : 'gray' }} />
                                        <span className="font-bold text-gray-800 dark:text-zinc-200">Dark Theme</span>
                                        <p className="text-xs text-center text-gray-400">Easier on the eyes at night</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. PRIVACY */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Privacy Controls</h2>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                                        Control what other members can see about you.
                                    </p>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-zinc-700 space-y-4 pt-2">
                                    <div className="flex items-center justify-between pt-4">
                                        <div>
                                            <p className="font-bold">Private Account</p>
                                            <p className="text-xs text-gray-400">Only approved friends can view your photos & bio</p>
                                        </div>
                                        <Switch
                                            checked={privacySettings.isPrivateProfile}
                                            onChange={(e) => setPrivacySettings(p => ({ ...p, isPrivateProfile: e.target.checked }))}
                                            sx={{ '& .Mui-checked': { color: '#BA4631' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#BA4631' } }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div>
                                            <p className="font-bold">Hide Age on Profile</p>
                                            <p className="text-xs text-gray-400">Do not display your age in profile header and posts</p>
                                        </div>
                                        <Switch
                                            checked={privacySettings.hideAge}
                                            onChange={(e) => setPrivacySettings(p => ({ ...p, hideAge: e.target.checked }))}
                                            sx={{ '& .Mui-checked': { color: '#BA4631' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#BA4631' } }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div>
                                            <p className="font-bold">Show Online Indicator</p>
                                            <p className="text-xs text-gray-400">Allow conversations to show your active status</p>
                                        </div>
                                        <Switch
                                            checked={privacySettings.showOnlineStatus}
                                            onChange={(e) => setPrivacySettings(p => ({ ...p, showOnlineStatus: e.target.checked }))}
                                            sx={{ '& .Mui-checked': { color: '#BA4631' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#BA4631' } }}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        variant="contained"
                                        onClick={handleSavePrivacy}
                                        sx={{
                                            bgcolor: '#BA4631',
                                            borderRadius: '9999px',
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            px: 4,
                                            '&:hover': { bgcolor: '#a33d2a' }
                                        }}
                                    >
                                        Save Privacy Settings
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 3. LOGIN & SECURITY */}
                        {activeTab === 'login' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Login & Security</h2>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                                        Manage your account email and access password.
                                    </p>
                                </div>

                                {/* change email */}
                                <form onSubmit={handleUpdateEmail} className="space-y-4">
                                    <h3 className="font-bold text-gray-700 dark:text-zinc-300">Change Email Address</h3>
                                    <p className="text-xs text-gray-400">Current email: <span className="font-semibold text-gray-700 dark:text-zinc-300">{currentUser?.email}</span></p>

                                    <TextField
                                        label="New Email Address"
                                        type="email"
                                        fullWidth
                                        size="small"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                    />
                                    <TextField
                                        label="Current Password (for verification)"
                                        type="password"
                                        fullWidth
                                        size="small"
                                        value={emailCurrentPassword}
                                        onChange={(e) => setEmailCurrentPassword(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        variant="outlined"
                                        sx={{
                                            color: '#BA4631',
                                            borderColor: '#BA4631',
                                            borderRadius: '9999px',
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            '&:hover': { borderColor: '#a33d2a', bgcolor: 'rgba(186,70,49,0.05)' }
                                        }}
                                    >
                                        Update Email
                                    </Button>
                                </form>

                                <hr className="border-gray-100 dark:border-zinc-700" />

                                {/* change password */}
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <h3 className="font-bold text-gray-700 dark:text-zinc-300">Change Password</h3>
                                    <TextField
                                        label="Current Password"
                                        type="password"
                                        fullWidth
                                        size="small"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <TextField
                                        label="New Password"
                                        type="password"
                                        fullWidth
                                        size="small"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <TextField
                                        label="Confirm New Password"
                                        type="password"
                                        fullWidth
                                        size="small"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#BA4631',
                                            borderRadius: '9999px',
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            '&:hover': { bgcolor: '#a33d2a' }
                                        }}
                                    >
                                        Update Password
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* DANGER ZONE remove account */}
                        {activeTab === 'danger' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-red-600 mb-1">Danger Zone</h2>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                                        Irreversible actions for your account.
                                    </p>
                                </div>

                                <div className="p-6 border border-red-200 dark:border-red-900/60 rounded-2xl bg-red-50/40 dark:bg-red-950/20 space-y-4">
                                    <h3 className="font-bold text-red-700 dark:text-red-400">Delete Account</h3>
                                    <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                                        Once deleted, all your profile data, photos, friendships, and conversations will be permanently deleted from our database. This action cannot be undone.
                                    </p>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => setOpenDeleteDialog(true)}
                                        sx={{
                                            borderRadius: '9999px',
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            px: 3
                                        }}
                                    >
                                        Delete My Account
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* are you sure button */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                    Confirm Account Deletion
                </DialogTitle>
                <DialogContent>
                    <p className="text-sm text-gray-600 mb-4">
                        Please enter your current password to verify your identity before deleting your account permanently:
                    </p>
                    <TextField
                        autoFocus
                        label="Your Password"
                        type="password"
                        fullWidth
                        size="small"
                        value={deleteConfirmPassword}
                        onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        sx={{ textTransform: 'none', color: 'gray' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={isDeleting}
                        onClick={handleDeleteAccount}
                        sx={{ borderRadius: '9999px', textTransform: 'none', fontWeight: 'bold' }}
                    >
                        {isDeleting ? "Deleting..." : "Permanently Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SettingsPage;