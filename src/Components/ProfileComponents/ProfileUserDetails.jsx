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

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const ProfileUserDetails = () => {
    const { userId } = useParams();
    const [userData, setUserData] = useState(null);
    const [myUserData, setMyUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [outgoingRequestDocId, setOutgoingRequestDocId] = useState(null);
    const [incomingRequestDocId, setIncomingRequestDocId] = useState(null);

    const [openFriendsList, setOpenFriendsList] = useState(false);
    const [friendsDataList, setFriendsDataList] = useState([]);

    const navigate = useNavigate();
    const currentAuthUser = auth.currentUser;
    const targetUid = userId || currentAuthUser?.uid;
    const isMyProfile = Boolean(currentAuthUser && targetUid === currentAuthUser.uid);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate("/login");
                return;
            }

            const idToFetch = userId || currentUser.uid;

            // 1. listen user
            const userRef = doc(db, "users", idToFetch);
            const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData({ uid: idToFetch, ...docSnap.data() });
                } else {
                    setUserData(null);
                }
                setLoading(false);
            });

            // 2. listen current user
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

    // 3. check friend req
    useEffect(() => {
        if (!currentAuthUser || !targetUid || isMyProfile) return;

        // find my req
        const qOut = query(
            collection(db, "notifications"),
            where("senderId", "==", currentAuthUser.uid),
            where("recipientId", "==", targetUid),
            where("type", "==", "friend_request")
        );
        const unsubOut = onSnapshot(qOut, (snap) => {
            if (!snap.empty) {
                setOutgoingRequestDocId(snap.docs[0].id);
            } else {
                setOutgoingRequestDocId(null);
            }
        });

        // find req to me
        const qIn = query(
            collection(db, "notifications"),
            where("senderId", "==", targetUid),
            where("recipientId", "==", currentAuthUser.uid),
            where("type", "==", "friend_request")
        );
        const unsubIn = onSnapshot(qIn, (snap) => {
            if (!snap.empty) {
                setIncomingRequestDocId(snap.docs[0].id);
            } else {
                setIncomingRequestDocId(null);
            }
        });

        return () => {
            unsubOut();
            unsubIn();
        };
    }, [currentAuthUser, targetUid, isMyProfile]);

    const isFriend = Boolean(myUserData?.friends?.includes(targetUid));

    // obtain friend req
    const handleFriendAction = async () => {
        if (!currentAuthUser || !targetUid || isActionLoading) return;
        setIsActionLoading(true);

        try {
            const myRef = doc(db, "users", currentAuthUser.uid);
            const targetRef = doc(db, "users", targetUid);

            if (isFriend) {
                // remove friend
                await updateDoc(myRef, { friends: arrayRemove(targetUid) });
                await updateDoc(targetRef, { friends: arrayRemove(currentAuthUser.uid) });
            } else if (incomingRequestDocId) {
                // if he sent req too -> accept
                await updateDoc(myRef, { friends: arrayUnion(targetUid) });
                await updateDoc(targetRef, { friends: arrayUnion(currentAuthUser.uid) });
                await deleteDoc(doc(db, "notifications", incomingRequestDocId));
            } else if (outgoingRequestDocId) {
                // if I already sent, cancel
                await deleteDoc(doc(db, "notifications", outgoingRequestDocId));
            } else {
                // send friend req
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

    const handleOpenFriendsDialog = async () => {
        const friendIds = userData?.friends || [];
        if (friendIds.length === 0) {
            setFriendsDataList([]);
            setOpenFriendsList(true);
            return;
        }

        try {
            const promises = friendIds.map((fId) => getDoc(doc(db, "users", fId)));
            const snaps = await Promise.all(promises);
            const loaded = snaps
                .filter(s => s.exists())
                .map(s => ({ uid: s.id, ...s.data() }));

            setFriendsDataList(loaded);
            setOpenFriendsList(true);
        } catch (err) {
            console.error("Error loading friends list:", err);
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
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <CircularProgress sx={{ color: '#BA4631' }} />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 gap-4">
                <h2 className="text-2xl font-bold text-gray-700">User not found</h2>
                <Button variant="contained" onClick={() => navigate("/")} sx={{ bgcolor: '#BA4631' }}>
                    Home
                </Button>
            </div>
        );
    }

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

    const friendsCount = userData?.friends?.length || 0;

    let friendButtonText = "Add Friend";
    if (isFriend) friendButtonText = "Remove Friend";
    else if (incomingRequestDocId) friendButtonText = "Accept Request";
    else if (outgoingRequestDocId) friendButtonText = "Cancel Request";

    return (
        <div className="flex w-full min-h-screen bg-gray-100">
            <div className="w-[15%]"></div>

            <div className="w-[70%] py-10">
                <div className="flex justify-center gap-20 mb-10">
                    <div className="flex flex-col items-center">
                        <img
                            className="w-48 h-48 rounded-full object-cover border-4 border-[#BA4631] bg-white shadow-md"
                            src={userData?.avatar || DEFAULT_AVATAR}
                            alt="avatar"
                        />
                    </div>

                    <div className="flex flex-col gap-2 text-left pt-4">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            {userData?.name || userData?.surname
                                ? `${userData?.name || ""} ${userData?.surname || ""}`.trim()
                                : userData?.username || "No name"}

                            {userData?.verified && (
                                <VerifiedIcon className="text-[#BA4631]" sx={{ fontSize: 30 }} />
                            )}
                        </h1>

                        <h2 className="font-bold text-xl text-gray-500">
                            @{userData?.username || "anonymous"}
                        </h2>

                        <p className="text-xl text-gray-700">
                            {[userData?.nationality, userData?.age ? `${userData.age} y.o.` : "", userData?.location]
                                .filter(Boolean)
                                .join(", ") || "No personal details yet"}
                        </p>

                        <div className="flex items-center gap-4 h-auto mt-4">
                            {isMyProfile ? (
                                <button
                                    onClick={() => navigate("/edit-profile")}
                                    className="px-8 py-3 bg-[#BA4631] text-white font-semibold rounded-full shadow-md hover:bg-[#a33d2a] transition-colors duration-300"
                                >
                                    Edit
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/messages/${userData.uid}`)}
                                    className="px-8 py-3 bg-[#BA4631] text-white font-semibold rounded-full shadow-md hover:bg-[#a33d2a] transition-colors duration-300"
                                >
                                    Message
                                </button>
                            )}

                            {/* ADD FRIEND BUTTON */}
                            {isMyProfile ? (
                                <button
                                    type="button"
                                    onClick={handleOpenFriendsDialog}
                                    className="px-8 py-3 bg-white text-[#BA4631] font-semibold border-2 border-[#BA4631] rounded-full shadow-sm hover:bg-[#BA4631] hover:text-white transition-colors duration-300"
                                >
                                    Friends ({friendsCount})
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={handleFriendAction}
                                    className={`px-8 py-3 font-semibold rounded-full shadow-sm transition-all duration-300 border-2 ${
                                        isFriend
                                            ? 'bg-gray-200 border-gray-300 text-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-400'
                                            : outgoingRequestDocId
                                                ? 'bg-amber-50 border-amber-400 text-amber-800 hover:bg-red-50 hover:text-red-600 hover:border-red-400'
                                                : incomingRequestDocId
                                                    ? 'bg-[#BA4631] border-[#BA4631] text-white hover:bg-[#a33d2a]'
                                                    : 'bg-white text-[#BA4631] border-[#BA4631] hover:bg-[#BA4631] hover:text-white'
                                    }`}
                                >
                                    {isActionLoading ? "Updating..." : friendButtonText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center max-w-3xl mx-auto gap-6 px-6 w-full pb-20">
                    <hr className="w-full border-gray-300 my-2" />

                    {photos.length > 0 && (
                        <div className="w-full bg-white rounded-3xl shadow-lg p-8 text-left">
                            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[600px] sm:h-[800px]">
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
                        <div key={index} className="w-full bg-white rounded-3xl shadow-lg p-8 text-left">
                            <h2 className="text-2xl font-bold mb-4 text-black">
                                {section.title}
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                {section.content || <span className="text-gray-400 italic">Not specified</span>}
                            </p>
                        </div>
                    ))}

                    {isMyProfile && (
                        <div className="space-x-16 mt-8">
                            <Button sx={{ color: "grey" }}>
                                Settings
                            </Button>
                            <Button
                                onClick={handleLogout}
                                sx={{ color: "red", fontWeight: "bold" }}
                            >
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-[15%]"></div>

            <Dialog
                open={openFriendsList}
                onClose={() => setOpenFriendsList(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#BA4631' }}>
                    Friends ({friendsDataList.length})
                </DialogTitle>
                <DialogContent dividers>
                    {friendsDataList.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No friends added yet</p>
                    ) : (
                        <List>
                            {friendsDataList.map((f) => (
                                <ListItem
                                    key={f.uid}
                                    button
                                    onClick={() => {
                                        setOpenFriendsList(false);
                                        navigate(`/profile/${f.uid}`);
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={f.avatar || DEFAULT_AVATAR} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={f.name || f.username}
                                        secondary={`@${f.username || 'user'}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfileUserDetails;