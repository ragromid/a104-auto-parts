import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import OrderSuccessModal from './OrderSuccessModal';

const CartDrawer = () => {
    const {
        cartItems,
        isCartOpen,
        toggleCart,
        updateQuantity,
        removeFromCart,
        getCartTotal
    } = useCart();

    const { t } = useTranslation();

    const [isSending, setIsSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const drawerRef = useRef(null);

    // Lock body scroll when cart is open
    React.useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

    // Close on click outside
    const handleBackdropClick = (e) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target)) {
            toggleCart();
        }
    };

    const handleWhatsAppOrder = () => {
        setIsSending(true);

        const total = getCartTotal();
        let message = "Salam, saytınızdan ehtiyat hissələri sifariş etmək istəyirəm. Səbətimdəki məhsullar:\n\n";

        const baseUrl = window.location.origin;

        cartItems.forEach((item, index) => {
            const productUrl = `${baseUrl}/?product=${item.id}`; // Simple URL scheme assuming we can deep link or just link to the site for now
            message += `${index + 1}. ${item.name} (SKU: ${item.sku})\n`;
            message += `   Sayt linki: ${productUrl}\n`;
            message += `   Say: ${item.quantity} ədəd, Qiymət: ${item.price * item.quantity} ₼\n\n`;
        });

        message += `Cəmi: ${total} ₼`;

        const encodedMessage = encodeURIComponent(message);

        // iOS Safari blocks window.open inside setTimeouts. We must navigate synchronously or directly modify location.
        window.location.href = `https://api.whatsapp.com/send?phone=994507007090&text=${encodedMessage}`;

        // Cleanup UI state in background
        setTimeout(() => {
            setIsSending(false);
            toggleCart();
            setShowSuccess(true);
        }, 500);
    };

    const variants = {
        hiddenDesktop: { x: '100%', opacity: 0 },
        visibleDesktop: {
            x: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        hiddenMobile: { y: '100%', opacity: 0 },
        visibleMobile: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        exitDesktop: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
        exitMobile: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
    };

    const isMobile = window.innerWidth < 768; // Simple check, could be more robust

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleCart} // Click outside to close is usually safer here
                            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
                        />

                        {/* Drawer */}
                        <motion.div
                            ref={drawerRef}
                            variants={variants}
                            initial={isMobile ? "hiddenMobile" : "hiddenDesktop"}
                            animate={isMobile ? "visibleMobile" : "visibleDesktop"}
                            exit={isMobile ? "exitMobile" : "exitDesktop"}
                            className={`
                                fixed z-[70] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col
                                md:top-0 md:right-0 md:left-auto md:h-full md:w-[400px] md:rounded-l-3xl
                                bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl md:rounded-none
                            `}
                        >
                            {/* Sending Overlay */}
                            <AnimatePresence>
                                {isSending && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="w-24 h-24 mb-6 relative"
                                        >
                                            <div className="absolute inset-0 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin"></div>
                                            <div className="absolute inset-4 bg-[#FF4D00]/20 rounded-full flex items-center justify-center">
                                                <WhatsAppIcon className="text-[#FF4D00]" style={{ fontSize: 32 }} />
                                            </div>
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('ui.sending')}</h3>
                                        <p className="text-sm text-gray-500">{t('ui.preparing')}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                                <h2 className="text-2xl font-light tracking-tight text-gray-900 dark:text-white">
                                    {t('ui.your')} <span className="font-bold text-secondary">{t('ui.garage')}</span>
                                </h2>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleCart}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <CloseIcon className="text-gray-500 dark:text-gray-400" />
                                </motion.button>
                            </div>

                            {/* Items */}
                            <div
                                className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain"
                                data-lenis-prevent
                            >
                                {cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                                            <ShoppingBagOutlinedIcon className="text-4xl text-gray-400" style={{ fontSize: 40 }} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">Your garage is empty</p>
                                            <p className="text-sm text-gray-500">Let's add some parts!</p>
                                        </div>
                                        <button
                                            onClick={toggleCart}
                                            className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    cartItems.map(item => (
                                        <motion.div
                                            layout
                                            key={item.id}
                                            className="flex gap-4"
                                        >
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">
                                                        {item.name}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                                                    >
                                                        <DeleteOutlineIcon style={{ fontSize: 18 }} />
                                                    </button>
                                                </div>
                                                <div className="flex items-end justify-between mt-2">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.price * item.quantity} ₼
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1">
                                                        <motion.button
                                                            whileTap={{ scale: 0.8 }}
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-white"
                                                        >
                                                            <RemoveIcon style={{ fontSize: 12 }} />
                                                        </motion.button>
                                                        <span className="text-xs font-medium w-3 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.8 }}
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-white"
                                                        >
                                                            <AddIcon style={{ fontSize: 12 }} />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {cartItems.length > 0 && (
                                <div className="p-6 border-t border-gray-100 dark:border-white/5 space-y-4 bg-white dark:bg-zinc-900 pb-safe mb-4">
                                    <div className="flex items-center justify-between text-lg font-medium text-gray-900 dark:text-white">
                                        <span>{t('ui.total')}</span>
                                        <span>{getCartTotal()} ₼</span>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleWhatsAppOrder}
                                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-green-500/20 active:scale-95"
                                    >
                                        <WhatsAppIcon />
                                        <span>Order via WhatsApp</span>
                                    </motion.button>
                                </div>
                            )}
                        </motion.div >
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default CartDrawer;
