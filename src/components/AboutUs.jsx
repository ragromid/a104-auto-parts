import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const AboutUs = () => {
    const { t } = useTranslation();

    return (
        <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-white/5 py-8 md:py-12"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4 text-secondary">
                            <InfoOutlinedIcon fontSize="small" />
                            <span className="text-sm font-bold uppercase tracking-widest">{t('ui.aboutUsTitle', 'About KNK AVTO')}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white mb-6">
                            {t('ui.aboutUsHeading', 'Premium Quality Auto Parts for Your Vehicle.')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg max-w-2xl">
                            {t('ui.aboutUsDescription', 'KNK AVTO (a104.az) is your trusted destination for high-performance automotive components. We specialize in sourcing and providing top-tier products from world-renowned brands like NGK, Brembo, and Castrol, ensuring your vehicle performs at its peak.')}
                        </p>
                    </div>
                    <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-gray-100 dark:bg-white/5 rounded-3xl overflow-hidden relative group">
                        <img
                            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop"
                            alt="About KNK AVTO"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default AboutUs;
