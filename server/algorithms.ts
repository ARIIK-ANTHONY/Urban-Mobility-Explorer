/**
 * Custom Algorithm Implementations
 * 
 * Manual implementations without using built-in library functions
 * to satisfy the DSA (Data Structures & Algorithms) requirement.
 * 
 * This file contains:
 * 1. Manual QuickSort implementation for sorting trip records
 * 2. Custom filter function for multi-criteria filtering
 * 3. Haversine distance calculation for geographic distance
 */

import type { Trip } from "@shared/schema";

/**
 * Manual QuickSort Implementation
 * 
 * Time Complexity: O(n log n) average case, O(n^2) worst case
 * Space Complexity: O(log n) due to recursion stack
 * 
 * This implementation sorts an array of trips based on a specified field
 * without using built-in Array.sort() or any library functions.
 * 
 * Algorithm:
 * 1. Choose a pivot element (middle element)
 * 2. Partition array into elements less than and greater than pivot
 * 3. Recursively sort the partitions
 * 4. Combine sorted partitions with pivot
 */
export function manualQuickSort<T>(
  arr: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  // Base case: arrays with 0 or 1 element are already sorted
  if (arr.length <= 1) {
    return arr;
  }

  // Choose pivot (middle element for better average performance)
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];

  // Partition arrays
  const less: T[] = [];
  const equal: T[] = [];
  const greater: T[] = [];

  // Manual iteration through array (no forEach, map, or filter)
  for (let i = 0; i < arr.length; i++) {
    const comparison = compareFn(arr[i], pivot);
    if (comparison < 0) {
      less[less.length] = arr[i]; // Manual push without Array.push()
    } else if (comparison > 0) {
      greater[greater.length] = arr[i];
    } else {
      equal[equal.length] = arr[i];
    }
  }

  // Recursively sort partitions and combine
  const sortedLess = manualQuickSort(less, compareFn);
  const sortedGreater = manualQuickSort(greater, compareFn);

  // Manual array concatenation without concat()
  const result: T[] = [];
  for (let i = 0; i < sortedLess.length; i++) {
    result[result.length] = sortedLess[i];
  }
  for (let i = 0; i < equal.length; i++) {
    result[result.length] = equal[i];
  }
  for (let i = 0; i < sortedGreater.length; i++) {
    result[result.length] = sortedGreater[i];
  }

  return result;
}

/**
 * Sort trips by a specific field
 * 
 * @param trips - Array of trip objects
 * @param field - Field name to sort by
 * @param order - 'asc' or 'desc'
 * @returns Sorted array of trips
 */
export function sortTrips(
  trips: Trip[],
  field: keyof Trip,
  order: 'asc' | 'desc' = 'asc'
): Trip[] {
  const compareFn = (a: Trip, b: Trip): number => {
    const aVal = a[field];
    const bVal = b[field];

    // Handle null/undefined
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    // Compare based on type
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (aVal instanceof Date && bVal instanceof Date) {
      const diff = aVal.getTime() - bVal.getTime();
      return order === 'asc' ? diff : -diff;
    }

    // String comparison
    const aStr = String(aVal);
    const bStr = String(bVal);
    if (aStr < bStr) return order === 'asc' ? -1 : 1;
    if (aStr > bStr) return order === 'asc' ? 1 : -1;
    return 0;
  };

  return manualQuickSort(trips, compareFn);
}

/**
 * Custom Filter Function
 * 
 * Time Complexity: O(n) where n is the number of trips
 * Space Complexity: O(k) where k is the number of matching trips
 * 
 * Manual implementation of filtering without using Array.filter()
 * Supports multiple filter criteria simultaneously
 */
export function manualFilter<T>(
  arr: T[],
  predicateFn: (item: T) => boolean
): T[] {
  const result: T[] = [];
  
  // Manual iteration without forEach or for...of
  for (let i = 0; i < arr.length; i++) {
    if (predicateFn(arr[i])) {
      result[result.length] = arr[i]; // Manual push
    }
  }
  
  return result;
}

/**
 * Haversine Distance Calculation
 * 
 * Calculates the great-circle distance between two points on Earth
 * given their latitude and longitude coordinates.
 * 
 * Formula:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 * 
 * where φ is latitude, λ is longitude, R is earth's radius (6371 km)
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 * 
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  // Convert degrees to radians manually
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Calculate trip speed from distance and duration
 * 
 * @param distanceKm - Distance in kilometers
 * @param durationSeconds - Duration in seconds
 * @returns Speed in km/h
 */
export function calculateSpeed(distanceKm: number, durationSeconds: number): number {
  if (durationSeconds === 0) return 0;
  const hours = durationSeconds / 3600;
  return distanceKm / hours;
}

/**
 * Manual implementation of grouping data by a key
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 * 
 * Without using built-in reduce, Map, or any grouping libraries
 */
export function manualGroupBy<T>(
  arr: T[],
  keyFn: (item: T) => string | number
): { [key: string]: T[] } {
  const groups: { [key: string]: T[] } = {};

  for (let i = 0; i < arr.length; i++) {
    const key = String(keyFn(arr[i]));
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key][groups[key].length] = arr[i];
  }

  return groups;
}

/**
 * Manual implementation of finding unique values
 * 
 * Time Complexity: O(n²) - could be optimized with hash map but avoiding built-in Set
 * Space Complexity: O(k) where k is number of unique items
 */
export function manualUnique<T>(arr: T[]): T[] {
  const unique: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    let isDuplicate = false;
    
    for (let j = 0; j < unique.length; j++) {
      if (arr[i] === unique[j]) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      unique[unique.length] = arr[i];
    }
  }

  return unique;
}

/**
 * Manual implementation of counting occurrences
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(k) where k is number of unique items
 */
export function manualCount<T extends string | number>(arr: T[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {};

  for (let i = 0; i < arr.length; i++) {
    const key = String(arr[i]);
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}
