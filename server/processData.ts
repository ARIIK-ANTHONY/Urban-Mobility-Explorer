/**
 * CLI Script to Process NYC Taxi Trip Data
 * 
 * Usage:
 *   npm run process-data          - Process sample data (10,000 trips)
 *   npm run process-data full     - Process entire dataset
 */

import { processCSVFile, processSampleData } from './dataProcessor';
import path from 'path';

const CSV_FILE_PATH = path.join(process.cwd(), 'attached_assets', 'train_1761323433432.csv');

async function main() {
  const args = process.argv.slice(2);
  const isFull = args.includes('full');

  console.log('=== NYC Taxi Trip Data Processing ===\n');
  console.log(`Mode: ${isFull ? 'FULL DATASET' : 'SAMPLE DATA (10,000 trips)'}`);
  console.log(`File: ${CSV_FILE_PATH}\n`);

  try {
    const stats = isFull
      ? await processCSVFile(CSV_FILE_PATH)
      : await processSampleData(CSV_FILE_PATH, 10000);

    console.log('\n✅ Processing completed successfully!');
    console.log(JSON.stringify(stats, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Processing failed:', error);
    process.exit(1);
  }
}

main();
