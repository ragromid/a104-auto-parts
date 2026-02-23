import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../../lib/supabase'; // Import our configured client

const EditableImage = ({ src, onSave, alt, className = '', containerClassName = '' }) => {
    const { isAdminMode } = useAuth();
    const { t } = useTranslation();
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = React.useRef(null);

    const handleEditClick = (e) => {
        e.stopPropagation();
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: Size < 5MB (Bumped limit slightly since we use Storage now)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image file is too large. Please choose an image under 5MB.");
            return;
        }

        setIsUploading(true);

        try {
            // Generate a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload the file to the 'product-images' bucket
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                alert("Failed to upload image. Make sure your 'product-images' bucket is created and public.");
                throw uploadError;
            }

            // Get the public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            console.log("Image uploaded to Supabase Storage at:", publicUrl);

            // Pass the minimal URL string back to be saved in the database
            onSave(publicUrl);
        } catch (error) {
            console.error("Error in image upload flow:", error);
        } finally {
            setIsUploading(false);
            // Reset input so the same file could be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!isAdminMode) {
        return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
    }

    return (
        <div
            className={`relative group w-full h-full ${containerClassName}`}
            onClick={handleEditClick}
        >
            <img src={src} alt={alt} className={`${className} ${isUploading ? 'opacity-50 blur-sm' : ''}`} loading="lazy" decoding="async" />

            <div className={`absolute inset-0 bg-black/50 ${isUploading ? 'opacity-100 flex' : 'opacity-0 group-hover:opacity-100 flex'} items-center justify-center cursor-pointer transition-opacity duration-200`}>
                <div className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                    {isUploading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                            Uploading...
                        </div>
                    ) : (
                        <>
                            <EditIcon fontSize="small" /> {t('admin.uploadPhoto')}
                        </>
                    )}
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
