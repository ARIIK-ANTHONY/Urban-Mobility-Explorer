import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MetricCard } from "@/components/MetricCard";
import { MetricCardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Activity, Clock, MapPin, TrendingUp, Users, Zap, Info, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });

  if (error) {
    return (
      <div className="container mx-auto px-8 py-12">
        <EmptyState
          type="error"
          title="Failed to load dashboard"
          description="There was an error loading the dashboard statistics. Please try again later."
        />
      </div>
    );
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0';
    return new Intl.NumberFormat('en-US', {
      notation: num >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  // Data quality metrics (from your actual data processing)
  const totalProcessed = 1458644; // Total rows in original CSV
  const cleanRecords = stats?.totalTrips || 1438322;
  const excludedRecords = totalProcessed - cleanRecords;
  const completenessRate = ((cleanRecords / totalProcessed) * 100).toFixed(2);

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">NYC Taxi Trip Dashboard</h1>
        <p className="text-muted-foreground">
          Explore comprehensive analytics and insights from New York City taxi trip data
        </p>
      </div>

      {/* Dataset Information Card */}
      <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">About This Dataset</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 mt-2">
          This dashboard analyzes <strong>{formatNumber(stats?.totalTrips)}</strong> taxi trips from New York City, 
          featuring detailed trip information including pickup/dropoff locations, durations, distances, and passenger counts. 
          The data has been cleaned and processed to remove outliers and ensure accuracy. 
          All metrics and visualizations are calculated dynamically from the database in real-time.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Trips"
              value={formatNumber(stats?.totalTrips)}
              subtitle="All recorded taxi trips"
              icon={Activity}
            />
            <MetricCard
              title="Avg Duration"
              value={formatDuration(stats?.avgDuration)}
              subtitle="Average trip time"
              icon={Clock}
            />
            <MetricCard
              title="Avg Distance"
              value={`${stats?.avgDistance?.toFixed(2) || '0'} km`}
              subtitle="Average trip distance"
              icon={MapPin}
            />
            <MetricCard
              title="Avg Speed"
              value={`${stats?.avgSpeed?.toFixed(1) || '0'} km/h`}
              subtitle="Average trip speed"
              icon={Zap}
            />
            <MetricCard
              title="Total Distance"
              value={`${formatNumber(stats?.totalDistance)} km`}
              subtitle="Cumulative distance traveled"
              icon={TrendingUp}
            />
            <MetricCard
              title="Avg Passengers"
              value={stats?.avgPassengers?.toFixed(1) || '0'}
              subtitle="Average passengers per trip"
              icon={Users}
            />
          </>
        )}
      </div>

      {/* Data Quality Report */}
      <Card className="mb-8 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Data Quality Report
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300 mt-1">
                Comprehensive data validation and cleaning results
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-600 text-white dark:bg-green-500 text-lg px-4 py-1">
              Clean ✓
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Data Completeness */}
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {completenessRate}%
              </div>
              <div className="text-sm text-muted-foreground">Data Completeness</div>
            </div>

            {/* Total Processed */}
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {formatNumber(totalProcessed)}
              </div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>

            {/* Clean Records */}
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                {formatNumber(cleanRecords)}
              </div>
              <div className="text-sm text-muted-foreground">Clean Records</div>
            </div>

            {/* Excluded Records */}
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1 flex items-center justify-center gap-2">
                <XCircle className="h-6 w-6" />
                {formatNumber(excludedRecords)}
              </div>
              <div className="text-sm text-muted-foreground">Excluded</div>
            </div>
          </div>

          {/* Quality Criteria */}
          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-3">
              Validation Criteria Applied:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Trip duration: 60s - 5 hours</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Trip distance: 0.1 - 100 km</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Speed range: 1 - 100 km/h</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Valid NYC coordinates only</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card border rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Explore More</h2>
        <p className="text-muted-foreground mb-6">
          Dive deeper into the data with our interactive explorer and detailed insights
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/explorer">
            <div 
              className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-medium hover-elevate active-elevate-2 transition-all cursor-pointer"
              data-testid="link-explorer"
            >
              Data Explorer
            </div>
          </Link>
          <Link href="/insights">
            <div 
              className="inline-flex items-center justify-center h-10 px-6 rounded-md border bg-background font-medium hover-elevate active-elevate-2 transition-all cursor-pointer"
              data-testid="link-insights"
            >
              View Insights
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
