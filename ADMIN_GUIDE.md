# a104.az Website Administrator Guide

Welcome to the a104.az visual builder! This guide will teach you the best practices for managing your shop's inventory and navigation directly from your live website.

## 1. Understanding Categories vs. Subcategories
Your website uses a "Nested" category system. 
- **Parent Categories** (e.g., *Engine*, *Brakes*, *Accessories*) sit at the very top.
- **Subcategories** (e.g., *Spark Plugs*, *Oil Filters*) sit *inside* Parent Categories.

### The Golden Rule of Organization:
**Never attach products directly to a broad Parent Category if Subcategories exist.** 
If you have a category called *Brakes* and a subcategory called *Brake Pads*, you should assign the product strictly to *Brake Pads*. The website will automatically show that product when a customer clicks on the broader *Brakes* category!

## 2. Managing the Navigation Menu (Category Chips)

### Creating a Root Category (e.g., "Engine")
1. Make sure you are at the Home screen (click the `All` bubble on the far left).
2. Click the green `+` button at the far right of the scrolling navigation bar.
3. A bubble named "New Category..." will appear.
4. Click the text and type the name (e.g., "Lighting"). Hit `Enter` to save.

### Creating a Subcategory (e.g., "Headlights")
1. Click on the Parent Category you want to add into (e.g., click "Lighting").
2. The navigation bar will zoom *into* that category (showing a back arrow `←`).
3. Click the green `+` button in the navigation bar to create a subcategory.
4. Name it (e.g., "Headlights").

### Renaming Categories
- Simply click on the text of any category pill and start typing. 
- **Safe Renaming:** You can rename anything, anytime! The database will automatically shift all subcategories and products over to the new name safely. 

### Deleting Categories
- Hover over a category pill and click the small red `x` icon. 
- **WARNING:** Because of Data Cascades, if you delete a category, any products inside that category will be automatically moved to "All" (uncategorized).

## 3. Adding Products

### The 4-Step Creation Flow
1. **Navigate First:** Use the top navigation bar to click deep into the exact Subcategory where you want the product to live (e.g., *Lighting* -> *Headlights*).
2. **Click Add:** Click the green `+` button located on the right side, just above the product grid.
3. **Draft Mode:** A blank "New Product" card will instantly appear at the top of the grid. It is already perfectly assigned to the "Headlights" category because you navigated there first!
4. **Edit Details:**
   - Click the image placeholder to upload a real, high-quality photo. (Keep images under 5MB).
   - Click the title to rename it. 
   - Click the SKU to give it an inventory tag (e.g., `HL-001`).
   - Click the Price to set the cost in AZN.

### Expanding a Product
Click anywhere on a product card (except the text fields) to open the **Expanded View**.
- Inside the Expanded View, you can click the "Description" paragraph to write detailed information, compatible car models, or technical specs about the part.
- If a customer clicks the WhatsApp button from this expanded view, the website will automatically send you the exact name, SKU, and a direct URL link to the exact part they are looking at!

## 4. Troubleshooting
- **Ghost Data:** If you ever rename a category and it immediately changes back, or if you add an image and it doesn't load, your Supabase Database might be experiencing a brief sync delay. Simply refresh the web page.
- **Admin Access:** If the green edit buttons disappear, your browser session expired for security reasons. Add `/admin` to the end of your website URL to log back in.
