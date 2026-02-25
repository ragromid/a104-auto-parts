import { supabase } from './supabase';

/**
 * Deletes an image from the 'product-images' bucket given its public URL.
 * @param {string} url - The full public URL of the image.
 */
export const deleteImageFromStorage = async (url) => {
    if (!url) return;

    try {
        // 1. Verify if the URL exists and is from Supabase Storage
        // Example URL: https://pxxxxxxxx.supabase.co/storage/v1/object/public/product-images/1708123456789.jpg
        if (!url.includes('/storage/v1/object/public/product-images/')) {
            console.log("Skipping deletion: URL is not a Supabase product image.", url);
            return;
        }

        // 2. Extract the filename from the URL
        // Everything after the last slash
        const fileName = url.split('/').pop();

        if (!fileName) {
            console.error("Could not extract filename from URL:", url);
            return;
        }

        console.log("Attempting to delete image from storage:", fileName);

        // 3. Perform the deletion
        const { data, error } = await supabase.storage
            .from('product-images')
            .remove([fileName]);

        if (error) {
            console.error("Error deleting image from Supabase Storage:", error);
            return { success: false, error };
        }

        console.log("Successfully deleted image from Supabase Storage:", fileName);
        return { success: true, data };
    } catch (err) {
        console.error("Critical error in deleteImageFromStorage:", err);
        return { success: false, error: err };
    }
};
