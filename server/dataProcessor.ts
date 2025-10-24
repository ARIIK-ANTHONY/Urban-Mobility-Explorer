/**
 * Data Processing Pipeline for NYC Taxi Trip Data
 * 
 * Handles:
 * - CSV file parsing
 * - Data cleaning (missing values, duplicates, outliers)
 * - Derived feature calculation
 * - Batch database insertion
 */

import fs from 'fs';
import csv from 'csv-parser';
import { db } from './db';
import { trips, type InsertTrip } from '@shared/schema';
import { calculateHaversineDistance, calculateSpeed } from './algorithms';

interface RawTripData {
  id: string;
  vendor_id: string;
  pickup_datetime: string;
  dropoff_datetime: string;
  passenger_count: string;
  pickup_longitude: string;
  pickup_latitude: string;
  dropoff_longitude: string;
  dropoff_latitude: string;
  store_and_fwd_flag: string;
  trip_duration: string;
}

interface ProcessingStats {
  totalRows: number;
  validRows: number;
  duplicates: number;
  missingValues: number;
  invalidCoordinates: number;
  outliers: number;
  inserted: number;
}

/**
 * Validate coordinates are within NYC bounds
 */
function isValidNYCCoordinate(lat: number, lon: number): boolean {
  // NYC approximate bounds
  const NYC_BOUNDS = {
    minLat: 40.4,
    maxLat: 41.0,
    minLon: -74.3,
    maxLon: -73.7,
  };

  return (
    lat >= NYC_BOUNDS.minLat &&
    lat <= NYC_BOUNDS.maxLat &&
    lon >= NYC_BOUNDS.minLon &&
    lon <= NYC_BOUNDS.maxLon
  );
}

/**
 * Detect and filter outliers based on domain knowledge
 */
function isOutlier(
  duration: number,
  distance: number,
  speed: number
): boolean {
  // Filter unrealistic values
  if (duration < 60 || duration > 3600 * 5) return true; // Less than 1 min or more than 5 hours
  if (distance < 0.1 || distance > 100) return true; // Less than 100m or more than 100km
  if (speed < 1 || speed > 100) return true; // Less than 1 km/h or more than 100 km/h

  return false;
}

/**
 * Process a single row of trip data
 */
