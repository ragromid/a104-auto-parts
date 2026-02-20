import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExit(true);
            setTimeout(onComplete, 800); // Wait for exit animation
        }, 2500); // Display duration
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950 text-white"
            initial={{ opacity: 1 }}
            animate={exit ? { opacity: 0, scale: 1.1 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
            <div className="flex items-center gap-1 overflow-hidden">
                <motion.span
                    className="text-6xl md:text-8xl font-light tracking-tighter"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                >
                    a
                </motion.span>
                <motion.span
                    className="text-6xl md:text-8xl font-bold tracking-tighter text-secondary"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
                >
                    104
                </motion.span>
            </div>

            {/* Loading bar */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 h-0.5 bg-white/20 w-48 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <motion.div
                    className="h-full bg-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                />
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
