import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';

const SettingsModal = ({ isOpen, onClose, darkMode, toggleDarkMode }) => {
    const { t, i18n } = useTranslation();
    const { } = useAuth();
    const navigate = useNavigate();

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-400 dark:from-zinc-700 dark:to-zinc-600" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Settings
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Options */}
                        <div className="space-y-4">

                            {/* Dark Mode Toggle */}
                            <div
                                onClick={toggleDarkMode}
                                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                                        {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">Appearance</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors ${darkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                                    <motion.div
                                        animate={{ x: darkMode ? 20 : 0 }}
                                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Language Selector */}
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                        <LanguageIcon />
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Language</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => i18n.changeLanguage(lang.code)}
                                            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${i18n.language === lang.code
                                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="mr-1">{lang.flag}</span> {lang.code.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>


                        </div>

                        <div className="mt-8 text-center text-xs text-gray-400">
                            Version 1.0.4 • a104 Auto Parts
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
