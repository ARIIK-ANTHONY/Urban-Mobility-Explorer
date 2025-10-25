// Based on javascript_database blueprint with custom trip operations
import { trips, type Trip, type InsertTrip, type TripFilter, type DashboardStats, type HourlyDistribution, type DayDistribution, type InsightData } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { sortTrips, manualFilter } from "./algorithms";

export interface IStorage {
  // Trip operations
  createTrip(trip: InsertTrip): Promise<Trip>;
  createTrips(trips: InsertTrip[]): Promise<Trip[]>;
  getTrips(filter: TripFilter): Promise<{ trips: Trip[]; total: number }>;
  getTripById(id: string): Promise<Trip | undefined>;
  
  // Analytics operations
  getDashboardStats(): Promise<DashboardStats>;
  getInsightData(): Promise<InsightData>;
}

export class DatabaseStorage implements IStorage {
  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db
      .insert(trips)
      .values(insertTrip)
      .returning();
    return trip;
  }

  async createTrips(insertTrips: InsertTrip[]): Promise<Trip[]> {
    const result = await db
      .insert(trips)
      .values(insertTrips)
      .returning();
    return result;
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async getTrips(filter: TripFilter): Promise<{ trips: Trip[]; total: number }> {
    const conditions = [];

    // Build query conditions
    if (filter.startDate) {
      conditions.push(gte(trips.pickupDatetime, new Date(filter.startDate)));
    }
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      conditions.push(lte(trips.pickupDatetime, endDate));
    }
    if (filter.minDistance !== undefined) {
      conditions.push(gte(trips.tripDistance, filter.minDistance));
    }
    if (filter.maxDistance !== undefined) {
      conditions.push(lte(trips.tripDistance, filter.maxDistance));
    }
    if (filter.minDuration !== undefined) {
      conditions.push(gte(trips.tripDuration, filter.minDuration));
    }
    if (filter.maxDuration !== undefined) {
      conditions.push(lte(trips.tripDuration, filter.maxDuration));
    }
    if (filter.minSpeed !== undefined) {
      conditions.push(gte(trips.tripSpeed, filter.minSpeed));
    }
    if (filter.maxSpeed !== undefined) {
      conditions.push(lte(trips.tripSpeed, filter.maxSpeed));
    }
    if (filter.passengerCount !== undefined) {
      conditions.push(eq(trips.passengerCount, filter.passengerCount));
    }
    if (filter.hourOfDay !== undefined) {
      conditions.push(eq(trips.hourOfDay, filter.hourOfDay));
    }
    if (filter.isWeekend !== undefined) {
      conditions.push(eq(trips.isWeekend, filter.isWeekend ? 1 : 0));
    }
    // Geographic filters
    if (filter.pickupLatMin !== undefined) {
      conditions.push(gte(trips.pickupLatitude, filter.pickupLatMin));
    }
    if (filter.pickupLatMax !== undefined) {
      conditions.push(lte(trips.pickupLatitude, filter.pickupLatMax));
    }
    if (filter.pickupLonMin !== undefined) {
      conditions.push(gte(trips.pickupLongitude, filter.pickupLonMin));
    }
    if (filter.pickupLonMax !== undefined) {
      conditions.push(lte(trips.pickupLongitude, filter.pickupLonMax));
    }
    if (filter.dropoffLatMin !== undefined) {
      conditions.push(gte(trips.dropoffLatitude, filter.dropoffLatMin));
    }
    if (filter.dropoffLatMax !== undefined) {
      conditions.push(lte(trips.dropoffLatitude, filter.dropoffLatMax));
    }
    if (filter.dropoffLonMin !== undefined) {
      conditions.push(gte(trips.dropoffLongitude, filter.dropoffLonMin));
    }
    if (filter.dropoffLonMax !== undefined) {
      conditions.push(lte(trips.dropoffLongitude, filter.dropoffLonMax));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trips)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    // Build order clause based on sortBy and sortOrder
    const orderByClause = filter.sortBy
      ? filter.sortOrder === 'asc'
        ? asc(trips[filter.sortBy])
        : desc(trips[filter.sortBy])
      : desc(trips.pickupDatetime);

    // Get paginated trips
    const tripsData = await db
      .select()
      .from(trips)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(filter.limit)
      .offset(filter.offset);

    return { trips: tripsData, total };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [stats] = await db
      .select({
        totalTrips: sql<number>`count(*)`,
        avgDuration: sql<number>`avg(${trips.tripDuration})`,
        avgDistance: sql<number>`avg(${trips.tripDistance})`,
        avgSpeed: sql<number>`avg(${trips.tripSpeed})`,
        totalDistance: sql<number>`sum(${trips.tripDistance})`,
        avgPassengers: sql<number>`avg(${trips.passengerCount})`,
      })
      .from(trips);

    return {
      totalTrips: Number(stats?.totalTrips || 0),
      avgDuration: Number(stats?.avgDuration || 0),
      avgDistance: Number(stats?.avgDistance || 0),
      avgSpeed: Number(stats?.avgSpeed || 0),
      totalDistance: Number(stats?.totalDistance || 0),
      avgPassengers: Number(stats?.avgPassengers || 0),
    };
  }

  async getInsightData(): Promise<InsightData> {
    // Hourly distribution
    const hourlyData = await db
      .select({
        hour: trips.hourOfDay,
        tripCount: sql<number>`count(*)`,
        avgDuration: sql<number>`avg(${trips.tripDuration})`,
        avgDistance: sql<number>`avg(${trips.tripDistance})`,
      })
      .from(trips)
      .groupBy(trips.hourOfDay)
      .orderBy(asc(trips.hourOfDay));

    const hourlyDistribution: HourlyDistribution[] = hourlyData.map((row) => ({
      hour: Number(row.hour || 0),
      tripCount: Number(row.tripCount || 0),
      avgDuration: Number(row.avgDuration || 0),
      avgDistance: Number(row.avgDistance || 0),
    }));

    // Day of week distribution
    const dayData = await db
      .select({
        day: trips.dayOfWeek,
        tripCount: sql<number>`count(*)`,
        avgDuration: sql<number>`avg(${trips.tripDuration})`,
      })
      .from(trips)
      .groupBy(trips.dayOfWeek)
      .orderBy(asc(trips.dayOfWeek));

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayDistribution: DayDistribution[] = dayData.map((row) => ({
      day: Number(row.day || 0),
      dayName: dayNames[Number(row.day || 0)],
      tripCount: Number(row.tripCount || 0),
      avgDuration: Number(row.avgDuration || 0),
    }));

    // Speed distribution
    const speedData = await db
      .select({
        speed: trips.tripSpeed,
      })
      .from(trips)
      .limit(10000); // Sample for distribution

    // Group speeds into ranges manually
    const speedRanges: { [key: string]: number } = {
      '0-10 km/h': 0,
      '10-20 km/h': 0,
      '20-30 km/h': 0,
      '30-40 km/h': 0,
      '40-50 km/h': 0,
      '50+ km/h': 0,
    };

    speedData.forEach((row) => {
      const speed = row.speed || 0;
      if (speed < 10) speedRanges['0-10 km/h']++;
      else if (speed < 20) speedRanges['10-20 km/h']++;
      else if (speed < 30) speedRanges['20-30 km/h']++;
      else if (speed < 40) speedRanges['30-40 km/h']++;
      else if (speed < 50) speedRanges['40-50 km/h']++;
      else speedRanges['50+ km/h']++;
    });

    const speedDistribution = Object.entries(speedRanges).map(([range, count]) => ({
      speedRange: range,
      tripCount: count,
    }));

    // Peak hours
    const peakHours = hourlyDistribution
      .map((h) => ({ hour: h.hour, tripCount: h.tripCount }))
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 5);

    // Distance vs Duration (sample for scatter plot)
    const scatterData = await db
      .select({
        distance: trips.tripDistance,
        duration: trips.tripDuration,
        speed: trips.tripSpeed,
      })
      .from(trips)
      .limit(1000);

    const distanceVsDuration = scatterData.map((row) => ({
      distance: Number(row.distance || 0),
      duration: Number(row.duration || 0) / 60, // Convert to minutes
      speed: Number(row.speed || 0),
    }));

    // Top pickup locations (cluster nearby coordinates)
    const pickupData = await db
      .select({
        latitude: trips.pickupLatitude,
        longitude: trips.pickupLongitude,
      })
      .from(trips)
      .limit(5000);

    // Simple grid-based clustering (0.01 degree = ~1km)
    const locationClusters: { [key: string]: number } = {};
    pickupData.forEach((row) => {
      const lat = Number(row.latitude || 0);
      const lon = Number(row.longitude || 0);
      // Round to 2 decimal places for clustering
      const clusterKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
      locationClusters[clusterKey] = (locationClusters[clusterKey] || 0) + 1;
    });

    // Get top 10 pickup locations
    const topPickupLocations = Object.entries(locationClusters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => {
        const [lat, lon] = key.split(',').map(Number);
        return {
          latitude: lat,
          longitude: lon,
          tripCount: count,
        };
      });

    // Speed vs Distance correlation (grouped data)
    const speedDistanceData = await db
      .select({
        speed: trips.tripSpeed,
        distance: trips.tripDistance,
      })
      .from(trips)
      .limit(2000);

    // Group into buckets for better visualization
    const speedDistanceGroups: { [key: string]: number } = {};
    speedDistanceData.forEach((row) => {
      const speed = Math.floor(Number(row.speed || 0) / 5) * 5; // 5 km/h buckets
      const distance = Math.floor(Number(row.distance || 0) / 2) * 2; // 2 km buckets
      const key = `${speed},${distance}`;
      speedDistanceGroups[key] = (speedDistanceGroups[key] || 0) + 1;
    });

    const speedDistanceCorrelation = Object.entries(speedDistanceGroups)
      .map(([key, count]) => {
        const [speed, distance] = key.split(',').map(Number);
        return { speed, distance, tripCount: count };
      })
      .filter(item => item.tripCount > 2); // Filter out noise

    return {
      hourlyDistribution,
      dayDistribution,
      speedDistribution,
      peakHours,
      distanceVsDuration,
      topPickupLocations,
      speedDistanceCorrelation,
    };
  }
}

export const storage = new DatabaseStorage();
