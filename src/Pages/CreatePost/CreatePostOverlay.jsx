import React from 'react';
import CreatePostPage from './CreatePostPage';

const CreatePostOverlay = ({ onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-[95%] max-w-lg relative animate-fade-in-up z-[1001]"
                onClick={(e) => e.stopPropagation()}
            >
                <CreatePostPage onClose={onClose} />
            </div>
        </div>
    );
};

export default CreatePostOverlay;