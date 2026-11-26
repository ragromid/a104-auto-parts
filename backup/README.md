# Supabase Full Backup & Migration Guide

This directory contains everything needed to export your entire Supabase database and storage buckets locally, and migrate to another database or Supabase instance.

---

## 1. Fast Export (Data + Storage Images)

To export all database tables (`categories`, `products`, `site_settings`) and download all files from the `product-images` storage bucket to your local machine:

### Option A: Using `.env` file
Create or edit `.env` in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # (or VITE_SUPABASE_ANON_KEY)
```

Run the export script:
```bash
npm run db:export
```

### Option B: Using PowerShell command line
```powershell
$env:VITE_SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-or-anon-key"
npm run db:export
```

### What this exports locally:
- `backup/data/categories.json`
- `backup/data/products.json`
- `backup/data/site_settings.json`
- `backup/storage/product-images/*` (all uploaded product photos)
- `backup/schema.sql` (PostgreSQL / Supabase DDL table schema)

---

## 2. Low-Level PostgreSQL Schema & Data Dump (pg_dump)

If you have PostgreSQL installed on your machine and want a raw `.sql` database dump directly from the Supabase Postgres instance:

1. In Supabase Dashboard, go to: **Project Settings > Database > Connection String > URI**.
2. Run in terminal:
```bash
pg_dump -h db.your-project.supabase.co -U postgres -d postgres -F p -f backup/full_database_dump.sql
```
*(Enter your database password when prompted)*

---

## 3. Importing to New Database / Supabase Project

1. Run `backup/schema.sql` in your new database SQL editor (creates the tables, relations, and RLS policies).
2. Create the `product-images` bucket in the new project's Storage.
3. Import the data and images automatically:
```powershell
$env:TARGET_SUPABASE_URL="https://your-new-project.supabase.co"
$env:TARGET_SUPABASE_SERVICE_ROLE_KEY="your-new-service-key"
npm run db:import
```
4. Update your website's `.env` with the new project's URL and Anon Key.
