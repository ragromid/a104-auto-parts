import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const initialCategories = [];

// We need initial products from somewhere. 
// Since they were hardcoded in App.jsx, I'll need to move them here or allow passing them in.
// For now, I'll define a default empty list or expect them to be initialized.
// Actually, to avoid breaking execution, I'll copy the initial products here as a default fallback.

const initialProducts = [];

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
    const useDb = import.meta.env.VITE_USE_DB === 'true';

    // Initialize state
    const [products, setProducts] = useState(() => {
        if (useDb) return []; // Will fetch on mount
        const saved = localStorage.getItem('site_products');
        return saved ? JSON.parse(saved) : initialProducts;
    });

    const [categories, setCategories] = useState(() => {
        if (useDb) return []; // Fetch on mount
        const saved = localStorage.getItem('site_categories');
        return saved ? JSON.parse(saved) : initialCategories;
    });

    const [dbError, setDbError] = useState(null);

    // Initial Fetch for DB Mode
    useEffect(() => {
        if (useDb) {
            const fetchFromDB = async () => {
                try {
                    // Fetch Products
                    const { data: productsData, error: pErr } = await supabase
                        .from('products')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (productsData) setProducts(productsData);
                    if (pErr) {
                        console.error("Supabase Product Error:", pErr);
                        setDbError(pErr.message || "Failed to fetch products");
                    }

                    // Fetch Categories
                    const { data: catData, error: cErr } = await supabase
                        .from('categories')
                        .select('*');

                    if (cErr) {
                        console.error("Supabase Category Error:", cErr);
                        setDbError(cErr.message || "Failed to fetch categories");
                    }

                    if (catData && catData.length > 0) {
                        // Build Tree from flat DB rows
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
                        console.log("DB FETCH: Setup category tree", tree);
                        setCategories(tree);
                    } else {
                        console.log("DB FETCH: No categories found, setting empty");
                        setCategories([]);
                    }
                } catch (e) {
                    console.error("DB Fetch Error:", e);
                }
            };
            fetchFromDB();
        }
    }, [useDb]);

    // Save to local storage whenever state changes (Fallback mode)
    useEffect(() => {
        if (!useDb) {
            localStorage.setItem('site_products', JSON.stringify(products));
            localStorage.setItem('site_categories', JSON.stringify(categories));
        }
    }, [products, categories, useDb]);

    // --- History Management (Undo/Redo) ---
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    const saveSnapshot = () => {
        setPast(prev => [...prev, { products, categories }]);
        setFuture([]);
    };

    const undo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        setFuture(prev => [{ products, categories }, ...prev]);
        setProducts(previous.products);
        setCategories(previous.categories);
        setPast(newPast);
        // DB Undo sync would be complex, primarily local builder feature
    };

    const redo = () => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, { products, categories }]);
        setProducts(next.products);
        setCategories(next.categories);
        setFuture(newFuture);
    };

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    // --- CRUD Operations ---
    const updateProduct = async (id, field, value) => {
        if (field === 'name' && value.length > 100) return;
        if (field === 'sku' && value.length > 50) return;
        if (field === 'info' && value.length > 1000) return;
        if (field === 'price' && (isNaN(value) || value < 0)) return;

        saveSnapshot();

        if (field === 'category' && value) {
            const exists = categories.some(function check(cat) {
                return cat.name === value || (cat.children && cat.children.some(check));
            });
            if (!exists) addCategory(null, value);
        }

        // Optimistic UI update
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

        // Optimistic UI
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
        setProducts(prev => prev.filter(p => p.id !== id));

        if (useDb) {
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

        // 1. Optimistic UI Updates
        // Update Products
        setProducts(prev => prev.map(p => p.category === id ? { ...p, category: newName } : p));

        // Update Categories (Cascade rename self and children's parent references) -> Note: The tree structure 
        // handles children inherently (they sit inside the parent's children array).
        // If they had a parentId prop on them, we'd update it, but the tree structure relies on object nesting.
        // We just need to ensure the parent's ID changes.
        const updateRecursive = (list) => {
            return list.map(cat => {
                if (cat.id === id) return { ...cat, id: newName, name: newName };
                if (cat.children) return { ...cat, children: updateRecursive(cat.children) };
                return cat;
            });
        };
        setCategories(prev => updateRecursive(prev));

        // 2. Database Synchronized Cascades
        if (useDb) {
            try {
                // A. Update the Category's own record (id and name)
                const { error: selfErr } = await supabase
                    .from('categories')
                    .update({ id: newName, name: newName }) // Depending on DB config, this might require ON UPDATE CASCADE in SQL, but we manually push it here
                    .eq('id', id);

                if (selfErr) {
                    console.error("DB Category Rename Failed", selfErr);
                    alert("Rename failed. Your database might be out of sync, please refresh the page.\n\n" + selfErr.message);
                    undo(); // Roll back the UI rename
                    return; // Stop the cascade
                }

                // B. Update Children's parent_id (Orphan prevention)
                const { error: childrenErr } = await supabase
                    .from('categories')
                    .update({ parent_id: newName })
                    .eq('parent_id', id);

                if (childrenErr) console.error("DB Children Cascade Failed", childrenErr);

                // C. Update Products' category mapping
                const { error: productsErr } = await supabase
                    .from('products')
                    .update({ category: newName })
                    .eq('category', id);

                if (productsErr) console.error("DB Products Cascade Failed", productsErr);

            } catch (err) {
                console.error("Critical Cascade Failure:", err);
            }
        }
    };

    const addCategory = async (parentId, newCategoryName) => {
        const safeParentId = (!parentId || parentId === 'All' || parentId === '') ? null : parentId;
        console.log("ADD CATEGORY TRIGGERED", { originalParentId: parentId, safeParentId, newCategoryName });
        if (newCategoryName && newCategoryName.length > 50) return;

        saveSnapshot();
        const randStr = Math.random().toString(36).substring(2, 6);
        const name = newCategoryName || `New Category ${randStr}`;
        const id = name;
        const newCat = { id, name, children: [] };

        const addToState = () => {
            if (!parentId || parentId === 'All') {
                console.log("Adding to root level", newCat);
                setCategories(prev => [...prev, newCat]);
                return;
            }
            const addRecursive = (list) => {
                return list.map(cat => {
                    if (cat.id === parentId) {
                        return { ...cat, children: [...(cat.children || []), newCat] };
                    }
                    if (cat.children) return { ...cat, children: addRecursive(cat.children) };
                    return cat;
                });
            };
            setCategories(prev => {
                const n = addRecursive(prev);
                console.log("Adding nested", n);
                return n;
            });
        };
        addToState();

        if (useDb) {
            console.log("Sending to DB...");
            const { error } = await supabase
                .from('categories')
                .insert([{ id, name, parent_id: safeParentId }]);
            if (error) {
                console.error("DB Add Category Failed", error);
                setDbError("Add Category Failed: " + error.message);
            } else {
                console.log("DB Add Category SUCCESS");
            }
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
            updateProduct,
            addProduct,
            deleteProduct,
            updateCategoryName,
            addCategory,
            deleteCategory,
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
