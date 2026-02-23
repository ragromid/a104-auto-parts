import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import GridViewIcon from '@mui/icons-material/GridView';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
// import { categories as allCategories } from '../data/categories'; // REMOVED - Using context
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import EditableText from './editable/EditableText';

const CategoryChips = ({ activeCategory, onSelectCategory, onOpenSheet }) => {
    const { t } = useTranslation();
    const { categories: allCategories, updateCategoryName, addCategory, deleteCategory } = useContent();
    const { isAdminMode } = useAuth();

    // Check for touch device
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

    const [currentLevel, setCurrentLevel] = useState(allCategories);
    const [viewParentId, setViewParentId] = useState(null); // Track which category's children we are viewing
    const [history, setHistory] = useState([]); // Stores { list, parentId } of previous levels

    // Sync currentLevel when allCategories changes (e.g. added new category)
    useEffect(() => {
        if (viewParentId) {
            // We are looking at a subcategory. Re-find it in the updated allCategories to get fresh children.
            const parent = findCategory(viewParentId, allCategories);
            if (parent && parent.children) {
                setCurrentLevel(parent.children);
            } else {
                // Parent deleted? Fallback to root
                setCurrentLevel(allCategories);
                setViewParentId(null);
                setHistory([]);
            }
        } else {
            // At root
            setCurrentLevel(allCategories);
        }
    }, [allCategories, viewParentId]);

    // Helper to find category by ID recursively
    const findCategory = (id, list) => {
        for (const cat of list) {
            if (cat.id === id) return cat;
            if (cat.children) {
                const found = findCategory(id, cat.children);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper to get parent chain (unused but kept for reference or future use)
    const getParentChain = (id, list, chain = []) => {
        for (const cat of list) {
            if (cat.id === id) return chain;
            if (cat.children) {
                const result = getParentChain(id, cat.children, [...chain, list]);
                if (result) return result;
            }
        }
        return null;
    };

    // Sync UI with activeCategory if changed externally (e.g. from drawer)
    useEffect(() => {
        if (activeCategory === 'All') {
            if (viewParentId !== null) {
                // Only reset if not already at root, or strictly enforce?
                // User might want to browse categories without selecting?
                // Let's force reset for consistency.
                setViewParentId(null);
                setHistory([]);
                // currentLevel sync handled by dependency on viewParentId=null above?
                // No, dependency is [allCategories, viewParentId]. Setting viewParentId triggers effect.
            }
            return;
        }
        // ... (rest of logic omitted/simplified)
    }, [activeCategory]);


    const handleCategoryClick = (category) => {
        const hasChildren = category.children && category.children.length > 0;

        // Allow navigation if children exist OR if we are admin (so we can add children to empty categories)
        if (hasChildren || isAdminMode) {
            setHistory([...history, { list: currentLevel, parentId: viewParentId }]);
            setCurrentLevel(category.children || []);
            setViewParentId(category.id);
        }
        // Always select the category (even parent categories can be selected filters)
        onSelectCategory(category.id);
    };

    const handleBack = () => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setCurrentLevel(lastState.list);
            setViewParentId(lastState.parentId);
            setHistory(history.slice(0, -1));
        }
    };

    const handleAddCategory = () => {
        // Instantly add a new category to the CURRENT view (viewParentId)
        addCategory(viewParentId);
    };

    // Ref for scrolling container
    const sliderRef = useRef(null);

    // Manual horizontal scroll with mouse wheel (PC)
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        let target = slider.scrollLeft;
        let isAnimating = false;
        let animationFrameId;

        const update = () => {
            if (!slider) return;

            // Linear interpolation (Lerp) for smooth scrolling
            // factor 0.1 determines the "weight" or smoothness (lower = smoother/slower)
            slider.scrollLeft += (target - slider.scrollLeft) * 0.1;

            if (Math.abs(target - slider.scrollLeft) > 1) {
                animationFrameId = requestAnimationFrame(update);
                isAnimating = true;
            } else {
                isAnimating = false;
            }
        };

        const handleWheel = (e) => {
            if (e.deltaY === 0) return;
            // If deltaX is present (shift key or trackpad), let native scroll handle it
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            e.preventDefault();

            // If animation has stopped, sync target to current position to avoid jumps
            if (!isAnimating) {
                target = slider.scrollLeft;
            }

            // Add delta to target
            target += e.deltaY;

            // Clamp target to bounds
            target = Math.max(0, Math.min(slider.scrollWidth - slider.clientWidth, target));

            // Start animation loop if not running
            if (!isAnimating) {
                update();
            }
        };

        slider.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            slider.removeEventListener('wheel', handleWheel);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full mask-gradient [-webkit-mask-image:linear-gradient(to_right,transparent,black_20px,black_90%,transparent)] overflow-hidden">
            <motion.div
                ref={sliderRef}
                data-lenis-prevent // Prevent Lenis from hijacking scroll
                className="w-full py-3 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar"
            >
                <div
                    className="flex flex-nowrap space-x-3 w-max items-center"
                >
                    <LayoutGroup id="categories">

                        {/* Back Button */}
                        <AnimatePresence>
                            {history.length > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors shrink-0 z-20 backdrop-blur-sm shadow-sm mr-2"
                                    onClick={handleBack}
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* All Button (Only at root) */}
                        {history.length === 0 && (
                            <motion.button
                                layout
                                whileHover={!isTouch ? { scale: 1.03, y: -4 } : {}}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 150, damping: 10 }}
                                onClick={() => onSelectCategory('All')}
                                className={`
                  relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 z-10 snap-start flex-shrink-0
                  ${activeCategory === 'All'
                                        ? 'text-white dark:text-gray-900'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }
                `}
                            >
                                {activeCategory === 'All' && (
                                    <motion.div
                                        layoutId="activePill"
                                        className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full -z-10 shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {t('filters.All')}
                            </motion.button>
                        )}

                        {currentLevel
                            .filter(category => category.id !== 'All')
                            .map((category) => {
                                const isActive = activeCategory === category.id;
                                const hasChildren = category.children && category.children.length > 0;

                                return (
                                    <motion.div
                                        layout
                                        whileHover={!isTouch ? { scale: 1.03, y: -4 } : {}}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category)}
                                        className={`
                  relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 z-10 snap-start flex-shrink-0 flex items-center gap-2 cursor-pointer select-none
                  ${isActive
                                                ? 'text-white dark:text-gray-900'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }
                `}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activePill"
                                                className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full -z-10 shadow-sm"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {/* Editable Name */}
                                        <div onClick={(e) => isAdminMode && e.stopPropagation()}>
                                            <EditableText
                                                value={t(`filters.${category.name}`, category.name)}
                                                onSave={(val) => updateCategoryName(category.id, val)}
                                            />
                                        </div>

                                        {/* Add Subcategory Button */}
                                        {isAdminMode && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addCategory(category.id);
                                                }}
                                                className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-green-500 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                                                title="Add Subcategory"
                                            >
                                                <AddIcon style={{ fontSize: 14 }} />
                                            </div>
                                        )}

                                        {/* Delete Category Button */}
                                        {isAdminMode && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Optional: Confirm if contains items? For now instant.
                                                    deleteCategory(category.id);
                                                }}
                                                className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                                                title="Delete Category"
                                            >
                                                <CloseIcon style={{ fontSize: 14 }} />
                                            </div>
                                        )}

                                        {hasChildren && (
                                            <span className="opacity-60 text-[10px] ml-1">▼</span>
                                        )}
                                    </motion.div>
                                );
                            })}
                    </LayoutGroup>

                    {/* Add Category Button (Admin Only) */}
                    {isAdminMode && (
                        <motion.button
                            layout
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAddCategory}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shrink-0 z-20 shadow-sm ml-2"
                            title="Add Category"
                        >
                            <AddIcon fontSize="small" />
                        </motion.button>
                    )}


                </div>
            </motion.div>
        </div>
    );
};

export default CategoryChips;
