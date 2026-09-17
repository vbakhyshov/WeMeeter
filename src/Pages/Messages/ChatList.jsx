import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import ListSubheader from '@mui/material/ListSubheader';
import { useNavigate } from 'react-router-dom';

import { db, auth } from '../../firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const ChatList = ({ onSelectChat, activeChatUid }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const userList = snapshot.docs
                .map(doc => ({
                    friendUid: doc.id,
                    friendNickname: doc.data().username || doc.data().name || "User",
                    friendAvatar: doc.data().avatar || DEFAULT_AVATAR
                }))
                .filter(u => u.friendUid !== currentUser?.uid);

            setUsers(userList);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSelect = (friend) => {
        onSelectChat(friend);
        navigate(`/messages/${friend.friendUid}`);
    };

    const filteredUsers = users.filter(u =>
        u.friendNickname.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <List
            sx={{
                width: '100%',
                bgcolor: 'background.paper',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden'
            }}
            component="nav"
        >
            <div className="p-3 pt-5 w-full">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Find a dialog"
                        className="w-full py-2.5 pl-4 pr-10 rounded-full text-gray-700 text-sm focus:outline-none bg-pink-50/90"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                        <SearchIcon fontSize="small" />
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1">
                <ListSubheader className="ps-4 font-bold text-gray-800">
                    Messages
                </ListSubheader>

                {filteredUsers.length > 0 ? (
                    filteredUsers.map((friend) => {
                        const isSelected = activeChatUid === friend.friendUid;

                        return (
                            <ListItemButton
                                key={friend.friendUid}
                                selected={isSelected}
                                onClick={() => handleSelect(friend)}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(186, 70, 49, 0.08)',
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <Avatar
                                        src={friend.friendAvatar}
                                        alt={friend.friendNickname}
                                        sx={{ width: 44, height: 44 }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={friend.friendNickname}
                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500 }}
                                />
                            </ListItemButton>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                        No users found
                    </div>
                )}
            </div>
        </List>
    );
};

export default ChatList;