import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';

const EditableImage = ({ src, onSave, alt, className = '', containerClassName = '' }) => {
    const { isAdminMode } = useAuth();
    const { t } = useTranslation();

    const fileInputRef = React.useRef(null);

    const handleEditClick = (e) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: Size < 2MB (Vercel Limit safety)
        if (file.size > 2 * 1024 * 1024) {
            alert("Image file is too large. Please choose an image under 2MB.");
            return;
        }

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            onSave(reader.result);
        };
        reader.readAsDataURL(file);
    };

    if (!isAdminMode) {
        return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
    }

    return (
        <div
            className={`relative group w-full h-full ${containerClassName}`}
            onClick={handleEditClick}
        >
            <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200">
                <div className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                    <EditIcon fontSize="small" /> {t('admin.uploadPhoto')}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};

export default EditableImage;
