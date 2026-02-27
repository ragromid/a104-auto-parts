import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

const Header = ({ darkMode, toggleDarkMode, searchTerm, onSearchChange, onOpenSettings }) => {
    const { isAdminMode } = useAuth();
    const { toggleCart, getCartCount } = useCart();
    const { dbError } = useContent();
    const { t, i18n } = useTranslation();
    const { scrollY } = useScroll();
    const headerHeight = useTransform(scrollY, [0, 100], ["5rem", "4rem"]);

    const headerBlur = useTransform(scrollY, [0, 100], ["backdrop-blur-md", "backdrop-blur-xl"]);
    const bgOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
    const backgroundColor = useMotionTemplate`rgba(var(--background-rgb, 255, 255, 255), ${bgOpacity})`;

    return (
        <motion.header
            style={{ height: headerHeight, backgroundColor }}
            className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md flex flex-col justify-center border-b border-gray-100 dark:border-white/5"
        >
            {isAdminMode && dbError && (
                <div className="w-full bg-red-500 text-white text-xs font-bold py-1 px-4 text-center z-50">
                    DATABASE ERROR: {dbError}
                </div>
            )}
            <div className="w-full max-w-7xl mx-auto flex items-center justify-center md:justify-between px-4 sm:px-6 lg:px-8 gap-4 relative h-full">

                {/* Brand & Location */}
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-8 md:w-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="w-8 h-8 flex-shrink-0">
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path d="M22 12C15 15 12 25 12 50C12 75 15 85 22 88L78 88L52 64L68 64L42 38L58 38L32 12H22Z" fill="#Header-Red" />
                                <path d="M32 12L88 50L78 88L52 64L68 64L42 38L58 38L32 12Z" fill="#Header-Orange" />
                                <defs>
                                    <style>{`
                                        #Header-Red { fill: #FF3D00; }
                                        #Header-Orange { fill: #FF9100; }
                                    `}</style>
                                </defs>
                            </svg>
                        </div>
                        <div className="flex items-baseline">
                            <span className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">KNK</span>
                            <span className="text-2xl font-bold tracking-tighter text-secondary ml-1 group-hover:text-secondary-light transition-colors duration-300">Avto</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light cursor-pointer transition-colors"
                    >
                        <LocationOnOutlinedIcon style={{ fontSize: 18 }} className="mr-1.5" />
                        <span>{t('ui.location')}</span>
                    </motion.div>
                </div>

                {/* Search Bar - Minimalist */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="hidden md:block flex-1 max-w-xl mx-2 md:mx-4"
                >
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                            <SearchIcon fontSize="small" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 md:py-2.5 rounded-full bg-gray-100 dark:bg-white/5 border-none focus:ring-1 focus:ring-primary/50 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                            placeholder={t('ui.searchPlaceholder')}
                        />
                    </div>
                </motion.div>

                {/* Actions - Desktop Only */}
                <div className="hidden md:flex items-center gap-1 sm:gap-2">

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onOpenSettings}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors relative"
                    >
                        <SettingsOutlinedIcon fontSize="small" />
                    </motion.button>

                    {!isAdminMode && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleCart}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors relative mr-2"
                        >
                            <ShoppingBagOutlinedIcon fontSize="small" />
                            {getCartCount() > 0 && (
                                <span className="absolute top-1.5 right-1.5 bg-secondary text-white text-[9px] font-bold px-1 rounded-full">
                                    {getCartCount()}
                                </span>
                            )}
                        </motion.button>
                    )}

                </div>

            </div>
        </motion.header>
    );
};

export default Header;
