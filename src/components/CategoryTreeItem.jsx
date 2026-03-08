import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CategoryTreeItem = ({ id, category, depth = 0 }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        marginLeft: `${depth * 20}px`,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all flex items-center gap-3 ${isDragging ? 'shadow-lg z-50' : ''}`}
        >
            <button
                {...attributes}
                {...listeners}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing text-gray-400"
            >
                <DragHandleIcon fontSize="small" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500">
                {category.children && category.children.length > 0 ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {category.name}
                </p>
                {category.children && category.children.length > 0 && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {category.children.length} subcategories
                    </p>
                )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <ChevronRightIcon fontSize="small" />
                </button>
            </div>
        </div>
    );
};

export default CategoryTreeItem;
