import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// NYC Taxi Trip Data Schema
// Based on the NYC Taxi Trip Dataset with derived features
export const trips = pgTable("trips", {
  id: varchar("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  pickupDatetime: timestamp("pickup_datetime").notNull(),
  dropoffDatetime: timestamp("dropoff_datetime").notNull(),
  passengerCount: integer("passenger_count").notNull(),
  pickupLongitude: real("pickup_longitude").notNull(),
  pickupLatitude: real("pickup_latitude").notNull(),
  dropoffLongitude: real("dropoff_longitude").notNull(),
  dropoffLatitude: real("dropoff_latitude").notNull(),
  storeAndFwdFlag: varchar("store_and_fwd_flag", { length: 1 }).notNull(),
  tripDuration: integer("trip_duration").notNull(), // in seconds
  
  // Derived features (calculated during data processing)
  tripSpeed: real("trip_speed"), // km/h - calculated from distance and duration
  tripDistance: real("trip_distance"), // km - calculated from coordinates
  hourOfDay: integer("hour_of_day"), // 0-23 - extracted from pickup_datetime
  dayOfWeek: integer("day_of_week"), // 0-6 - extracted from pickup_datetime
  isWeekend: integer("is_weekend"), // 0 or 1 - boolean flag
}, (table) => ({
  // Indexes for efficient querying
  pickupDatetimeIdx: index("pickup_datetime_idx").on(table.pickupDatetime),
  tripDurationIdx: index("trip_duration_idx").on(table.tripDuration),
  tripDistanceIdx: index("trip_distance_idx").on(table.tripDistance),
  hourOfDayIdx: index("hour_of_day_idx").on(table.hourOfDay),
  pickupLocationIdx: index("pickup_location_idx").on(table.pickupLatitude, table.pickupLongitude),
}));

// Insert schema for trips (excludes derived features that are calculated)
export const insertTripSchema = createInsertSchema(trips).omit({
  tripSpeed: true,
  tripDistance: true,
  hourOfDay: true,
  dayOfWeek: true,
  isWeekend: true,
});

// Select schema for trips
export const selectTripSchema = createSelectSchema(trips);

// Types
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// Filter schema for API queries
export const tripFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minDistance: z.number().optional(),
  maxDistance: z.number().optional(),
  minDuration: z.number().optional(),
  maxDuration: z.number().optional(),
  minSpeed: z.number().optional(),
  maxSpeed: z.number().optional(),
  passengerCount: z.number().optional(),
  hourOfDay: z.number().min(0).max(23).optional(),
  isWeekend: z.boolean().optional(),
  // Geographic filters
  pickupLatMin: z.number().optional(),
  pickupLatMax: z.number().optional(),
  pickupLonMin: z.number().optional(),
  pickupLonMax: z.number().optional(),
  dropoffLatMin: z.number().optional(),
  dropoffLatMax: z.number().optional(),
  dropoffLonMin: z.number().optional(),
  dropoffLonMax: z.number().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['pickupDatetime', 'tripDuration', 'tripDistance', 'tripSpeed']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TripFilter = z.infer<typeof tripFilterSchema>;

// Stats response types
export type DashboardStats = {
  totalTrips: number;
  avgDuration: number; // in seconds
  avgDistance: number; // in km
  avgSpeed: number; // in km/h
  totalDistance: number; // in km
  avgPassengers: number;
};

export type HourlyDistribution = {
  hour: number;
  tripCount: number;
  avgDuration: number;
  avgDistance: number;
};

export type DayDistribution = {
  day: number;
  dayName: string;
  tripCount: number;
  avgDuration: number;
};

export type SpeedDistribution = {
  speedRange: string;
  tripCount: number;
};

export type PickupLocation = {
  latitude: number;
  longitude: number;
  tripCount: number;
  locationName?: string;
};

export type SpeedDistanceCorrelation = {
  speed: number;
  distance: number;
  tripCount: number;
};

export type InsightData = {
  hourlyDistribution: HourlyDistribution[];
  dayDistribution: DayDistribution[];
  speedDistribution: SpeedDistribution[];
  peakHours: { hour: number; tripCount: number }[];
  distanceVsDuration: { distance: number; duration: number; speed: number }[];
  topPickupLocations: PickupLocation[];
  speedDistanceCorrelation: SpeedDistanceCorrelation[];
};
