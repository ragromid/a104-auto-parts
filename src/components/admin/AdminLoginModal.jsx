import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LockIcon from '@mui/icons-material/Lock';

const AdminLoginModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        const { success, error } = await login(email, password);

        setIsLoading(false);
        if (success) {
            setEmail('');
            setPassword('');
            onClose();
        } else {
            setErrorMsg(error || t('admin.invalidCredentials', 'Invalid login credentials'));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
                        className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-900 dark:text-white mb-2">
                                <LockIcon fontSize="large" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                            {t('admin.login')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                            </div>

                            {errorMsg && (
                                <p className="text-red-500 text-xs text-center mt-2 font-medium">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full mt-4 bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-xl hover:opacity-90 transition-opacity ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {isLoading ? 'Authenticating...' : t('admin.unlock')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AdminLoginModal;
