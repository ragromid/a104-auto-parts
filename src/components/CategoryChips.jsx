import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import GridViewIcon from '@mui/icons-material/GridView';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import EditableText from './editable/EditableText';

import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

const SortableChip = ({
    category,
    isActive,
    onSelect,
    isAdminMode,
    updateName,
    addSub,
    deleteCat,
    t,
    isTouch
}) => {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category.id, disabled: !isAdminMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 10,
        opacity: isDragging ? 0.3 : 1
    };

    const hasChildren = category.children && category.children.length > 0;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            whileHover={!isTouch && !isDragging ? { scale: 1.02, y: -2 } : {}}
            whileTap={!isDragging ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => !isDragging && onSelect(category)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 snap-start flex-shrink-0 flex items-center gap-2 cursor-pointer select-none group
            ${isActive
                    ? 'text-white dark:text-gray-900 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5'
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full -z-10"
                />
            )}

            {isAdminMode && (
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1 -ml-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GridViewIcon style={{ fontSize: 14 }} />
                </div>
            )}

            <div className="flex items-center gap-1.5">
                <EditableText
                    value={t(`filters.${category.name}`, category.name)}
                    onSave={(val) => updateName(category.id, val)}
                />

                {isAdminMode && (
                    <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addSub(category.id);
                            }}
                            className="p-1 rounded-full text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                            <AddIcon style={{ fontSize: 14 }} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteCat(category.id);
                            }}
                            className="p-1 rounded-full text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                            <CloseIcon style={{ fontSize: 14 }} />
                        </button>
                    </div>
                )}

                {hasChildren && (
                    <span className="opacity-40 text-[10px]">▼</span>
                )}
            </div>
        </motion.div>
    );
};

const CategoryChips = ({ activeCategory, onSelectCategory }) => {
    const { t } = useTranslation();
    const { categories, updateCategoryName, addCategory, deleteCategory, moveCategory } = useContent();
    const { isAdminMode } = useAuth();

    const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

    const [viewParentId, setViewParentId] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentLevel, setCurrentLevel] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const sliderRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

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

    useEffect(() => {
        if (viewParentId) {
            const parent = findCategory(viewParentId, categories);
            if (parent && parent.children) {
                setCurrentLevel(parent.children);
                return;
            }
        }
        setCurrentLevel(categories);
    }, [categories, viewParentId]);

    const handleCategoryClick = (category) => {
        const hasChildren = category.children && category.children.length > 0;
        if (hasChildren || isAdminMode) {
            setHistory([...history, { list: currentLevel, parentId: viewParentId }]);
            setCurrentLevel(category.children || []);
            setViewParentId(category.id);
        }
        onSelectCategory(category.id);
    };

    const handleBack = () => {
        if (history.length > 0) {
            const last = history[history.length - 1];
            setCurrentLevel(last.list);
            setViewParentId(last.parentId);
            setHistory(history.slice(0, -1));
        }
    };

    const handleDragStart = (event) => {
        if (!isAdminMode) return;
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const oldIndex = currentLevel.findIndex(i => i.id === active.id);
        const newIndex = currentLevel.findIndex(i => i.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(currentLevel, oldIndex, newIndex);
            setCurrentLevel(newOrder);
            moveCategory(active.id, over.id);
        }
    };

    const handleAllClick = () => {
        setHistory([]);
        setCurrentLevel(categories);
        setViewParentId(null);
        onSelectCategory('All');
    };

    return (
        <div className="w-full overflow-hidden">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <motion.div
                    ref={sliderRef}
                    className="w-full py-3 px-4 overflow-x-auto no-scrollbar"
                >
                    <div className="flex flex-nowrap space-x-3 w-max items-center">
                        <AnimatePresence mode="popLayout">
                            {history.length > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleBack}
                                    className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-white/10 flex-shrink-0"
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {history.length === 0 && (
                            <motion.div
                                whileHover={!isTouch ? { scale: 1.02, y: -2 } : {}}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                onClick={handleAllClick}
                                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 snap-start flex-shrink-0 flex items-center gap-2 cursor-pointer select-none group
                                ${activeCategory === 'All'
                                        ? 'text-white dark:text-gray-900 shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5'
                                    }`}
                            >
                                {activeCategory === 'All' && (
                                    <motion.div
                                        layoutId="activePill"
                                        className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full -z-10"
                                    />
                                )}
                                {t('filters.All', 'All')}
                            </motion.div>
                        )}

                        <SortableContext
                            items={currentLevel.map(c => c.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {currentLevel.map(category => (
                                <SortableChip
                                    key={category.id}
                                    category={category}
                                    isActive={activeCategory === category.id}
                                    onSelect={handleCategoryClick}
                                    isAdminMode={isAdminMode}
                                    updateName={updateCategoryName}
                                    addSub={addCategory}
                                    deleteCat={deleteCategory}
                                    t={t}
                                    isTouch={isTouch}
                                />
                            ))}
                        </SortableContext>

                        {isAdminMode && (
                            <button
                                onClick={() => addCategory(viewParentId)}
                                className="flex items-center justify-center w-10 h-10 rounded-2xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/20 flex-shrink-0"
                            >
                                <AddIcon fontSize="small" />
                            </button>
                        )}
                    </div>
                </motion.div>

                {createPortal(
                    <DragOverlay dropAnimation={null}>
                        {activeId ? (
                            <div className="px-5 py-2.5 rounded-full bg-white dark:bg-zinc-800 shadow-2xl border flex items-center gap-2 pointer-events-none z-[9999]">
                                <span className="text-sm font-bold">
                                    {findCategory(activeId, categories)?.name}
                                </span>
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
};

export default CategoryChips;
