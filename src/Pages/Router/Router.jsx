import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";
import LoginPage from "../LogSign/LoginPage";
import SignupPage from "../LogSign/SignupPage";
import Profile from "../Profile/Profile";
import Messages from "../Messages/MessagesPage";
import CreatePostOverlay from "../CreatePost/CreatePostOverlay";
import NotificationsDrawer from "../../Components/Notifications/NotificationsDrawer";
import ProtectedRoute from "./ProtectedRoute";
import EditProfilePage from "../../Components/ProfileComponents/EditProfilePage";

import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import SettingsPage from "../Settings/SettingsPage";

const Router = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [showCreatePost, setCreatePost] = useState(false);

    const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    const openNotifications = () => setIsNotifOpen(true);
    const closeNotifications = () => setIsNotifOpen(false);

    useEffect(() => {
        setIsNotifOpen(false);

        if (location.pathname.startsWith('/messages')) {
            setIsCollapsed(true);
        }
        if (location.pathname === '/') {
            setIsCollapsed(false);
        }
    }, [location.pathname]);

    // reliable realtime listeners
    useEffect(() => {
        let unsubscribeNotifs = () => {};
        let unsubscribeChats = () => {};

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            unsubscribeNotifs();
            unsubscribeChats();

            if (user) {
                const notifQuery = query(
                    collection(db, "notifications"),
                    where("recipientId", "==", user.uid)
                );

                unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
                    const unreadCount = snapshot.docs.filter((d) => d.data().read === false).length;
                    setUnreadNotifsCount(unreadCount);
                }, (error) => {
                    console.error("Live notifs error:", error);
                });

                const chatsQuery = query(
                    collection(db, "chats"),
                    where("unreadBy", "array-contains", user.uid)
                );

                unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
                    setUnreadMessagesCount(snapshot.size);
                }, (error) => {
                    console.error("Live chats error:", error);
                });
            } else {
                setUnreadNotifsCount(0);
                setUnreadMessagesCount(0);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeNotifs();
            unsubscribeChats();
        };
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
            {!isAuthPage && (
                <div className={`fixed top-0 left-0 h-screen transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-80'}`}>
                    <Sidebar
                        isCollapsed={isCollapsed}
                        toggleSidebar={toggleSidebar}
                        onOpenCreatePost={() => setCreatePost(true)}
                        isNotifOpen={isNotifOpen}
                        onOpenNotifications={openNotifications}
                        onCloseNotifications={closeNotifications}
                        unreadNotifsCount={unreadNotifsCount}
                        unreadMessagesCount={unreadMessagesCount}
                    />
                </div>
            )}

            <div className={`flex-1 transition-all duration-300 ${!isAuthPage ? (isCollapsed ? 'ml-20' : 'ml-80') : ''}`}>
                <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/signup' element={<SignupPage />} />

                    <Route path='/' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path='/me' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path='/profile/:userId' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path='/edit-profile' element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
                    <Route path='/messages' element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path='/messages/:targetUserId' element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path='/settings' element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                </Routes>
            </div>

            {!isAuthPage && (
                <NotificationsDrawer
                    isOpen={isNotifOpen}
                    onClose={closeNotifications}
                    isSidebarCollapsed={isCollapsed}
                />
            )}

            {showCreatePost && (
                <CreatePostOverlay onClose={() => setCreatePost(false)} />
            )}
        </div>
    );
};

export default Router;