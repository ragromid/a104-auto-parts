import React, { memo } from 'react';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import EditableText from './editable/EditableText';
import EditablePrice from './editable/EditablePrice';
import EditableImage from './editable/EditableImage';

const ProductCard = memo(({ product, onSelect }) => {
    const { addToCart, cartItems } = useCart();
    const { isAdminMode } = useAuth();
    const { updateProduct, deleteProduct } = useContent();

    // Check if item is already in cart
    const isAdded = cartItems.some(item => item.id === product.id);

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteProduct(product.id);
    };

    return (
        <motion.div
            layoutId={`card-${product.id}`}
            className="group relative h-full bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-sm md:hover:shadow-2xl dark:shadow-none dark:hover:bg-zinc-800 ring-1 ring-gray-100 dark:ring-white/5 flex flex-col"
            onClick={onSelect}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Compatibility - Mobile Optimized Dot */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex items-center gap-2">
                {product.recommended && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-black dark:text-white text-[8px] md:text-[10px] uppercase tracking-wider font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm"
                    >
                        Featured
                    </motion.div>
                )}
            </div>

            {isAdminMode && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 z-30 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md hover:bg-red-600 transition-colors"
                >
                    <DeleteIcon style={{ fontSize: 16 }} />
                </button>
            )}

            {/* Product Image */}
            <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <EditableImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    onSave={(val) => updateProduct(product.id, 'image', val)}
                />
                <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 dark:md:group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
            </div>

            <motion.div layoutId={`content-${product.id}`} className="p-3 md:p-6 flex-1 flex flex-col relative">
                <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
                    <h3 className="text-base sm:text-lg font-light text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 tracking-tight w-full">
                        <EditableText
                            value={product.name}
                            onSave={(val) => updateProduct(product.id, 'name', val)}
                        />
                    </h3>
                </div>

                <div className="flex flex-col gap-2 mb-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 min-h-[2.5em]">
                        <EditableText
                            value={product.info || 'No details'}
                            onSave={(val) => updateProduct(product.id, 'info', val)}
                        />
                    </div>

                    <div className="flex items-center">
                        <span className="text-[10px] font-mono font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded tracking-wider border border-gray-200 dark:border-white/10">
                            <EditableText
                                value={product.sku}
                                onSave={(val) => updateProduct(product.id, 'sku', val)}
                            />
                        </span>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                    <span className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        <EditablePrice
                            value={product.price}
                            onSave={(val) => updateProduct(product.id, 'price', val)}
                        />
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`
              h-11 w-11 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90
              ${isAdded
                                ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 hover:text-white dark:hover:bg-gray-200 shadow-lg shadow-black/20 dark:shadow-white/20'
                            }
            `}
                    >
                        <AnimatePresence mode="wait">
                            {isAdded ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 45 }}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="add"
                                    initial={{ scale: 0, rotate: 45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: -45 }}
                                >
                                    <AddIcon fontSize="small" style={{ fontSize: 20 }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.div>
        </motion.div >
    );
});

export default ProductCard;
