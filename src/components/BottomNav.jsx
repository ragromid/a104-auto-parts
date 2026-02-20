import React, { useState } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const BottomNav = ({ activeTab, onTabChange, onOpenSettings }) => {
    const { toggleCart, getCartCount } = useCart();
    const { t } = useTranslation();

    const tabs = [
        { id: 'home', icon: <HomeOutlinedIcon />, label: t('ui.tabs.home') },
        { id: 'search', icon: <SearchOutlinedIcon />, label: t('ui.tabs.search') },
        { id: 'cart', icon: <ShoppingBagOutlinedIcon />, label: t('ui.tabs.cart'), isHighlight: true },
        { id: 'settings', icon: <SettingsOutlinedIcon />, label: 'Settings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 pb-safe pt-1 px-4 md:hidden no-touch-highlight">
            <div className="flex items-center justify-around max-w-md mx-auto h-[60px]">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isCart = tab.id === 'cart';
                    const isSettings = tab.id === 'settings';

                    const handleClick = () => {
                        if (isCart) {
                            toggleCart();
                        } else if (isSettings) {
                            onOpenSettings();
                        } else {
                            onTabChange(tab.id);
                        }
                    };

                    if (tab.isHighlight) {
                        return (
                            <motion.button
                                key={tab.id}
                                layout
                                onClick={handleClick}
                                className={`
                        relative flex flex-col items-center justify-center h-12 w-12 rounded-2xl transition-all duration-300
                        ${isActive ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}
                    `}
                                whileTap={{ scale: 0.9 }}
                            >
                                {tab.icon}
                                {/* Badge */}
                                {isCart && getCartCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full ring-2 ring-white dark:ring-black font-bold">
                                        {getCartCount()}
                                    </span>
                                )}
                            </motion.button>
                        )
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={handleClick}
                            className="relative flex flex-col items-center justify-center w-16 h-full text-gray-400 dark:text-gray-500"
                        >
                            <div className={`relative p-2 rounded-xl transition-colors duration-300 flex flex-col items-center gap-1 ${isActive ? 'text-secondary' : ''}`}>
                                <span className="relative z-10">{tab.icon}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeDot"
                                        className="absolute -bottom-1 w-1 h-1 bg-secondary rounded-full"
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
