/**
 * Script to check database tables and structure
 */

import 'dotenv/config';
import { db } from './db';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  try {
    console.log('=== Database Information ===\n');
    
    // Check what tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    console.log(tables.rows);
    
    // Check trips table structure
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'trips'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTrips table columns:');
    console.log(columns.rows);
    
    // Count records
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM trips`);
    console.log('\nTotal records in trips table:');
    console.log(count.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
