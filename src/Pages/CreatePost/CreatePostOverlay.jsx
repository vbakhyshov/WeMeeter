import React from 'react';
import CreatePostPage from "../CreatePost/CreatePostPage";

const CreatePostOverlay = ({ onClose }) => {
    return (
        <div>
            <div
                className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center backdrop-blur-sm" // Добавил backdrop-blur для красоты
                onClick={onClose}
            >
                {/* Убрали стили bg-white, padding и т.д., теперь за это отвечает CreatePostPage */}
                <div
                    className="w-[95%] max-w-lg relative animate-fade-in-up z-[1001]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Передаем функцию onClose внутрь компонента */}
                    <CreatePostPage onClose={onClose} />
                </div>
            </div>
        </div>
    );
};

export default CreatePostOverlay;