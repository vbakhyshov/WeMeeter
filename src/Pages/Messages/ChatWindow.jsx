import React, { useEffect, useState, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { useNavigate } from 'react-router-dom';

import { db, auth } from '../../firebase/firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const ChatWindow = ({ selectedChat }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const currentUser = auth.currentUser;
    const currentId = currentUser?.uid;
    const partnerId = selectedChat?.friendUid || selectedChat?.uid || selectedChat?.id;

    const chatId = (currentId && partnerId)
        ? [String(currentId), String(partnerId)].sort().join('_')
        : null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // read status
    useEffect(() => {
        if (!chatId || !currentUser) return;
        const chatDocRef = doc(db, "chats", chatId);
        updateDoc(chatDocRef, {
            unreadBy: arrayRemove(currentUser.uid)
        }).catch(() => {});
    }, [chatId, currentUser]);

    // listen to message
    useEffect(() => {
        if (!chatId || !currentUser) {
            setMessages([]);
            return;
        }

        const messagesRef = collection(db, "chats", chatId, "messages");
        const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            fetched.sort((a, b) => {
                const timeA = a.createdAtMs || a.timestamp?.toMillis?.() || 0;
                const timeB = b.createdAtMs || b.timestamp?.toMillis?.() || 0;
                return timeA - timeB;
            });

            setMessages(fetched);

            updateDoc(doc(db, "chats", chatId), {
                unreadBy: arrayRemove(currentUser.uid)
            }).catch(() => {});
        }, (error) => {
            console.error("Chat listener error:", error);
        });

        return () => unsubscribe();
    }, [chatId, currentUser]);

    // send message
    const handleSend = async () => {
        if (!newMessage.trim() || !chatId || !currentUser || !partnerId) return;

        const text = newMessage.trim();
        setNewMessage("");

        try {
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text,
                senderUid: currentUser.uid,
                recipientUid: partnerId,
                createdAtMs: Date.now(),
                timestamp: serverTimestamp()
            });

            const chatDocRef = doc(db, "chats", chatId);
            await setDoc(chatDocRef, {
                participants: [currentUser.uid, partnerId],
                lastMessage: text,
                lastMessageTime: Date.now(),
                unreadBy: arrayUnion(partnerId)
            }, { merge: true });

            inputRef.current?.focus();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!selectedChat) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-[#121212] text-gray-400 dark:text-zinc-600 transition-colors">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <ForumRoundedIcon sx={{ fontSize: 32, opacity: 0.6 }} />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-zinc-300">Your Messages</p>
                <p className="text-sm">Select a dialog to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#0f0f0f] transition-colors relative">

            {/* Header of dialog */}
            <div className="flex justify-between items-center bg-white/80 dark:bg-[#181818]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800/80 px-6 py-3.5 shadow-sm z-10 transition-colors">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => partnerId && navigate(`/profile/${partnerId}`)}
                >
                    <Avatar
                        src={selectedChat.friendAvatar || DEFAULT_AVATAR}
                        alt={selectedChat.friendNickname}
                        sx={{ width: 44, height: 44, border: '2px solid transparent' }}
                        className="group-hover:border-[#BA4631] transition-all"
                    />
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-zinc-100 group-hover:text-[#BA4631] transition-colors leading-tight">
                            {selectedChat.friendNickname}
                        </h2>
                        {/*<div className="flex items-center gap-1.5 mt-0.5">*/}
                        {/*    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />*/}
                        {/*    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">online</span>*/}
                        {/*</div>*/}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
                    <IconButton size="small" sx={{ color: 'inherit' }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-2 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600 gap-2">
                        <p className="text-sm font-medium">No messages in this chat yet</p>
                        <p className="text-xs">Send a wave to start the conversation 👋</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderUid === currentUser?.uid;
                        const timeString = msg.createdAtMs
                            ? new Date(msg.createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '';

                        return (
                            <div
                                key={msg.id || index}
                                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                            >
                                {!isMe && (
                                    <Avatar
                                        src={selectedChat.friendAvatar || DEFAULT_AVATAR}
                                        sx={{ width: 28, height: 28, mb: 0.5 }}
                                    />
                                )}

                                <div
                                    className={`relative max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-3xl shadow-sm text-sm break-words transition-all ${
                                        isMe
                                            ? 'bg-[#BA4631] text-white rounded-br-sm'
                                            : 'bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-800/80 rounded-bl-sm'
                                    }`}
                                >
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-gray-400 dark:text-zinc-500'}`}>
                                        <span>{timeString}</span>
                                        {isMe && <DoneAllRoundedIcon sx={{ fontSize: 13 }} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white/90 dark:bg-[#181818]/90 backdrop-blur-md border-t border-gray-200/80 dark:border-zinc-800/80 transition-colors">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                    <IconButton size="small" className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                        <AttachFileRoundedIcon fontSize="small" />
                    </IconButton>

                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Write a message..."
                        className="flex-1 px-5 py-3 rounded-full text-sm bg-gray-100 dark:bg-[#252525] text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BA4631]/50 border-none transition-all"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-[#BA4631] text-white rounded-full shadow-md hover:bg-[#a33d2a] disabled:opacity-40 disabled:hover:bg-[#BA4631] transition-all duration-200 flex items-center justify-center flex-shrink-0"
                    >
                        <SendRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ChatWindow;