/**
 * Script to clear database and reload fresh data
 */

import 'dotenv/config';
import { db } from './db';
import { trips } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { processCSVFile } from './dataProcessor';
import path from 'path';

const CSV_FILE_PATH = path.join(process.cwd(), 'train.csv');

async function clearAndReload() {
  console.log('=== Database Reset and Data Reload ===\n');
  
  try {
    // Step 1: Clear existing data
    console.log('Step 1: Clearing existing data from trips table...');
    await db.delete(trips);
    console.log('✓ All trips deleted\n');

    // Step 2: Verify table is empty
    const [count] = await db.select({ count: sql<number>`count(*)` }).from(trips);
    console.log(`Verification: ${count.count} trips in database (should be 0)\n`);

    // Step 3: Load fresh data
    console.log('Step 2: Loading data from train.csv...');
    console.log(`File: ${CSV_FILE_PATH}\n`);
    
    const stats = await processCSVFile(CSV_FILE_PATH);

    console.log('\n=== Reload Complete ===');
    console.log('Summary:');
    console.log(`  Total rows processed: ${stats.totalRows}`);
    console.log(`  Valid rows: ${stats.validRows}`);
    console.log(`  Successfully inserted: ${stats.inserted}`);
    console.log(`  Duplicates removed: ${stats.duplicates}`);
    console.log(`  Invalid/missing: ${stats.missingValues}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during reload:', error);
    process.exit(1);
  }
}

clearAndReload();
