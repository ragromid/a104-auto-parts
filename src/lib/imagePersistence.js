import localforage from 'localforage';

// Configure localforage to use IndexedDB
localforage.config({
    name: 'a104-auto-parts',
    storeName: 'product_images'
});

/**
 * Checks if an image is already in local storage.
 * Returns the object URL if found, otherwise null.
 */
export const getLocalImage = async (remoteUrl) => {
    if (!remoteUrl) return null;
    try {
        const blob = await localforage.getItem(remoteUrl);
        if (blob) {
            return URL.createObjectURL(blob);
        }
    } catch (error) {
        console.error('Error getting local image:', error);
    }
    return null;
};

/**
 * Fetches an image from a remote URL and saves it to local storage.
 * Returns the local object URL.
 */
export const fetchAndStoreImage = async (remoteUrl) => {
    if (!remoteUrl) return null;
    try {
        // First check if it's already there
        const existing = await localforage.getItem(remoteUrl);
        if (existing) return URL.createObjectURL(existing);

        // Fetch the image
        const response = await fetch(remoteUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        const blob = await response.blob();

        // Save to IndexedDB
        await localforage.setItem(remoteUrl, blob);

        return URL.createObjectURL(blob);
    } catch (error) {
        console.warn(`Could not store image locally: ${remoteUrl}`, error);
        return remoteUrl; // Fallback to remote URL
    }
};

/**
 * Removes an image from local storage.
 */
export const removeLocalImage = async (remoteUrl) => {
    if (!remoteUrl) return;
    try {
        await localforage.removeItem(remoteUrl);
    } catch (error) {
        console.error('Error removing local image:', error);
    }
};
