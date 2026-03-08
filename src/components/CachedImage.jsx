import React, { useState, useEffect } from 'react';
import { getLocalImage, fetchAndStoreImage } from '../lib/imagePersistence';

const CachedImage = ({ src, alt, className, loading = "lazy", ...props }) => {
    const [displaySrc, setDisplaySrc] = useState(null);
    const [isStored, setIsStored] = useState(false);

    useEffect(() => {
        let isActive = true;
        let objectUrl = null;

        const loadImage = async () => {
            if (!src) return;

            // 1. Try to get from local storage first
            const local = await getLocalImage(src);
            if (local && isActive) {
                setDisplaySrc(local);
                setIsStored(true);
                objectUrl = local;
                return;
            }

            // 2. If not found, show remote URL immediately but also fetch and store it
            if (isActive) {
                setDisplaySrc(src);

                // Fetch and store in background
                const storedUrl = await fetchAndStoreImage(src);
                if (storedUrl && storedUrl !== src && isActive) {
                    setDisplaySrc(storedUrl);
                    setIsStored(true);
                    objectUrl = storedUrl;
                }
            }
        };

        loadImage();

        return () => {
            isActive = false;
            if (objectUrl && objectUrl.startsWith('blob:')) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    // Fallback to original src if displaySrc is not ready yet
    const finalSrc = displaySrc || src;

    return (
        <img
            src={finalSrc}
            alt={alt}
            className={className}
            loading={loading}
            {...props}
        />
    );
};

export default CachedImage;
