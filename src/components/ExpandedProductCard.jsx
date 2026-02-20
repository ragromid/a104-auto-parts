import React from 'react';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { useCart } from '../context/CartContext';
import EditableText from './editable/EditableText';
import EditablePrice from './editable/EditablePrice';
import EditableImage from './editable/EditableImage';
import { Helmet } from 'react-helmet-async';

const ExpandedProductCard = ({ product, onClose, layoutId }) => {
    const { t } = useTranslation();
    const { addToCart, cartItems } = useCart();
    const { updateProduct } = useContent();
    const { isAdminMode } = useAuth();
    const isAdded = cartItems.some(item => item.id === product.id);

    // Carousel State
    // Initialize with product.images if exists, otherwise wrap single product.image
    const [images, setImages] = React.useState(() => {
        if (product.images && product.images.length > 0) return product.images;
        return product.image ? [product.image] : [];
    });
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Sync changes to centralized state
    const handleImageUpdate = (newImageSrc) => {
        const newImages = [...images];
        newImages[currentIndex] = newImageSrc;
        setImages(newImages);
        updateProduct(product.id, 'images', newImages);
        // Sync primary image for grid view
        if (currentIndex === 0) {
            updateProduct(product.id, 'image', newImageSrc);
        }
    };

    const handleAddImage = () => {
        // Create a placeholder or duplicate current to avoid empty src issues
        // We'll use a placeholder service or just duplicate current
        const newImages = [...images, "https://placehold.co/600x800?text=New+Image"];
        setImages(newImages);
        updateProduct(product.id, 'images', newImages);
        setCurrentIndex(newImages.length - 1); // Go to new image
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        if (images.length <= 1) return; // Prevent deleting last image? Or allow clearing? Let's keep 1 at least.

        const newImages = images.filter((_, idx) => idx !== currentIndex);
        setImages(newImages);
        updateProduct(product.id, 'images', newImages);

        // Sync primary image if we removed the first one
        if (currentIndex === 0) {
            updateProduct(product.id, 'image', newImages[0]);
        }

        // Adjust index
        if (currentIndex >= newImages.length) {
            setCurrentIndex(newImages.length - 1);
        }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <Helmet>
                <title>{product.name} | a104.az</title>
                <meta name="description" content={product.info || `Buy ${product.name} at a104.az`} />
                <meta property="og:title" content={`${product.name} | a104.az`} />
                <meta property="og:description" content={product.info || `Buy ${product.name} at a104.az`} />
                {images[0] && <meta property="og:image" content={images[0]} />}
            </Helmet>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
            />

            {/* Expanded Card */}
            <motion.div
                layoutId={layoutId || `card-${product.id}`}
                className="w-full max-w-6xl max-h-[90vh] min-h-[50vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row pointer-events-auto relative"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                    <CloseIcon />
                </button>

                {/* Left: Image Carousel */}
                <div className="w-full md:w-3/5 h-[40vh] md:h-auto relative bg-black flex items-center justify-center overflow-hidden">
                    {/* Main Image in "Full Size" (Contain) - NOW AUTO ADJUSTING */}
                    <div className="w-full h-full relative flex items-center justify-center">
                        <EditableImage
                            src={images[currentIndex]}
                            alt={`${product.name} - ${currentIndex + 1}`}
                            className="w-full h-full object-contain max-h-[90vh]"
                            containerClassName="w-full h-full flex items-center justify-center"
                            onSave={handleImageUpdate}
                        />
                    </div>

                    {/* Featured Badge */}
                    {product.recommended && (
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md text-black dark:text-white text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-sm pointer-events-none z-10">
                            {t('shop.featured')}
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 hover:backdrop-blur-md text-white flex items-center justify-center transition-all z-10"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 hover:backdrop-blur-md text-white flex items-center justify-center transition-all z-10"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                        className={`w-2 h-2 rounded-full cursor-pointer transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Admin Controls for Carousel */}
                    {isAdminMode && (
                        <div className="absolute top-4 right-16 z-20 flex gap-2">
                            <button
                                onClick={handleAddImage}
                                className="bg-green-500/80 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                            >
                                + Add Image
                            </button>
                            {images.length > 1 && (
                                <button
                                    onClick={handleRemoveImage}
                                    className="bg-red-500/80 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                                >
                                    - Remove
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Details Section */}
                <div className="w-full md:w-2/5 h-1/2 md:h-full p-6 md:p-8 flex flex-col overflow-y-auto bg-white dark:bg-zinc-900">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 text-sm text-secondary font-medium uppercase tracking-wide">
                            <EditableText
                                value={product.category}
                                onSave={(val) => updateProduct(product.id, 'category', val)}
                            />
                        </div>

                        <h2 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                            <EditableText
                                value={product.name}
                                onSave={(val) => updateProduct(product.id, 'name', val)}
                            />
                        </h2>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-gray-400 font-mono text-sm">
                                <EditableText
                                    value={product.sku}
                                    onSave={(val) => updateProduct(product.id, 'sku', val)}
                                />
                            </span>
                        </div>

                        <div className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
                            <EditableText
                                value={product.info || 'No details'}
                                onSave={(val) => updateProduct(product.id, 'info', val)}
                                multiline
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center">
                            <EditablePrice
                                value={product.price}
                                onSave={(val) => updateProduct(product.id, 'price', val)}
                            />
                        </div>

                        {!isAdminMode && (
                            <button
                                onClick={() => addToCart(product)}
                                className={`
                                flex-1 py-3 rounded-full font-medium tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base
                                ${isAdded
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg shadow-black/20 dark:shadow-white/20'
                                    }
                            `}
                            >
                                {isAdded ? t('shop.addedToCart') : t('shop.addToCart')}
                            </button>
                        )}

                        {isAdminMode && (
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-full font-medium tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg shadow-black/20 dark:shadow-white/20"
                            >
                                {t('admin.save')}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div >
        </div >
    );
};

export default ExpandedProductCard;
