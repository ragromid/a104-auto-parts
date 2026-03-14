import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';

const AdminToolbar = () => {
    const { isAuthenticated, logout, isAdminMode, toggleAdminMode } = useAuth();
    const { exportData, undo, redo, canUndo, canRedo } = useContent();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isAuthenticated || location.pathname !== '/admin') return null;

    return (
        <motion.div
            layout
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className={`fixed bottom-6 right-6 z-40 bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 rounded-full shadow-2xl flex items-center overflow-hidden transition-all duration-300 ${isExpanded ? 'px-6 py-3 gap-4' : 'p-2'}`}
        >
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.button
                        key="collapsed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsExpanded(true)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 dark:hover:bg-gray-100/10 rounded-full transition-colors"
                    >
                        <AdminPanelSettingsIcon />
                        <span className="text-sm font-bold uppercase tracking-wider">Admin</span>
                    </motion.button>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex items-center gap-4 whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2 border-r border-gray-600 dark:border-gray-300 pr-4">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Admin Mode</span>
                        </div>

                        <button
                            onClick={toggleAdminMode}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isAdminMode ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                            title={isAdminMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                        >
                            <EditIcon fontSize="small" />
                        </button>

                        <div className="w-px h-4 bg-gray-600 dark:bg-gray-300 opacity-50" />

                        <button
                            onClick={exportData}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                            title="Download JSON data"
                        >
                            <DownloadIcon fontSize="small" />
                        </button>

                        <button
                            onClick={undo}
                            disabled={!canUndo}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${canUndo ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white' : 'bg-gray-800/20 text-gray-600 cursor-not-allowed'}`}
                            title="Undo"
                        >
                            <UndoIcon fontSize="small" />
                        </button>

                        <button
                            onClick={redo}
                            disabled={!canRedo}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${canRedo ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white' : 'bg-gray-800/20 text-gray-600 cursor-not-allowed'}`}
                            title="Redo"
                        >
                            <RedoIcon fontSize="small" />
                        </button>

                        <div className="w-px h-4 bg-gray-600 dark:bg-gray-300 opacity-50" />

                        <button
                            onClick={logout}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="Logout"
                        >
                            <LogoutIcon fontSize="small" />
                        </button>

                        <button
                            onClick={() => setIsExpanded(false)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors ml-2"
                            title="Collapse Panel"
                        >
                            <CloseIcon fontSize="small" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminToolbar;
