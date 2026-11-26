import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load credentials from environment variables or .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials.');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
    console.error('Example:');
    console.error('  $env:VITE_SUPABASE_URL="https://your-project.supabase.co"');
    console.error('  $env:VITE_SUPABASE_ANON_KEY="your-anon-or-service-role-key"');
    console.error('  node scripts/export-supabase.js');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BACKUP_DIR = path.resolve('backup');
const DATA_DIR = path.join(BACKUP_DIR, 'data');
const STORAGE_DIR = path.join(BACKUP_DIR, 'storage');

// Ensure output directories exist
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(STORAGE_DIR, { recursive: true });

const KNOWN_TABLES = ['categories', 'products', 'site_settings'];
const KNOWN_BUCKETS = ['product-images'];

async function exportTables() {
    console.log('📦 --- Exporting Database Tables ---');
    for (const table of KNOWN_TABLES) {
        try {
            console.log(`⏳ Fetching table: ${table}...`);
            const { data, error } = await supabase.from(table).select('*');
            if (error) {
                console.warn(`⚠️ Warning fetching ${table}:`, error.message);
                continue;
            }

            const filePath = path.join(DATA_DIR, `${table}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`✅ Saved ${data.length} rows to ${filePath}`);
        } catch (err) {
            console.error(`❌ Failed to export table ${table}:`, err.message);
        }
    }
}

async function exportStorage() {
    console.log('\n📁 --- Exporting Storage Buckets ---');

    // Attempt to list buckets if service role key is provided, or use known buckets
    let bucketsToDownload = KNOWN_BUCKETS;
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (!error && buckets && buckets.length > 0) {
            bucketsToDownload = Array.from(new Set([...KNOWN_BUCKETS, ...buckets.map(b => b.name)]));
        }
    } catch {
        // Fall back to known buckets
    }

    for (const bucket of bucketsToDownload) {
        const bucketFolder = path.join(STORAGE_DIR, bucket);
        fs.mkdirSync(bucketFolder, { recursive: true });

        console.log(`⏳ Listing files in bucket: "${bucket}"...`);
        try {
            const { data: files, error } = await supabase.storage.from(bucket).list('', {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' }
            });

            if (error) {
                console.warn(`⚠️ Warning listing bucket ${bucket}:`, error.message);
                continue;
            }

            if (!files || files.length === 0) {
                console.log(`ℹ️ Bucket "${bucket}" is empty.`);
                continue;
            }

            console.log(`📥 Downloading ${files.length} file(s) from "${bucket}"...`);
            for (const file of files) {
                if (!file.name || file.id === null) continue; // Skip folders or invalid items
                try {
                    const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(file.name);
                    if (downloadError) {
                        console.warn(`⚠️ Failed to download ${file.name}:`, downloadError.message);
                        continue;
                    }

                    const arrayBuffer = await blob.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const targetFile = path.join(bucketFolder, file.name);
                    fs.writeFileSync(targetFile, buffer);
                    console.log(`   ✓ Downloaded: ${file.name}`);
                } catch (e) {
                    console.warn(`⚠️ Error saving file ${file.name}:`, e.message);
                }
            }
        } catch (err) {
            console.error(`❌ Error with bucket ${bucket}:`, err.message);
        }
    }
}

async function main() {
    console.log(`🚀 Starting full export from: ${supabaseUrl}\n`);
    await exportTables();
    await exportStorage();
    console.log(`\n🎉 Backup complete! All data and storage saved to:\n   ${BACKUP_DIR}\n`);
}

main().catch(err => {
    console.error('Fatal backup error:', err);
    process.exit(1);
});
