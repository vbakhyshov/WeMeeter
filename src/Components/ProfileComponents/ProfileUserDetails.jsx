import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    collection,
    addDoc,
    query,
    where,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

import VerifiedIcon from '@mui/icons-material/Verified';
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import PlaceIcon from '@mui/icons-material/Place';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';

import CreatePostPage from '../../Pages/CreatePost/CreatePostPage';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const ProfileUserDetails = () => {
    const { userId } = useParams();
    const [userData, setUserData] = useState(null);
    const [myUserData, setMyUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [outgoingRequestDocId, setOutgoingRequestDocId] = useState(null);
    const [incomingRequestDocId, setIncomingRequestDocId] = useState(null);

    const [openFriendsList, setOpenFriendsList] = useState(false);
    const [verifiedFriendsList, setVerifiedFriendsList] = useState([]);

    // State for editing post
    const [editingPost, setEditingPost] = useState(null);

    const navigate = useNavigate();
    const currentAuthUser = auth.currentUser;
    const targetUid = userId || currentAuthUser?.uid;
    const isMyProfile = Boolean(currentAuthUser && targetUid === currentAuthUser.uid);

    // 1. Listen to target user and current user
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate("/login");
                return;
            }

            const idToFetch = userId || currentUser.uid;

            // Target user listener
            const userRef = doc(db, "users", idToFetch);
            const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData({ uid: idToFetch, ...docSnap.data() });
                } else {
                    setUserData(null);
                }
                setLoading(false);
            });

            // Logged-in user listener
            const myRef = doc(db, "users", currentUser.uid);
            const unsubscribeMyData = onSnapshot(myRef, (mySnap) => {
                if (mySnap.exists()) {
                    setMyUserData(mySnap.data());
                }
            });

            return () => {
                unsubscribeUser();
                unsubscribeMyData();
            };
        });

        return () => unsubscribeAuth();
    }, [userId, navigate]);

    // 2. Validate and filter out deleted accounts from friends array
    useEffect(() => {
        const rawFriendIds = userData?.friends || [];
        if (rawFriendIds.length === 0) {
            setVerifiedFriendsList([]);
            return;
        }

        let isMounted = true;

        const validateFriends = async () => {
            try {
                const checks = rawFriendIds.map(async (fId) => {
                    const snap = await getDoc(doc(db, "users", fId));
                    return { id: fId, exists: snap.exists(), data: snap.exists() ? snap.data() : null };
                });

                const results = await Promise.all(checks);
                const validAccounts = [];
                const deletedIds = [];

                results.forEach((res) => {
                    if (res.exists) {
                        validAccounts.push({ uid: res.id, ...res.data });
                    } else {
                        deletedIds.push(res.id);
                    }
                });

                if (isMounted) {
                    setVerifiedFriendsList(validAccounts);
                }

                if (deletedIds.length > 0 && targetUid) {
                    const userRef = doc(db, "users", targetUid);
                    deletedIds.forEach(async (deadId) => {
                        await updateDoc(userRef, {
                            friends: arrayRemove(deadId)
                        }).catch(() => {});
                    });
                }
            } catch (err) {
                console.error("Error verifying friends list:", err);
            }
        };

        validateFriends();

        return () => {
            isMounted = false;
        };
    }, [userData?.friends, targetUid]);

    // 3. Listen to user's posts
    useEffect(() => {
        if (!targetUid) return;

        const postsQuery = query(
            collection(db, "posts"),
            where("userId", "==", targetUid)
        );

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            const list = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            list.sort((a, b) => {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
                return timeB - timeA;
            });

            setUserPosts(list);
        });

        return () => unsubscribePosts();
    }, [targetUid]);

    // 4. Friend request listeners
    useEffect(() => {
        if (!currentAuthUser || !targetUid || isMyProfile) return;

        const qOut = query(
            collection(db, "notifications"),
            where("senderId", "==", currentAuthUser.uid),
            where("recipientId", "==", targetUid),
            where("type", "==", "friend_request")
        );
        const unsubOut = onSnapshot(qOut, (snap) => {
            setOutgoingRequestDocId(!snap.empty ? snap.docs[0].id : null);
        });

        const qIn = query(
            collection(db, "notifications"),
            where("senderId", "==", targetUid),
            where("recipientId", "==", currentAuthUser.uid),
            where("type", "==", "friend_request")
        );
        const unsubIn = onSnapshot(qIn, (snap) => {
            setIncomingRequestDocId(!snap.empty ? snap.docs[0].id : null);
        });

        return () => {
            unsubOut();
            unsubIn();
        };
    }, [currentAuthUser, targetUid, isMyProfile]);

    const isFriend = Boolean(myUserData?.friends?.includes(targetUid));

    const handleFriendAction = async () => {
        if (!currentAuthUser || !targetUid || isActionLoading) return;
        setIsActionLoading(true);

        try {
            const myRef = doc(db, "users", currentAuthUser.uid);
            const targetRef = doc(db, "users", targetUid);

            if (isFriend) {
                await updateDoc(myRef, { friends: arrayRemove(targetUid) });
                await updateDoc(targetRef, { friends: arrayRemove(currentAuthUser.uid) });
            } else if (incomingRequestDocId) {
                await updateDoc(myRef, { friends: arrayUnion(targetUid) });
                await updateDoc(targetRef, { friends: arrayUnion(currentAuthUser.uid) });
                await deleteDoc(doc(db, "notifications", incomingRequestDocId));
            } else if (outgoingRequestDocId) {
                await deleteDoc(doc(db, "notifications", outgoingRequestDocId));
            } else {
                await addDoc(collection(db, "notifications"), {
                    type: "friend_request",
                    status: "pending",
                    read: false,
                    recipientId: targetUid,
                    senderId: currentAuthUser.uid,
                    senderUsername: myUserData?.username || currentAuthUser.email?.split('@')[0] || "User",
                    senderAvatar: myUserData?.avatar || DEFAULT_AVATAR,
                    createdAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Error managing friend request:", error);
            alert("Action failed. Check Firestore rules.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await deleteDoc(doc(db, "posts", postId));
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-[#121212]">
                <CircularProgress sx={{ color: '#BA4631' }} />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-[#121212] gap-4">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-zinc-300">User not found</h2>
                <Button variant="contained" onClick={() => navigate("/")} sx={{ bgcolor: '#BA4631' }}>
                    Home
                </Button>
            </div>
        );
    }

    const visiblePostsHistory = userPosts.filter(post => {
        if (isMyProfile) return true;
        const postVis = post.visibility || 'all';
        if (postVis === 'all') return true;
        if (postVis === 'friends') return isFriend;
        return false;
    });

    const sections = [
        { title: "Bio", content: userData?.bio },
        { title: "Interests", content: userData?.interestsBio },
        { title: "Languages", content: userData?.languagesBio },
        { title: "Countries and Territories", content: userData?.countriesBio }
    ];

    const photos = [
        userData?.picture1,
        userData?.picture2,
        userData?.picture3,
        userData?.picture4
    ].filter(Boolean);

    const friendsCount = verifiedFriendsList.length;

    let friendButtonText = "Add Friend";
    if (isFriend) friendButtonText = "Remove Friend";
    else if (incomingRequestDocId) friendButtonText = "Accept Request";
    else if (outgoingRequestDocId) friendButtonText = "Cancel Request";

    return (
        <div className="flex w-full min-h-screen bg-gray-100 dark:bg-[#121212] text-gray-900 dark:text-zinc-100 transition-colors duration-300">
            <div className="w-[15%]"></div>

            <div className="w-[70%] py-10">

                {/* Profile Header */}
                <div className="flex justify-center gap-16 sm:gap-20 mb-10">
                    <div className="flex flex-col items-center">
                        <img
                            className="w-44 h-44 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-[#BA4631] bg-white dark:bg-zinc-800 shadow-md"
                            src={userData?.avatar || DEFAULT_AVATAR}
                            alt="avatar"
                        />
                    </div>

                    <div className="flex flex-col gap-2 text-left pt-3">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            {userData?.name || userData?.surname
                                ? `${userData?.name || ""} ${userData?.surname || ""}`.trim()
                                : userData?.username || "No name"}

                            {userData?.verified && (
                                <VerifiedIcon className="text-[#BA4631]" sx={{ fontSize: 30 }} />
                            )}
                        </h1>

                        <Tooltip title="Click to copy username" arrow placement="top">
                            <h2
                                onClick={() => {
                                    const username = userData?.username || "anonymous";
                                    navigator.clipboard.writeText(`@${username}`);
                                }}
                                className="font-bold text-xl text-gray-500 dark:text-zinc-400 cursor-pointer hover:text-[#BA4631] dark:hover:text-[#BA4631] transition-colors w-fit select-none"
                            >
                                @{userData?.username || "anonymous"}
                            </h2>
                        </Tooltip>

                        <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 font-medium">
                            {[userData?.nationality, (!userData?.hideAge && userData?.age) ? `${userData.age} y.o.` : "", userData?.city]
                                .filter(Boolean)
                                .join(", ") || "No personal details yet"}
                        </p>

                        <div className="flex items-center gap-4 h-auto mt-4">
                            {isMyProfile ? (
                                <button
                                    onClick={() => navigate("/edit-profile")}
                                    className="px-8 py-2.5 bg-[#BA4631] text-white font-semibold rounded-full shadow-md hover:bg-[#a33d2a] transition-colors duration-300"
                                >
                                    Edit
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/messages/${userData.uid}`)}
                                    className="px-8 py-2.5 bg-[#BA4631] text-white font-semibold rounded-full shadow-md hover:bg-[#a33d2a] transition-colors duration-300"
                                >
                                    Message
                                </button>
                            )}

                            {isMyProfile ? (
                                <button
                                    type="button"
                                    onClick={() => setOpenFriendsList(true)}
                                    className="px-8 py-2.5 bg-white dark:bg-[#1e1e1e] text-[#BA4631] font-semibold border-2 border-[#BA4631] rounded-full shadow-sm hover:bg-[#BA4631] hover:text-white transition-colors duration-300"
                                >
                                    Friends ({friendsCount})
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={handleFriendAction}
                                    className={`px-8 py-2.5 font-semibold rounded-full shadow-sm transition-all duration-300 border-2 ${
                                        isFriend
                                            ? 'bg-gray-200 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
                                            : outgoingRequestDocId
                                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-200'
                                                : incomingRequestDocId
                                                    ? 'bg-[#BA4631] border-[#BA4631] text-white hover:bg-[#a33d2a]'
                                                    : 'bg-white dark:bg-[#1e1e1e] text-[#BA4631] border-[#BA4631] hover:bg-[#BA4631] hover:text-white'
                                    }`}
                                >
                                    {isActionLoading ? "Updating..." : friendButtonText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="flex flex-col items-center max-w-3xl mx-auto gap-6 px-6 w-full pb-20">
                    <hr className="w-full border-gray-200 dark:border-zinc-800 my-2" />

                    {photos.length > 0 && (
                        <div className="w-full bg-white dark:bg-[#181818] rounded-3xl shadow-sm p-8 text-left border border-gray-200/70 dark:border-zinc-800 transition-colors">
                            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[500px] sm:h-[650px]">
                                {photos.map((pic, idx) => (
                                    <img
                                        key={idx}
                                        src={pic}
                                        className="w-full h-full object-cover rounded-2xl"
                                        alt={`User gallery item ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {sections.map((section, index) => (
                        <div key={index} className="w-full bg-white dark:bg-[#181818] rounded-3xl shadow-sm p-8 text-left border border-gray-200/70 dark:border-zinc-800 transition-colors">
                            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                {section.title}
                            </h2>
                            <p className="text-base sm:text-lg text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                                {section.content || <span className="text-gray-400 dark:text-zinc-500 italic">Not specified</span>}
                            </p>
                        </div>
                    ))}

                    {/* Posts History */}
                    <div className="w-full bg-white dark:bg-[#181818] rounded-3xl shadow-sm p-8 text-left border border-gray-200/70 dark:border-zinc-800 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Meetup History ({visiblePostsHistory.length})
                            </h2>
                            {isMyProfile && (
                                <span className="text-xs text-gray-400">
                                    Managed by your privacy rules
                                </span>
                            )}
                        </div>

                        {visiblePostsHistory.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
                                No meetups or posts published yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {visiblePostsHistory.map((post) => {
                                    const now = Date.now();
                                    const isExpired = post.expiresAtMs && post.expiresAtMs <= now;

                                    return (
                                        <div
                                            key={post.id}
                                            className="p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/80 bg-gray-50/60 dark:bg-[#202020] transition-all flex flex-col gap-2 relative group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                                                        isExpired
                                                            ? 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'
                                                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                                    }`}>
                                                        {isExpired ? 'PAST MEETUP' : 'ACTIVE ON MAP'}
                                                    </span>

                                                    {isMyProfile && (
                                                        <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">
                                                            {post.visibility === 'all' && '🌍 Public'}
                                                            {post.visibility === 'friends' && '👥 Friends'}
                                                            {post.visibility === 'private' && '🔒 Private'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Edit and Delete Buttons (Owner Only) */}
                                                {isMyProfile && (
                                                    <div className="flex items-center gap-1">
                                                        <Tooltip title="Edit Meetup">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setEditingPost(post)}
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    '&:hover': { color: '#BA4631' }
                                                                }}
                                                            >
                                                                <EditOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Delete Meetup">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeletePost(post.id)}
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    '&:hover': { color: '#ef4444' }
                                                                }}
                                                            >
                                                                <DeleteOutlineRoundedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">
                                                {post.title}
                                            </h3>

                                            {post.desc && (
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                                                    {post.desc}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 pt-1">
                                                {post.location && (
                                                    <span className="flex items-center gap-1 text-[#BA4631] font-medium">
                                                        <PlaceIcon sx={{ fontSize: 14 }} />
                                                        {post.location}
                                                    </span>
                                                )}

                                                {post.eventDateTime && (
                                                    <span className="flex items-center gap-1">
                                                        <EventRoundedIcon sx={{ fontSize: 14 }} />
                                                        {new Date(post.eventDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                )}

                                                <span className="flex items-center gap-1 ml-auto font-medium text-gray-400">
                                                    <FavoriteIcon sx={{ fontSize: 14, color: '#BA4631' }} />
                                                    {post.likes?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {isMyProfile && (
                        <div className="space-x-12 mt-6">
                            <Button
                                onClick={() => navigate("/settings")}
                                sx={{ color: "text.secondary", fontWeight: "bold", textTransform: 'none', fontSize: '1rem' }}
                            >
                                Settings
                            </Button>
                            <Button
                                onClick={handleLogout}
                                sx={{ color: "#ef4444", fontWeight: "bold", textTransform: 'none', fontSize: '1rem' }}
                            >
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-[15%]"></div>

            {/* Friends Dialog */}
            <Dialog
                open={openFriendsList}
                onClose={() => setOpenFriendsList(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#BA4631', pb: 1 }}>
                    Friends ({verifiedFriendsList.length})
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: 'divider' }}>
                    {verifiedFriendsList.length === 0 ? (
                        <p className="text-gray-400 dark:text-zinc-500 text-center py-6">No friends added yet</p>
                    ) : (
                        <List sx={{ py: 0 }}>
                            {verifiedFriendsList.map((f) => (
                                <ListItem
                                    key={f.uid}
                                    button
                                    onClick={() => {
                                        setOpenFriendsList(false);
                                        navigate(`/profile/${f.uid}`);
                                    }}
                                    sx={{ borderRadius: '16px', my: 0.5 }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={f.avatar || DEFAULT_AVATAR} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<span className="font-semibold text-gray-900 dark:text-zinc-100">{f.name || f.username}</span>}
                                        secondary={<span className="text-xs text-gray-500 dark:text-zinc-400">@{f.username || 'user'}</span>}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Post Modal Dialog */}
            <Dialog
                open={Boolean(editingPost)}
                onClose={() => setEditingPost(null)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: '24px',
                        overflow: 'hidden'
                    }
                }}
            >
                {editingPost && (
                    <CreatePostPage
                        postToEdit={editingPost}
                        onClose={() => setEditingPost(null)}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default ProfileUserDetails;