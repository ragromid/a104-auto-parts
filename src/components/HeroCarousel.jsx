import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import EditableImage from './editable/EditableImage';
import RichTextEditor from './editable/RichTextEditor';

const HeroCarousel = ({ onShopNow }) => {
    const { t } = useTranslation();
    const { isAdminMode } = useAuth();
    const { siteSettings, updateSiteSetting } = useContent();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Editing State
    const [isEditingText, setIsEditingText] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editButtonText, setEditButtonText] = useState('');

    const slides = siteSettings?.heroSlides || [];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        if (isHovered || isEditingText || slides.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [slides.length, isHovered, isEditingText]);

    // Slide Management
    const handleAddSlide = () => {
        const newSlide = {
            id: Date.now().toString(),
            title: 'New Slide Title',
            buttonText: 'Shop Now',
            image: '',
            glow1: 'bg-primary/40',
            glow2: 'bg-secondary/30',
            bg: 'bg-gray-800'
        };
        const newSlides = [...slides, newSlide];
        updateSiteSetting('heroSlides', newSlides);
        setCurrentSlide(newSlides.length - 1);
    };

    const handleDeleteSlide = () => {
        if (slides.length <= 1) {
            alert("You cannot delete the last slide.");
            return;
        }
        const newSlides = slides.filter((_, index) => index !== currentSlide);
        updateSiteSetting('heroSlides', newSlides);
        setCurrentSlide(prev => Math.min(prev, newSlides.length - 1));
        setIsEditingText(false);
    };

    const handleEditStart = () => {
        setEditTitle(slides[currentSlide].title);
        setEditButtonText(slides[currentSlide].buttonText);
        setIsEditingText(true);
    };

    const handleEditSave = () => {
        const newSlides = [...slides];
        newSlides[currentSlide] = {
            ...newSlides[currentSlide],
            title: editTitle,
            buttonText: editButtonText
        };
        updateSiteSetting('heroSlides', newSlides);
        setIsEditingText(false);
    };

    const handleImageSave = (url) => {
        const newSlides = [...slides];
        newSlides[currentSlide] = {
            ...newSlides[currentSlide],
            image: url
        };
        updateSiteSetting('heroSlides', newSlides);
    };

    if (slides.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative"
        >
            {/* Admin Toolbar */}
            {isAdminMode && (
                <div className="absolute top-8 right-12 z-50 flex gap-2">
                    <button
                        onClick={handleAddSlide}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-colors flex items-center justify-center w-10 h-10"
                        title="Add Slide"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    <button
                        onClick={handleDeleteSlide}
                        disabled={slides.length <= 1}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg transition-colors flex items-center justify-center w-10 h-10"
                        title="Delete Current Slide"
                    >
                        <DeleteIcon fontSize="small" />
                    </button>
                    {!isEditingText ? (
                        <button
                            onClick={handleEditStart}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors flex items-center justify-center w-10 h-10"
                            title="Edit Text"
                        >
                            <EditIcon fontSize="small" />
                        </button>
                    ) : (
                        <button
                            onClick={handleEditSave}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-colors flex items-center justify-center w-10 h-10"
                            title="Save Text"
                        >
                            <CheckIcon fontSize="small" />
                        </button>
                    )}
                </div>
            )}

            <div 
                className="rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-2xl dark:shadow-none min-h-[300px] sm:min-h-[400px] group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slides[currentSlide].id} // use unique id here to trigger animation correctly
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0 text-white flex flex-col justify-center z-10 pointer-events-none"
                    >
                        {/* Slide Background Image Layer */}
                        {(slides[currentSlide].image || isAdminMode) ? (
                            <div className="absolute inset-0 z-0 pointer-events-auto">
                                <EditableImage
                                    src={slides[currentSlide].image || ''}
                                    alt={`Hero Background ${currentSlide + 1}`}
                                    className="w-full h-full object-cover"
                                    onSave={handleImageSave}
                                />
                                <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
                            </div>
                        ) : (
                            <div className={`absolute inset-0 z-0 pointer-events-none ${slides[currentSlide].bg}`}></div>
                        )}

                        <div className="relative z-10 max-w-lg p-6 sm:p-12 pointer-events-auto">
                            {!isEditingText ? (
                                <>
                                    <motion.h2
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.6 }}
                                        className="text-3xl sm:text-6xl font-light mb-3 sm:mb-4 tracking-tighter"
                                        dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
                                    />
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.6 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onShopNow();
                                        }}
                                        className="bg-white text-black hover:bg-secondary hover:text-white font-medium py-2.5 px-8 sm:py-3 sm:px-10 rounded-full transition-all duration-300 text-sm sm:text-base shadow-lg shadow-white/20 hover:shadow-secondary/20"
                                    >
                                        {slides[currentSlide].buttonText}
                                    </motion.button>
                                </>
                            ) : (
                                <div className="space-y-4 pointer-events-auto bg-black/50 p-4 rounded-xl backdrop-blur-md border border-white/20">
                                    <div>
                                        <label className="block text-xs text-white/70 mb-1 uppercase tracking-wider">Slide Title (Rich Text)</label>
                                        <RichTextEditor
                                            value={editTitle}
                                            onChange={(val) => setEditTitle(val)}
                                            className="text-3xl sm:text-6xl font-light tracking-tighter"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/70 mb-1 uppercase tracking-wider">Button Text</label>
                                        <input
                                            type="text"
                                            value={editButtonText}
                                            onChange={(e) => setEditButtonText(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Background Glows (Hidden on smaller screens to save mobile GPU) */}
                        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none hidden sm:block">
                            <div className={`absolute top-1/2 left-1/2 w-96 h-96 ${slides[currentSlide].glow1} rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow`}></div>
                            <div className={`absolute top-0 right-0 w-80 h-80 ${slides[currentSlide].glow2} rounded-full blur-[80px]`}></div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Carousel Indicators */}
                {slides.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-auto">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Navigation Arrows */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-auto"
                        >
                            <ChevronLeftIcon />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-auto"
                        >
                            <ChevronRightIcon />
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default HeroCarousel;
