import React, { useEffect, useState, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
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

    useEffect(() => {
        if (!chatId || !currentUser) return;

        const chatDocRef = doc(db, "chats", chatId);
        updateDoc(chatDocRef, {
            unreadBy: arrayRemove(currentUser.uid)
        }).catch((err) => {
        });
    }, [chatId, currentUser]);

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
            console.error("Firestore messages subscription error:", error);
        });

        return () => unsubscribe();
    }, [chatId, currentUser]);

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

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Could not send message. Check Firebase rules.");
        }
    };

    if (!selectedChat) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-400">
                <p className="text-lg">Select a conversation to view messages</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => partnerId && navigate(`/profile/${partnerId}`)}
                >
                    <Avatar
                        src={selectedChat.friendAvatar || selectedChat.avatar || DEFAULT_AVATAR}
                        alt={selectedChat.friendNickname || selectedChat.username}
                        sx={{ width: 44, height: 44 }}
                    />
                    <div>
                        <h2 className="text-base font-semibold text-gray-800 hover:underline">
                            {selectedChat.friendNickname || selectedChat.username || selectedChat.name || "User"}
                        </h2>
                        <span className="text-xs text-green-600 font-medium">online</span>
                    </div>
                </div>
                <IconButton>
                    <MoreVertIcon />
                </IconButton>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <p className="text-base font-medium">No messages here yet</p>
                        <p className="text-sm">Say hello and start the dialog!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderUid === currentUser?.uid;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words shadow-sm ${
                                        isMe
                                            ? 'bg-[#BA4631] text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                <IconButton size="small">
                    <AttachFileIcon />
                </IconButton>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Write a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#BA4631] bg-gray-50"
                />
                <IconButton onClick={handleSend} sx={{ color: '#BA4631' }}>
                    <SendIcon />
                </IconButton>
            </div>
        </div>
    );
};

export default ChatWindow;