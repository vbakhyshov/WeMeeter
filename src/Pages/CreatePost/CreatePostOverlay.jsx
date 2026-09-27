import React, { useEffect } from 'react';
import CreatePostPage from './CreatePostPage';

const CreatePostOverlay = ({ onClose }) => {
    // Handle Escape key navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // Lock body scrolling while the modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg relative z-[1001] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <CreatePostPage onClose={onClose} />
            </div>
        </div>
    );
};

export default CreatePostOverlay;