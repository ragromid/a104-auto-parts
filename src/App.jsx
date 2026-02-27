import React, { useState, useEffect, useMemo } from 'react';
import { categories } from './data/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Lenis from 'lenis';
import Header from './components/Header';
import CategoryChips from './components/CategoryChips';
import ProductCard from './components/ProductCard';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
const CategoryBottomSheet = React.lazy(() => import('./components/CategoryBottomSheet'));
const CartDrawer = React.lazy(() => import('./components/CartDrawer'));
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import ExpandedProductCard from './components/ExpandedProductCard';
import AddIcon from '@mui/icons-material/Add';


// ... (top of file)

// Recursive Category Helper
const getCategoryAndSubIds = (targetId, list) => {
  let result = [];

  // Find the target node first
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const foundNode = findNode(list);

  if (foundNode) {
    const collectIds = (node) => {
      result.push(node.id);
      if (node.children) node.children.forEach(collectIds);
    };
    collectIds(foundNode);
  } else {
    result.push(targetId);
  }

  return result;
};

// Staggered Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 50, damping: 20 }
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.25, type: 'tween', ease: 'backIn' } // Using 'tween' avoids spring physics on exit for cleaner pop
  }
};

const AdminToolbar = React.lazy(() => import('./components/admin/AdminToolbar'));
const AdminLoginModal = React.lazy(() => import('./components/admin/AdminLoginModal'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
import { useAuth } from './context/AuthContext';
import { useContent } from './context/ContentContext';

function AppContent() {
  const { t } = useTranslation();
  const { products, categories, addProduct } = useContent();
  const { isAuthenticated, isAdminMode, login } = useAuth(); // We might not need login here if using modal

  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState(null);

  const handleProductSelect = React.useCallback((id) => {
    setSelectedProductId(id);
  }, []);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Check URL for direct product links on load
  useEffect(() => {
    if (!loading && products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId) {
        const found = products.find(p => p.id === productId);
        if (found) {
          setSelectedProductId(productId);

          // Optional: clear the URL so refreshing doesn't keep opening it
          // window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [loading, products]);

  // Initialize Lenis for Smooth Scroll
  useEffect(() => {
    // Disable Lenis entirely on touch/mobile devices to rely on native hardware-accelerated scrolling
    const isMobileOrTouch = window.innerWidth <= 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    if (isMobileOrTouch) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const [activeMobileTab, setActiveMobileTab] = useState('home');

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      let matchesCategory = true;

      if (activeCategory !== 'All') {
        const validCategories = getCategoryAndSubIds(activeCategory, categories);
        matchesCategory = validCategories.includes(product.category);
      }

      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  // Resolve Category Name from ID
  const activeCategoryName = useMemo(() => {
    if (activeCategory === 'All') return t('ui.latestArrivals');

    const findName = (list) => {
      for (const cat of list) {
        if (cat.id === activeCategory) return t(`filters.${cat.name}`, cat.name);
        if (cat.children) {
          const found = findName(cat.children);
          if (found) return found;
        }
      }
      return activeCategory; // fallback
    };
    return findName(categories);
  }, [activeCategory, categories, t]);

  // Mobile Search View Logic
  const showMobileSearch = activeMobileTab === 'search';

  return (
    <>
      <Helmet>
        <title>{t('ui.siteTitle', 'a104.az - KNK AVTO')}</title>
        <meta name="description" content={t('ui.siteDescription', 'Find the best premium auto parts and accessories directly at a104.az.')} />
        <meta property="og:title" content="a104.az - KNK AVTO" />
        <meta property="og:type" content="website" />
      </Helmet>
      <CartProvider>
        <AnimatePresence mode="wait">
          {loading && <SplashScreen onComplete={() => setLoading(false)} />}
        </AnimatePresence>
        <React.Suspense fallback={null}>
          <CartDrawer />
        </React.Suspense>

        <React.Suspense fallback={null}>
          <CategoryBottomSheet
            isOpen={isCategorySheetOpen}
            onClose={() => setIsCategorySheetOpen(false)}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </React.Suspense>

        <React.Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </React.Suspense>

        <AnimatePresence>
          {selectedProductId && (
            <ExpandedProductCard
              product={products.find(p => p.id === selectedProductId)}
              onClose={() => setSelectedProductId(null)}
              layoutId={selectedProductId === justCreatedId ? 'add-button' : undefined}
            />
          )}
        </AnimatePresence>

        {!loading && (
          <div className="min-h-screen bg-background dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
            <Header
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode} // Kept for mobile or fallback, but mostly used in SettingsModal now
              onOpenSettings={() => setIsSettingsOpen(true)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <main className="flex-1 max-w-7xl mx-auto w-full pb-24 md:pb-20">
              {/* Mobile Search Overlay/Input */}
              {showMobileSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-4 md:hidden sticky top-[4rem] z-40 bg-background/95 dark:bg-background-dark/95 backdrop-blur-md"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 rounded-xl bg-gray-100 dark:bg-white/10 border-none focus:ring-2 focus:ring-secondary text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 transition-all"
                      placeholder="Search products..."
                    />
                  </div>
                </motion.div>
              )}

              {/* Content Logic: Show Hero/Categories only on 'home' */}
              {!showMobileSearch && (
                <>
                  {/* Categories - Sticky */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="sticky top-[4rem] z-40 bg-background/95 dark:bg-background-dark/95 backdrop-blur-md pt-4 pb-2 transition-all duration-300">
                    <CategoryChips
                      activeCategory={activeCategory}
                      onSelectCategory={setActiveCategory}
                      onOpenSheet={() => setIsCategorySheetOpen(true)}
                    />
                  </motion.div>

                  {/* Hero Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                    className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
                  >
                    <div className="rounded-3xl p-8 sm:p-16 relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center text-center">
                      {/* Background Accents */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-secondary-dark opacity-80" />
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]" />
                      <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />

                      <div className="relative z-10 flex flex-col items-center">
                        {/* Logo Icon Implementation */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.8 }}
                          className="relative w-32 h-32 sm:w-48 sm:h-48 mb-6 sm:mb-8"
                        >
                          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(255,87,34,0.4)]">
                            {/* Left Segment (Red-Orange) */}
                            <motion.path
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5, duration: 0.8 }}
                              d="M22 12C15 15 12 25 12 50C12 75 15 85 22 88L78 88L52 64L68 64L42 38L58 38L32 12H22Z"
                              fill="#FF3D00"
                            />
                            {/* Right Segment (Orange) */}
                            <motion.path
                              initial={{ x: 10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.8 }}
                              d="M32 12L88 50L78 88L52 64L68 64L42 38L58 38L32 12Z"
                              fill="#FF9100"
                            />
                          </svg>
                        </motion.div>

                        <motion.h2
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                          className="text-4xl sm:text-8xl font-black tracking-tighter mb-2"
                        >
                          <span className="text-gray-900 dark:text-white">KNK</span>{' '}
                          <span className="text-secondary">Avto</span>
                        </motion.h2>

                        <motion.p
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          className="text-lg sm:text-2xl text-gray-400 dark:text-gray-500 font-medium mb-10 tracking-widest"
                        >
                          {t('ui.brandSubtext')}
                        </motion.p>

                        <motion.button
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.0, duration: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const grid = document.getElementById('product-grid');
                            if (grid) grid.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-secondary dark:hover:bg-secondary hover:text-white dark:hover:text-white font-semibold py-4 px-12 rounded-full transition-all duration-300 text-sm sm:text-base shadow-xl shadow-gray-200 dark:shadow-none"
                        >
                          {t('ui.shopNow')}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              {/* Product Grid - Always visible but filtered */}
              <div id="product-grid" className="px-4 sm:px-6 lg:px-8 py-4">
                {showMobileSearch && (
                  <h3 className="text-xl font-medium mb-4 px-1">{filteredProducts.length} {t('ui.results')}</h3>
                )}

                {!showMobileSearch && (
                  <div className="flex items-center justify-between gap-3 mb-6 md:mb-8 pl-1">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="text-xl md:text-2xl font-light tracking-tight"
                    >
                      {activeCategoryName}
                    </motion.h2>

                    {isAdminMode && (
                      <motion.button
                        layoutId="add-button"
                        onClick={() => {
                          const newProduct = addProduct({
                            name: 'New Product',
                            category: activeCategory === 'All' ? 'Engine' : activeCategory,
                            price: 0,
                            sku: 'NEW-' + Math.floor(Math.random() * 1000),
                            image: 'https://placehold.co/800x600?text=New+Product',
                          });
                          setJustCreatedId(newProduct.id);
                          setSelectedProductId(newProduct.id);
                        }}
                        className="bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-green-600 transition-colors"
                        title="Add Product"
                      >
                        <AddIcon fontSize="small" />
                      </motion.button>
                    )}
                  </div>
                )}

                {filteredProducts.length > 0 ? (
                  <motion.div
                    layout
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="h-full"
                        >
                          <ProductCard
                            product={product}
                            onSelect={handleProductSelect}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <p>{t('ui.noProducts')}</p>
                  </div>
                )}
              </div>
            </main>

            <BottomNav
              activeTab={activeMobileTab}
              onTabChange={setActiveMobileTab}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
            <React.Suspense fallback={null}>
              <AdminToolbar />
            </React.Suspense>
          </div>
        )}
      </CartProvider>
    </>
  );
}

import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';



function MainLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAdminRoute = location.pathname === '/admin';

  // STRICT GUARD: If on /admin and not authenticated, BLOCK everything else.
  if (isAdminRoute && !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900">
        {/* Force open, empty onClose to prevent closing */}
        <React.Suspense fallback={null}>
          <AdminLoginModal isOpen={true} onClose={() => { }} />
        </React.Suspense>
      </div>
    );
  }

  return (
    <>
      <AppContent />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <MainLayout />
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
