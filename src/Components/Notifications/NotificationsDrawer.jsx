import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import NotificationItem from './NotificationItem';
import { useNavigate } from 'react-router-dom';

import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    writeBatch,
    deleteDoc,
    arrayUnion
} from 'firebase/firestore';

const NotificationsDrawer = ({ isOpen, onClose, isSidebarCollapsed }) => {
    const [notifications, setNotifications] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const navigate = useNavigate();

    // listen notifs in real time
    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setActiveUser(currentUser);

            if (currentUser) {
                const notifRef = collection(db, "notifications");
                const q = query(
                    notifRef,
                    where("recipientId", "==", currentUser.uid)
                );

                unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const list = snapshot.docs.map((d) => ({
                        id: d.id,
                        ...d.data()
                    }));

                    list.sort((a, b) => {
                        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
                        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
                        return timeB - timeA;
                    });

                    setNotifications(list);
                }, (err) => {
                    console.error("Notifications listener error:", err);
                });
            } else {
                setNotifications([]);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    // all notifs are read
    useEffect(() => {
        if (!isOpen || !activeUser || notifications.length === 0) return;

        const unreadDocs = notifications.filter(n => n.read === false);
        if (unreadDocs.length === 0) return;

        const markAsRead = async () => {
            const batch = writeBatch(db);
            unreadDocs.forEach((item) => {
                batch.update(doc(db, "notifications", item.id), { read: true });
            });
            try {
                await batch.commit();
            } catch (err) {
                console.error("Error marking notifications as read:", err);
            }
        };

        markAsRead();
    }, [isOpen, activeUser, notifications]);

    // close notifs read
    const handleCloseDrawer = async () => {
        if (activeUser) {
            const unreadDocs = notifications.filter(n => n.read === false);
            if (unreadDocs.length > 0) {
                const batch = writeBatch(db);
                unreadDocs.forEach((item) => {
                    batch.update(doc(db, "notifications", item.id), { read: true });
                });
                try {
                    await batch.commit();
                } catch (e) {
                    console.error(e);
                }
            }
        }
        onClose();
    };

    // accept friend
    const handleAccept = async (notif) => {
        if (!activeUser) return;

        setNotifications((prev) => prev.filter((item) => item.id !== notif.id));

        try {
            const batch = writeBatch(db);
            const myRef = doc(db, "users", activeUser.uid);
            const senderRef = doc(db, "users", notif.senderId);
            const notifRef = doc(db, "notifications", notif.id);

            batch.update(myRef, { friends: arrayUnion(notif.senderId) });
            batch.update(senderRef, { friends: arrayUnion(activeUser.uid) });
            batch.delete(notifRef);

            await batch.commit();
        } catch (error) {
            console.error("Error accepting friend request:", error);
            setNotifications((prev) => [notif, ...prev]);
        }
    };

    // decline friend req
    const handleDecline = async (notif) => {
        setNotifications((prev) => prev.filter((item) => item.id !== notif.id));

        try {
            await deleteDoc(doc(db, "notifications", notif.id));
        } catch (error) {
            console.error("Error declining friend request:", error);
            setNotifications((prev) => [notif, ...prev]);
        }
    };

    // delete 1 notif
    const handleDeleteSingle = async (notifId) => {
        setNotifications((prev) => prev.filter((item) => item.id !== notifId));
        try {
            await deleteDoc(doc(db, "notifications", notifId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    // Clear All
    const handleClearAll = async () => {
        if (notifications.length === 0) return;

        const toDelete = [...notifications];
        setNotifications([]);

        try {
            const batch = writeBatch(db);
            toDelete.forEach((item) => {
                batch.delete(doc(db, "notifications", item.id));
            });
            await batch.commit();
        } catch (error) {
            console.error("Error clearing all notifications:", error);
            setNotifications(toDelete);
        }
    };

    const handleUserClick = (targetId) => {
        handleCloseDrawer();
        navigate(`/profile/${targetId}`);
    };

    return (
        <>
            {isOpen && (
                <div
                    className={`fixed inset-0 bg-black/20 z-30 transition-opacity ${
                        isSidebarCollapsed ? 'ml-20' : 'ml-80'
                    }`}
                    onClick={handleCloseDrawer}
                />
            )}

            <div
                className={`
                    fixed top-0 h-screen w-80 bg-white shadow-2xl z-40
                    transition-all duration-300 ease-in-out border-r border-gray-200
                    ${isSidebarCollapsed ? 'left-20' : 'left-80'}
                    ${isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}
                `}
            >
                {/* Header Clear All */}
                <div className="flex justify-between items-center px-4 py-3 border-b">
                    <h2 className="text-lg font-bold text-gray-800">Notifications</h2>

                    <div className="flex items-center gap-1">
                        {notifications.length > 0 && (
                            <Button
                                size="small"
                                startIcon={<DeleteSweepIcon sx={{ fontSize: 16 }} />}
                                onClick={handleClearAll}
                                sx={{
                                    color: '#BA4631',
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    py: 0.2,
                                    px: 1,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: 'rgba(186, 70, 49, 0.08)' }
                                }}
                            >
                                Clear all
                            </Button>
                        )}
                        <IconButton onClick={handleCloseDrawer} size="small">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto h-[calc(100vh-60px)] pb-10">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <NotificationItem
                                key={notif.id}
                                notif={notif}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                                onUserClick={handleUserClick}
                                onDelete={handleDeleteSingle}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-400 text-sm py-12">
                            No notifications yet
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsDrawer;