import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { deleteImageFromStorage } from '../lib/storage';

const initialCategories = [
    { id: 'Engine', name: 'Engine', children: [] },
    { id: 'Brakes', name: 'Brakes', children: [] },
    { id: 'Lighting', name: 'Lighting', children: [] }
];

const initialProducts = [
    {
        id: 'p1',
        name: 'NGK Iridium IX Spark Plug',
        sku: 'BKR6EIX',
        category: 'Engine',
        info: 'High-performance iridium spark plug designed for improved throttle response and ignition efficiency.',
        image: 'https://images.unsplash.com/photo-1635437536607-b8572f443763?q=80&w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1635437536607-b8572f443763?q=80&w=800&auto=format&fit=crop']
    },
    {
        id: 'p2',
        name: 'Brembo Ceramic Brake Pads',
        sku: 'P06037N',
        category: 'Brakes',
        info: 'Premium ceramic brake pads offering superior stopping power, low dust, and quiet operation.',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop']
    },
    {
        id: 'p3',
        name: 'Castrol EDGE 5W-30 Full Synthetic',
        sku: 'CAS-5W30-4L',
        category: 'Engine',
        info: 'Advanced full synthetic motor oil that provides maximum engine performance and protection.',
        image: 'https://images.unsplash.com/photo-1621905252507-b35482cdca4b?q=80&w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1621905252507-b35482cdca4b?q=80&w=800&auto=format&fit=crop']
    }
];

const defaultSiteSettings = {
    aboutTitle: 'About KNK AVTO',
    aboutHeading: 'Premium Quality Auto Parts for Your Vehicle.',
    aboutDescription: 'KNK AVTO (a104.az) is your trusted destination for high-performance automotive components. We specialize in sourcing and providing top-tier products from world-renowned brands like NGK, Brembo, and Castrol, ensuring your vehicle performs at its peak.',
    aboutImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop'
};

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
    const useDb = import.meta.env.VITE_USE_DB === 'true';

    const [products, setProducts] = useState(() => {
        if (useDb) return [];
        const saved = localStorage.getItem('site_products');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return initialProducts;
    });

    const [categories, setCategories] = useState(() => {
        if (useDb) return [];
        const saved = localStorage.getItem('site_categories');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return initialCategories;
    });

    const [siteSettings, setSiteSettings] = useState(() => {
        const saved = localStorage.getItem('site_settings');
        if (saved) return { ...defaultSiteSettings, ...JSON.parse(saved) };
        return defaultSiteSettings;
    });

    const [dbError, setDbError] = useState(null);

    useEffect(() => {
        if (useDb) {
            const fetchFromDB = async () => {
                try {
                    const { data: productsData, error: pErr } = await supabase
                        .from('products')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (productsData) setProducts(productsData);
                    if (pErr) {
                        console.error("Supabase Product Error:", pErr);
                        setDbError(pErr.message || "Failed to fetch products");
                    }

                    const { data: catData, error: cErr } = await supabase
                        .from('categories')
                        .select('*');

                    if (cErr) {
                        console.error("Supabase Category Error:", cErr);
                        setDbError(cErr.message || "Failed to fetch categories");
                    }

                    if (catData && catData.length > 0) {
                        const map = new Map();
                        catData.forEach(c => map.set(c.id, { ...c, children: [] }));
                        const tree = [];
                        catData.forEach(c => {
                            if (c.parent_id && map.has(c.parent_id)) {
                                map.get(c.parent_id).children.push(map.get(c.id));
                            } else {
                                tree.push(map.get(c.id));
                            }
                        });

                        // Apply custom local order if it exists
                        const savedCats = localStorage.getItem('site_categories');
                        if (savedCats) {
                            try {
                                const localTree = JSON.parse(savedCats);
                                if (Array.isArray(localTree) && localTree.length > 0) {
                                    const getOrderMap = (nodes) => {
                                        const oMap = new Map();
                                        nodes.forEach((n, idx) => oMap.set(n.id, idx));
                                        return oMap;
                                    };

                                    const oMap = getOrderMap(localTree);

                                    const sortNodes = (dbNodes, refNodes) => {
                                        if (!refNodes || dbNodes.length === 0) return dbNodes;

                                        dbNodes.sort((a, b) => {
                                            const aIdx = oMap.has(a.id) ? oMap.get(a.id) : 9999;
                                            const bIdx = oMap.has(b.id) ? oMap.get(b.id) : 9999;
                                            return aIdx - bIdx;
                                        });

                                        dbNodes.forEach(node => {
                                            const lNode = refNodes.find(ln => ln.id === node.id);
                                            if (lNode && lNode.children && node.children) {
                                                sortNodes(node.children, lNode.children);
                                            }
                                        });
                                        return dbNodes;
                                    };
                                    sortNodes(tree, localTree);
                                }
                            } catch (e) { console.error("Error sorting categories:", e); }
                        }

                        setCategories(tree);
                    } else {
                        setCategories([]);
                    }
                } catch (e) {
                    console.error("DB Fetch Error:", e);
                }

                // Try fetching site settings
                try {
                    const { data: settingsData, error: sErr } = await supabase
                        .from('site_settings')
                        .select('*')
                        .eq('id', 'global')
                        .single();
                    if (settingsData && !sErr) {
                        setSiteSettings(prev => ({ ...prev, ...settingsData }));
                    }
                } catch (e) {
                    // Ignore, table might not exist
                }

            };
            fetchFromDB();
        }
    }, [useDb]);

    useEffect(() => {
        if (!useDb) {
            localStorage.setItem('site_products', JSON.stringify(products));
        }
    }, [products, useDb]);

    useEffect(() => {
        // Prevent overwriting local storage with empty array on initial render before DB fetch finishes
        if (categories && categories.length > 0) {
            localStorage.setItem('site_categories', JSON.stringify(categories));
        }
    }, [categories]);

    const updateSiteSetting = async (key, value) => {
        saveSnapshot(); // Enable Undo for Settings
        setSiteSettings(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('site_settings', JSON.stringify(next));
            return next;
        });

        if (useDb) {
            try {
                const { error } = await supabase
                    .from('site_settings')
                    .upsert({ id: 'global', [key]: value });
                if (error) console.log("DB settings sync failed (table might not exist):", error.message);
            } catch (e) { }
        }
    };

    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    const saveSnapshot = () => {
        setPast(prev => [...prev, { products, categories, siteSettings }]);
        setFuture([]);
    };

    const undo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        setFuture(prev => [{ products, categories, siteSettings }, ...prev]);
        setProducts(previous.products);
        setCategories(previous.categories);
        if (previous.siteSettings) setSiteSettings(previous.siteSettings);
        setPast(newPast);
    };

    const redo = () => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        setPast(prev => [...prev, { products, categories, siteSettings }]);
        setProducts(next.products);
        setCategories(next.categories);
        if (next.siteSettings) setSiteSettings(next.siteSettings);
        setFuture(newFuture);
    };

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const updateProduct = async (id, field, value) => {
        if (field === 'name' && value.length > 100) return;
        if (field === 'sku' && value.length > 50) return;
        if (field === 'info' && value.length > 1000) return;

        saveSnapshot();

        if (field === 'category' && value) {
            const exists = categories.some(function check(cat) {
                return cat.name === value || (cat.children && cat.children.some(check));
            });
            if (!exists) addCategory(null, value);
        }

        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

        if (useDb) {
            const { error } = await supabase
                .from('products')
                .update({ [field]: value })
                .eq('id', id);
            if (error) console.error("DB Update Failed", error);
        }
    };

    const addProduct = async (newProduct) => {
        if (!newProduct.name || newProduct.name.length > 100) return null;

        saveSnapshot();
        const id = Date.now().toString();
        const productWithId = {
            ...newProduct,
            category: newProduct.category || 'All',
            id,
            images: newProduct.images || []
        };

        setProducts(prev => [productWithId, ...prev]);

        if (useDb) {
            const { error } = await supabase
                .from('products')
                .insert([productWithId]);
            if (error) console.error("DB Add Failed", error);
        }

        return productWithId;
    };

    const deleteProduct = async (id) => {
        saveSnapshot();
        const productToDelete = products.find(p => p.id === id);
        const imageUrl = productToDelete?.image;

        setProducts(prev => prev.filter(p => p.id !== id));

        if (useDb) {
            if (imageUrl) {
                await deleteImageFromStorage(imageUrl);
            }
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);
            if (error) console.error("DB Delete Failed", error);
        }
    };

    const updateCategoryName = async (id, newName) => {
        if (!newName || newName.length > 50) return;
        saveSnapshot();

        setProducts(prev => prev.map(p => p.category === id ? { ...p, category: newName } : p));

        const updateRecursive = (list) => {
            return list.map(cat => {
                if (cat.id === id) return { ...cat, id: newName, name: newName };
                if (cat.children) return { ...cat, children: updateRecursive(cat.children) };
                return cat;
            });
        };
        setCategories(prev => updateRecursive(prev));

        if (useDb) {
            try {
                const { error: selfErr } = await supabase
                    .from('categories')
                    .update({ id: newName, name: newName })
                    .eq('id', id);

                if (selfErr) {
                    console.error("DB Category Rename Failed", selfErr);
                    return;
                }

                await supabase.from('categories').update({ parent_id: newName }).eq('parent_id', id);
                await supabase.from('products').update({ category: newName }).eq('category', id);
            } catch (err) {
                console.error("Critical Cascade Failure:", err);
            }
        }
    };

    const addCategory = async (parentId, newCategoryName) => {
        const safeParentId = (!parentId || parentId === 'All' || parentId === '') ? null : parentId;
        if (newCategoryName && newCategoryName.length > 50) return;

        saveSnapshot();
        const randStr = Math.random().toString(36).substring(2, 6);
        const name = newCategoryName || `New Category ${randStr}`;
        const id = name;
        const newCat = { id, name, children: [] };

        const addRecursive = (list) => {
            return list.map(cat => {
                if (cat.id === parentId) {
                    return { ...cat, children: [...(cat.children || []), newCat] };
                }
                if (cat.children) return { ...cat, children: addRecursive(cat.children) };
                return cat;
            });
        };

        if (!parentId || parentId === 'All') {
            setCategories(prev => [...prev, newCat]);
        } else {
            setCategories(prev => addRecursive(prev));
        }

        if (useDb) {
            const { error } = await supabase
                .from('categories')
                .insert([{ id, name, parent_id: safeParentId }]);
            if (error) console.error("DB Add Category Failed", error);
        }
    };

    const deleteCategory = async (id) => {
        saveSnapshot();
        if (id === 'All') return;

        const deleteRecursive = (list) => {
            return list.filter(cat => cat.id !== id).map(cat => {
                if (cat.children) return { ...cat, children: deleteRecursive(cat.children) };
                return cat;
            });
        };
        setCategories(prev => deleteRecursive(prev));

        if (useDb) {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);
            if (error) console.error("DB Delete Category Failed", error);
        }
    };

    const moveCategory = (activeId, overId) => {
        if (!activeId || !overId || activeId === overId) return;

        saveSnapshot(); // Enable Undo for Category Movement

        setCategories((prev) => {
            const newCategories = JSON.parse(JSON.stringify(prev));

            const findParentAndInfo = (list, id) => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === id) return { parentList: list, index: i };
                    if (list[i].children) {
                        const found = findParentAndInfo(list[i].children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const activeInfo = findParentAndInfo(newCategories, activeId);
            const overInfo = findParentAndInfo(newCategories, overId);

            if (!activeInfo || !overInfo) return prev;

            const { parentList: activeList, index: activeIdx } = activeInfo;
            const { parentList: overList, index: overIdx } = overInfo;

            const [item] = activeList.splice(activeIdx, 1);
            overList.splice(overIdx, 0, item);

            return newCategories;
        });
    };

    const exportData = () => {
        const data = { products, categories };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `site-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <ContentContext.Provider value={{
            products,
            categories,
            dbError,
            moveCategory,
            updateProduct,
            addProduct,
            deleteProduct,
            updateCategoryName,
            addCategory,
            deleteCategory,
            setCategories,
            siteSettings,
            updateSiteSetting,
            exportData,
            undo,
            redo,
            canUndo,
            canRedo
        }}>
            {children}
        </ContentContext.Provider>
    );
};
