import React from 'react';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = (current, total) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    const visiblePages = getVisiblePages(currentPage, totalPages);

    return (
        <div className="flex items-center justify-center gap-2 mt-12 mb-8">
            <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1, -1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 ${currentPage === 1
                        ? 'text-gray-300 border-gray-100 dark:border-white/5 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100'
                    }`}
            >
                <ChevronLeftIcon fontSize="small" />
            </motion.button>

            <div className="flex items-center gap-1.5">
                {visiblePages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                                ...
                            </span>
                        );
                    }
                    
                    return (
                        <motion.button
                            key={page}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onPageChange(page, page > currentPage ? 1 : -1)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${currentPage === page
                                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            {page}
                        </motion.button>
                    );
                })}
            </div>

            <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1, 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 ${currentPage === totalPages
                        ? 'text-gray-300 border-gray-100 dark:border-white/5 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100'
                    }`}
            >
                <ChevronRightIcon fontSize="small" />
            </motion.button>
        </div>
    );
};

export default Pagination;
