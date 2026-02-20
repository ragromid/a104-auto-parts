import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const OrderSuccessModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-8 z-[90] text-center shadow-2xl border border-gray-100 dark:border-white/10"
                    >
                        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircleOutlineIcon className="text-[#FF4D00]" style={{ fontSize: 40 }} />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Order Initiated!
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            Your order details have been sent to our WhatsApp. Please continue the chat there to finalize your purchase.
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full bg-[#FF4D00] hover:bg-[#E04400] text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                        >
                            Back to Garage
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrderSuccessModal;
