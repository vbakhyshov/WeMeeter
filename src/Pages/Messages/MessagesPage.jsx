import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';

import { auth, db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const MessagesPage = () => {
    const { targetUserId } = useParams();
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // listen to all dialogs
    useEffect(() => {
        if (!currentUser) return;

        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chatList = await Promise.all(
                snapshot.docs.map(async (chatDoc) => {
                    const data = chatDoc.data();
                    const friendUid = data.participants.find(id => id !== currentUser.uid);

                    let friendData = { username: "User", avatar: DEFAULT_AVATAR };
                    if (friendUid) {
                        try {
                            const userSnap = await getDoc(doc(db, "users", friendUid));
                            if (userSnap.exists()) {
                                friendData = userSnap.data();
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    return {
                        id: chatDoc.id,
                        friendUid,
                        friendNickname: friendData.name || friendData.username || "User",
                        friendUsername: friendData.username,
                        friendAvatar: friendData.avatar || DEFAULT_AVATAR,
                        lastMessage: data.lastMessage || "",
                        lastMessageTime: data.lastMessageTime || null,
                        isUnread: data.unreadBy?.includes(currentUser.uid) || false
                    };
                })
            );

            // sort dialogs
            chatList.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
            setChats(chatList);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // choosing dialog
    useEffect(() => {
        if (targetUserId) {
            const existing = chats.find(c => c.friendUid === targetUserId);
            if (existing) {
                setSelectedChat(existing);
            } else {
                getDoc(doc(db, "users", targetUserId)).then(snap => {
                    if (snap.exists()) {
                        const d = snap.data();
                        setSelectedChat({
                            friendUid: targetUserId,
                            friendNickname: d.name || d.username || "User",
                            friendUsername: d.username,
                            friendAvatar: d.avatar || DEFAULT_AVATAR,
                            lastMessage: ""
                        });
                    }
                });
            }
        } else if (chats.length > 0 && !selectedChat) {
            setSelectedChat(chats[0]);
        }
    }, [targetUserId, chats]);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        navigate(`/messages/${chat.friendUid}`);
    };

    const filteredChats = chats.filter(c =>
        c.friendNickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.friendUsername?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen w-full bg-gray-100 dark:bg-[#121212] overflow-hidden">
            {/* left side */}
            <div className="w-80 sm:w-96 flex-shrink-0 h-full bg-white dark:bg-[#181818] border-r border-gray-200 dark:border-zinc-800/80 flex flex-col transition-colors">

                {/* Header of search */}
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800/60">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-3 px-1">
                        Messages
                    </h2>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversation..."
                            className="w-full py-2 pl-10 pr-4 rounded-xl text-sm bg-gray-100 dark:bg-[#242424] text-gray-800 dark:text-zinc-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BA4631]/50 transition-all"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 text-gray-400" sx={{ fontSize: 20 }} />
                    </div>
                </div>

                {/* list of dialogs */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-zinc-800/40 custom-scrollbar">
                    {filteredChats.length > 0 ? (
                        filteredChats.map((chat) => {
                            const isSelected = selectedChat?.friendUid === chat.friendUid;
                            return (
                                <div
                                    key={chat.id || chat.friendUid}
                                    onClick={() => handleSelectChat(chat)}
                                    className={`flex items-center gap-3 p-3.5 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-[#BA4631]/10 dark:bg-[#BA4631]/20 text-[#BA4631]'
                                            : 'hover:bg-gray-100 dark:hover:bg-[#222222] text-gray-800 dark:text-zinc-200'
                                    }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar
                                            src={chat.friendAvatar}
                                            alt={chat.friendNickname}
                                            sx={{ width: 48, height: 48 }}
                                        />
                                        {chat.isUnread && (
                                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#BA4631] border-2 border-white dark:border-[#181818] rounded-full" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                                        <div className="flex justify-between items-baseline w-full">
                                            <p className={`text-sm truncate font-semibold leading-tight ${isSelected ? 'text-[#BA4631]' : 'text-gray-900 dark:text-zinc-100'}`}>
                                                {chat.friendNickname}
                                            </p>
                                            {chat.lastMessageTime && (
                                                <span className="text-[11px] text-gray-400 dark:text-zinc-500 flex-shrink-0 ml-2">
                                                    {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs text-left truncate leading-tight mt-1 w-full ${chat.isUnread ? 'font-bold text-gray-900 dark:text-zinc-100' : 'text-gray-500 dark:text-zinc-400'}`}>
                                            {chat.lastMessage || "No messages yet"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                            <ForumIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                            <span>No chats found</span>
                        </div>
                    )}
                </div>
            </div>

            {/* window chat */}
            <div className="flex-1 h-full overflow-hidden">
                <ChatWindow selectedChat={selectedChat} />
            </div>
        </div>
    );
};

export default MessagesPage;