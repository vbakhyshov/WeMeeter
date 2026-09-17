import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const NotificationItem = ({ notif, onAccept, onDecline, onUserClick, onDelete }) => {
    const isFriendRequest = notif.type === 'friend_request' && notif.status === 'pending';

    return (
        <div className="flex items-start p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors group relative">
            <div
                className="flex items-start cursor-pointer flex-1"
                onClick={() => onUserClick && onUserClick(notif.senderId)}
            >
                <Avatar
                    src={notif.senderAvatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    alt={notif.senderUsername}
                    sx={{ width: 40, height: 40, mt: 0.5 }}
                />
                <div className="ml-3 flex-1 pr-6">
                    <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-bold">@{notif.senderUsername}</span>{' '}
                        {notif.type === 'friend_request'
                            ? 'sent you a friend request'
                            : notif.type === 'like'
                                ? (notif.text || 'liked your post')
                                : notif.text}
                    </p>

                    {notif.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt?.toDate?.() || notif.createdAt).toLocaleDateString()}
                        </p>
                    )}

                    {/* add friend button */}
                    {isFriendRequest && (
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAccept(notif);
                                }}
                                sx={{
                                    bgcolor: '#BA4631',
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    py: 0.3,
                                    px: 1.5,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: '#a33d2a' }
                                }}
                            >
                                Accept
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDecline(notif);
                                }}
                                sx={{
                                    color: 'gray',
                                    borderColor: '#ddd',
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    py: 0.3,
                                    px: 1.5,
                                    borderRadius: 2,
                                    '&:hover': { borderColor: '#999', bgcolor: 'transparent' }
                                }}
                            >
                                Decline
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* delete notif button */}
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(notif.id);
                }}
                sx={{
                    color: 'text.secondary',
                    opacity: 0.6,
                    '&:hover': { opacity: 1, color: 'error.main' },
                    p: 0.5
                }}
                title="Delete notification"
            >
                <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
        </div>
    );
};

export default NotificationItem;