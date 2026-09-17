import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const MessagesPage = () => {
    const { targetUserId } = useParams();
    const [currentChat, setCurrentChat] = useState(null);

    useEffect(() => {
        const fetchTargetUser = async () => {
            if (targetUserId) {
                try {
                    const userDoc = await getDoc(doc(db, "users", targetUserId));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setCurrentChat({
                            friendUid: targetUserId,
                            friendNickname: data.username || data.name || "User",
                            friendAvatar: data.avatar || DEFAULT_AVATAR
                        });
                    }
                } catch (error) {
                    console.error("Error loading chat target user:", error);
                }
            }
        };

        fetchTargetUser();
    }, [targetUserId]);

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <div className="w-1/5 min-w-[300px] border-r">
                <ChatList
                    onSelectChat={setCurrentChat}
                    activeChatUid={currentChat?.friendUid}
                />
            </div>

            <div className="flex-1 bg-gray-100 h-full">
                <ChatWindow selectedChat={currentChat} />
            </div>
        </div>
    );
};

export default MessagesPage;