function processRow(row: RawTripData): InsertTrip | null {
  try {
    // Parse and validate required fields
    const id = row.id?.trim();
    const vendorId = parseInt(row.vendor_id);
    const passengerCount = parseInt(row.passenger_count);
    const pickupLon = parseFloat(row.pickup_longitude);
    const pickupLat = parseFloat(row.pickup_latitude);
    const dropoffLon = parseFloat(row.dropoff_longitude);
    const dropoffLat = parseFloat(row.dropoff_latitude);
    const tripDuration = parseInt(row.trip_duration);
    const storeAndFwdFlag = row.store_and_fwd_flag?.trim();

    // Check for missing or invalid values
    if (
      !id ||
      isNaN(vendorId) ||
      isNaN(passengerCount) ||
      isNaN(pickupLon) ||
      isNaN(pickupLat) ||
      isNaN(dropoffLon) ||
      isNaN(dropoffLat) ||
      isNaN(tripDuration) ||
      !storeAndFwdFlag
    ) {
      return null;
    }

    // Validate coordinates
    if (
      !isValidNYCCoordinate(pickupLat, pickupLon) ||
      !isValidNYCCoordinate(dropoffLat, dropoffLon)
    ) {
      return null;
    }

    // Parse dates
    const pickupDatetime = new Date(row.pickup_datetime);
    const dropoffDatetime = new Date(row.dropoff_datetime);

    if (isNaN(pickupDatetime.getTime()) || isNaN(dropoffDatetime.getTime())) {
      return null;
    }

    // Calculate derived features
    const tripDistance = calculateHaversineDistance(
      pickupLat,
      pickupLon,
      dropoffLat,
      dropoffLon
    );

    const tripSpeed = calculateSpeed(tripDistance, tripDuration);

    // Check for outliers
    if (isOutlier(tripDuration, tripDistance, tripSpeed)) {
      return null;
    }

    // Extract temporal features
    const hourOfDay = pickupDatetime.getHours();
    const dayOfWeek = pickupDatetime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

    return {
      id,
      vendorId,
      pickupDatetime,
      dropoffDatetime,
      passengerCount,
      pickupLongitude: pickupLon,
      pickupLatitude: pickupLat,
      dropoffLongitude: dropoffLon,
      dropoffLatitude: dropoffLat,
      storeAndFwdFlag,
      tripDuration,
      tripSpeed,
      tripDistance,
      hourOfDay,
      dayOfWeek,
      isWeekend,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Process CSV file and insert into database
 */
export async function processCSVFile(
  filePath: string,
  batchSize = 1000
): Promise<ProcessingStats> {
  const stats: ProcessingStats = {
    totalRows: 0,
    validRows: 0,
    duplicates: 0,
    missingValues: 0,
    invalidCoordinates: 0,
    outliers: 0,
    inserted: 0,
  };

  const batch: InsertTrip[] = [];
  const seenIds = new Set<string>();

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: RawTripData) => {
        stats.totalRows++;

        // Check for duplicates
        if (seenIds.has(row.id)) {
          stats.duplicates++;
          return;
        }

        const processed = processRow(row);

        if (!processed) {
          stats.missingValues++;
          return;
        }

        seenIds.add(row.id);
        batch.push(processed);
        stats.validRows++;

        // Insert batch when it reaches batchSize
        if (batch.length >= batchSize) {
          const insertBatch = [...batch];
          batch.length = 0; // Clear batch

          db.insert(trips)
            .values(insertBatch)
            .then(() => {
              stats.inserted += insertBatch.length;
              console.log(`Inserted ${stats.inserted} trips...`);
            })
            .catch((error) => {
              console.error('Batch insert error:', error);
            });
        }
      })
      .on('end', async () => {
        // Insert remaining batch
        if (batch.length > 0) {
          try {
            await db.insert(trips).values(batch);
            stats.inserted += batch.length;
            console.log(`Inserted final batch of ${batch.length} trips`);
          } catch (error) {
            console.error('Final batch insert error:', error);
          }
        }

        console.log('\n=== Data Processing Complete ===');
        console.log(`Total rows processed: ${stats.totalRows}`);
        console.log(`Valid rows: ${stats.validRows}`);
        console.log(`Duplicates removed: ${stats.duplicates}`);
        console.log(`Invalid/missing data: ${stats.missingValues}`);
        console.log(`Successfully inserted: ${stats.inserted}`);

        resolve(stats);
      })
      .on('error', (error) => {
        console.error('CSV processing error:', error);
        reject(error);
      });
  });
}

/**
 * Sample a subset of data for faster development/testing
 */
export async function processSampleData(
  filePath: string,
  sampleSize = 10000,
  batchSize = 500
): Promise<ProcessingStats> {
  const stats: ProcessingStats = {
    totalRows: 0,
    validRows: 0,
    duplicates: 0,
    missingValues: 0,
    invalidCoordinates: 0,
    outliers: 0,
    inserted: 0,
  };

  const batch: InsertTrip[] = [];
  const seenIds = new Set<string>();

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row: RawTripData) => {
        if (stats.validRows >= sampleSize) {
          stream.pause();
          stream.destroy();
          return;
        }

        stats.totalRows++;

        if (seenIds.has(row.id)) {
          stats.duplicates++;
          return;
        }

        const processed = processRow(row);

        if (!processed) {
          stats.missingValues++;
          return;
        }

        seenIds.add(row.id);
        batch.push(processed);
        stats.validRows++;

        // Insert batch when it reaches batchSize
        if (batch.length >= batchSize) {
          stream.pause(); // Pause stream while inserting
          const insertBatch = [...batch];
          batch.length = 0;

          try {
            await db.insert(trips).values(insertBatch);
            stats.inserted += insertBatch.length;
            console.log(`Inserted ${stats.inserted} / ${sampleSize} trips...`);
            stream.resume(); // Resume stream after insert
          } catch (error) {
            console.error('Batch insert error:', error);
            stream.resume();
          }
        }
      })
      .on('end', async () => {
        // Insert remaining batch
        if (batch.length > 0) {
          try {
            await db.insert(trips).values(batch);
            stats.inserted += batch.length;
            console.log(`\nSample data processing complete: ${stats.inserted} trips inserted`);
          } catch (error) {
            console.error('Final batch insert error:', error);
          }
        }

        resolve(stats);
      })
      .on('error', reject);
  });
}
