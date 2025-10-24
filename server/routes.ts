import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tripFilterSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Get trips with filtering, sorting, and pagination
  app.get("/api/trips", async (req, res) => {
    try {
      // Parse and validate query parameters
      const filterParams = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        minDistance: req.query.minDistance ? parseFloat(req.query.minDistance as string) : undefined,
        maxDistance: req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : undefined,
        minDuration: req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined,
        maxDuration: req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined,
        minSpeed: req.query.minSpeed ? parseFloat(req.query.minSpeed as string) : undefined,
        maxSpeed: req.query.maxSpeed ? parseFloat(req.query.maxSpeed as string) : undefined,
        passengerCount: req.query.passengerCount ? parseInt(req.query.passengerCount as string) : undefined,
        hourOfDay: req.query.hourOfDay ? parseInt(req.query.hourOfDay as string) : undefined,
        isWeekend: req.query.isWeekend === 'true' ? true : req.query.isWeekend === 'false' ? false : undefined,
        pickupLatMin: req.query.pickupLatMin ? parseFloat(req.query.pickupLatMin as string) : undefined,
        pickupLatMax: req.query.pickupLatMax ? parseFloat(req.query.pickupLatMax as string) : undefined,
        pickupLonMin: req.query.pickupLonMin ? parseFloat(req.query.pickupLonMin as string) : undefined,
        pickupLonMax: req.query.pickupLonMax ? parseFloat(req.query.pickupLonMax as string) : undefined,
        dropoffLatMin: req.query.dropoffLatMin ? parseFloat(req.query.dropoffLatMin as string) : undefined,
        dropoffLatMax: req.query.dropoffLatMax ? parseFloat(req.query.dropoffLatMax as string) : undefined,
        dropoffLonMin: req.query.dropoffLonMin ? parseFloat(req.query.dropoffLonMin as string) : undefined,
        dropoffLonMax: req.query.dropoffLonMax ? parseFloat(req.query.dropoffLonMax as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: req.query.sortBy as 'pickupDatetime' | 'tripDuration' | 'tripDistance' | 'tripSpeed' | undefined,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const validatedFilter = tripFilterSchema.parse(filterParams);
      const result = await storage.getTrips(validatedFilter);
      
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid filter parameters", details: error.errors });
      } else {
        console.error("Error fetching trips:", error);
        res.status(500).json({ error: "Failed to fetch trips" });
      }
    }
  });

  // Get trip by ID
  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTripById(req.params.id);
      
      if (!trip) {
        res.status(404).json({ error: "Trip not found" });
        return;
      }
      
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });

  // Get insight data for visualizations
  app.get("/api/insights", async (req, res) => {
    try {
      const insights = await storage.getInsightData();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Export trips data as CSV
  app.get("/api/export", async (req, res) => {
    try {
      const filterParams = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        minDistance: req.query.minDistance ? parseFloat(req.query.minDistance as string) : undefined,
        maxDistance: req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : undefined,
        minDuration: req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined,
        maxDuration: req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined,
        limit: 10000, // Max export limit
        offset: 0,
        sortBy: 'pickupDatetime' as const,
        sortOrder: 'desc' as const,
      };

      const validatedFilter = tripFilterSchema.parse(filterParams);
      const { trips: exportData } = await storage.getTrips(validatedFilter);

      // Generate CSV
      const headers = [
        'ID',
        'Vendor ID',
        'Pickup Time',
        'Dropoff Time',
        'Passengers',
        'Pickup Lat',
        'Pickup Lon',
        'Dropoff Lat',
        'Dropoff Lon',
        'Trip Duration (s)',
        'Trip Distance (km)',
        'Trip Speed (km/h)',
        'Hour of Day',
        'Day of Week',
      ];

      const rows = exportData.map(trip => [
        trip.id,
        trip.vendorId,
        new Date(trip.pickupDatetime).toISOString(),
        new Date(trip.dropoffDatetime).toISOString(),
        trip.passengerCount,
        trip.pickupLatitude,
        trip.pickupLongitude,
        trip.dropoffLatitude,
        trip.dropoffLongitude,
        trip.tripDuration,
        trip.tripDistance?.toFixed(2),
        trip.tripSpeed?.toFixed(2),
        trip.hourOfDay,
        trip.dayOfWeek,
      ]);

      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="nyc-trips-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
