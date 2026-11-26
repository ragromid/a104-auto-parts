import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Target credentials
const targetUrl = process.env.TARGET_SUPABASE_URL;
const targetKey = process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY || process.env.TARGET_SUPABASE_ANON_KEY;

if (!targetUrl || !targetKey) {
    console.error('❌ Error: Missing target credentials.');
    console.error('Set TARGET_SUPABASE_URL and TARGET_SUPABASE_SERVICE_ROLE_KEY.');
    console.error('Example:');
    console.error('  $env:TARGET_SUPABASE_URL="https://new-project.supabase.co"');
    console.error('  $env:TARGET_SUPABASE_SERVICE_ROLE_KEY="your-new-service-key"');
    console.error('  node scripts/import-target.js');
    process.exit(1);
}

const supabase = createClient(targetUrl, targetKey);
const BACKUP_DIR = path.resolve('backup');
const DATA_DIR = path.join(BACKUP_DIR, 'data');
const STORAGE_DIR = path.join(BACKUP_DIR, 'storage');

async function importTable(tableName) {
    const filePath = path.join(DATA_DIR, `${tableName}.json`);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return;
    }

    const records = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!records || records.length === 0) {
        console.log(`ℹ️ No records for ${tableName}`);
        return;
    }

    console.log(`⏳ Uploading ${records.length} records to ${tableName}...`);
    const { error } = await supabase.from(tableName).upsert(records);
    if (error) {
        console.error(`❌ Error importing ${tableName}:`, error.message);
    } else {
        console.log(`✅ Imported ${tableName} successfully.`);
    }
}

async function importStorage(bucketName) {
    const bucketFolder = path.join(STORAGE_DIR, bucketName);
    if (!fs.existsSync(bucketFolder)) return;

    const files = fs.readdirSync(bucketFolder);
    console.log(`⏳ Uploading ${files.length} file(s) to bucket "${bucketName}"...`);

    for (const file of files) {
        const filePath = path.join(bucketFolder, file);
        const fileBuffer = fs.readFileSync(filePath);

        const { error } = await supabase.storage.from(bucketName).upload(file, fileBuffer, {
            upsert: true
        });

        if (error) {
            console.warn(`⚠️ Failed to upload ${file}:`, error.message);
        } else {
            console.log(`   ✓ Uploaded: ${file}`);
        }
    }
}

async function main() {
    console.log(`🚀 Starting import to target: ${targetUrl}\n`);
    // Import in foreign key order: categories -> products -> site_settings
    await importTable('categories');
    await importTable('products');
    await importTable('site_settings');

    await importStorage('product-images');
    console.log('\n🎉 Import finished!');
}

main().catch(console.error);
