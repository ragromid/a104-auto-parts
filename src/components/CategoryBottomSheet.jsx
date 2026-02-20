import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import EditableText from './editable/EditableText';

const CategoryBottomSheet = ({ isOpen, onClose, activeCategory, onSelectCategory }) => {
    const { t } = useTranslation();
    const sheetRef = useRef(null);
    const { categories, addCategory, updateCategoryName, deleteCategory } = useContent();
    const { isAdminMode } = useAuth();

    // Recursive flatten for bottom sheet
    const flattenCategories = (list) => {
        let result = [];
        list.forEach(c => {
            result.push(c);
            if (c.children && c.children.length > 0) {
                result.push(...flattenCategories(c.children));
            }
        });
        return result;
    };

    const flatCategories = flattenCategories(categories).filter(c => c.id !== 'All');

    const variants = {
        hidden: { y: '100%', opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', damping: 25, stiffness: 300 }
        },
        exit: { y: '100%', opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
                    />
                    <motion.div
                        ref={sheetRef}
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) {
                                onClose();
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl z-[90] p-6 pb-safe max-h-[80vh] overflow-y-auto"
                    >
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {t('ui.tabs.search')}
                            </h3>
                            <button onClick={onClose} className="p-2 -mr-2 text-gray-500">
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => { onSelectCategory('All'); onClose(); }}
                                className={`
                                    py-3 px-5 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-center text-center
                                    ${activeCategory === 'All'
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                                    }
                                `}
                            >
                                {t('filters.All')}
                            </button>

                            {flatCategories.map((category) => (
                                <div key={category.id} className="relative group flex">
                                    <button
                                        onClick={() => { onSelectCategory(category.id); onClose(); }}
                                        className={`
                                            py-3 px-5 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-center text-center pr-10
                                            ${activeCategory === category.id
                                                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <div onClick={(e) => isAdminMode && e.stopPropagation()}>
                                            <EditableText
                                                value={t(`filters.${category.name}`, category.name)}
                                                onSave={(val) => updateCategoryName(category.id, val)}
                                            />
                                        </div>
                                    </button>

                                    {isAdminMode && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteCategory(category.id);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full cursor-pointer z-10 hover:bg-red-200"
                                        >
                                            <CloseIcon style={{ fontSize: 14 }} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isAdminMode && (
                                <button
                                    onClick={() => addCategory(null)}
                                    className="py-3 px-5 rounded-2xl text-sm font-medium bg-green-500 text-white shadow-lg flex items-center justify-center text-center hover:bg-green-600 transition-colors"
                                >
                                    <AddIcon fontSize="small" className="mr-1" /> Add
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CategoryBottomSheet;
