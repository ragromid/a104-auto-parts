import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useContent } from '../context/ContentContext';
import CategoryTreeItem from './CategoryTreeItem';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

const CategoryManager = ({ isOpen, onClose }) => {
    const { categories, setCategories } = useContent();
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        if (active.id !== over.id) {
            setCategories((items) => {
                // Find all items in a flat list first for easier processing
                const flatten = (list) => list.reduce((acc, item) => [
                    ...acc,
                    item,
                    ...(item.children ? flatten(item.children) : [])
                ], []);

                const findAndRemove = (list, id) => {
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].id === id) {
                            const [removed] = list.splice(i, 1);
                            return removed;
                        }
                        if (list[i].children) {
                            const found = findAndRemove(list[i].children, id);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const findAndAdd = (list, targetId, itemToAdd) => {
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].id === targetId) {
                            list[i].children = [...(list[i].children || []), itemToAdd];
                            return true;
                        }
                        if (list[i].children) {
                            const added = findAndAdd(list[i].children, targetId, itemToAdd);
                            if (added) return true;
                        }
                    }
                    return false;
                };

                const newCategories = JSON.parse(JSON.stringify(items));
                const activeItem = findAndRemove(newCategories, active.id);

                // If over is a top-level item or we want to reorder
                const overIndex = newCategories.findIndex(c => c.id === over.id);
                if (overIndex !== -1) {
                    newCategories.splice(overIndex, 0, activeItem);
                } else {
                    // Try to add as a child of 'over'
                    findAndAdd(newCategories, over.id, activeItem);
                }

                return newCategories;
            });
        }
    };

    // Flatten tree for flat sortable list (simplified approach first)
    // const flatCategories = categories; // This is no longer needed

    const renderTree = (items, depth = 0) => {
        return items.map((category) => (
            <React.Fragment key={category.id}>
                <CategoryTreeItem
                    id={category.id}
                    category={category}
                    depth={depth}
                />
                {category.children && category.children.length > 0 && renderTree(category.children, depth + 1)}
            </React.Fragment>
        ));
    };

    // Helper to find an item in a nested structure for DragOverlay
    const findItemInTree = (items, id) => {
        for (const item of items) {
            if (item.id === id) {
                return item;
            }
            if (item.children) {
                const found = findItemInTree(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-6 relative shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Categories</h2>
                                <p className="text-xs text-gray-500 mt-1">Drag handle to reorder. Drag over name to nest.</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    {renderTree(categories)}
                                </SortableContext>
                                <DragOverlay>
                                    {activeId ? (
                                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border-2 border-primary/50 opacity-80 cursor-grabbing">
                                            {findItemInTree(categories, activeId)?.name || "Category"}
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-2xl font-medium bg-black dark:bg-white text-white dark:text-black"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CategoryManager;
