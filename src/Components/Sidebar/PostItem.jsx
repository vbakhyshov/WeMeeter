import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';

const PostItem = ({ post, isCollapsed }) => {
    if (isCollapsed) {
        return (
            <Link to={`/profile/${post.username}`} className="flex justify-center p-2 hover:bg-white/10 rounded-xl cursor-pointer">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-xl shadow-sm">
                    {post.avatar}
                </div>
            </Link>
        );
    }

    return (
        <Accordion
            sx={{
                backgroundColor: 'rgba(48,13,0,0.84)',
                color: 'white',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                borderRadius: '12px !important',
                overflow: 'hidden',
                mb: 1
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                sx={{
                    padding: '0 8px',
                    '& .MuiAccordionSummary-content': { margin: '12px 0' }
                }}
            >
                <div className="flex items-center gap-3 w-full overflow-hidden">
                    <Link
                        to={`/profile/${post.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="transition-transform hover:scale-90 active:scale-95"
                    >
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex-shrink-0 flex items-center justify-center text-xl text-black shadow-sm">
                            {post.avatar}
                        </div>
                    </Link>

                    {/* Text Container */}
                    <div className="flex flex-col text-left overflow-hidden">
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1.2 }}>
                            {post.name} | {post.age}
                        </Typography>

                        <Typography sx={{ fontSize: '0.8rem', opacity: 0.9, mt: 0.5 }} className="truncate">
                            {post.title}
                        </Typography>

                        <Typography sx={{ fontSize: '0.7rem', opacity: 0.6 }}>
                            {post.dist}
                        </Typography>
                    </div>
                </div>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
                <Typography
                    sx={{
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        opacity: 0.8,
                        width: '100%'
                    }}
                >
                    {post.desc}
                </Typography>
            </AccordionDetails>

            <AccordionActions sx={{ p: 1, justifyContent: 'flex-end', gap: 0 }}>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Liked:", post.username);
                    }}
                    sx={{
                        width: '14',
                        color: '#ff0000',
                        '&:hover': { backgroundColor: 'rgba(255, 75, 43, 0.1)' }
                    }}
                >
                    <FavoriteIcon fontSize="medium" />
                </IconButton>

                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Chat with:", post.username);
                    }}
                    sx={{
                        color: '#00ff34',
                        opacity: 0.8,
                        '&:hover': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                >
                    <SendIcon fontSize="medium" />
                </IconButton>
            </AccordionActions>
        </Accordion>
    );
};

export default PostItem;