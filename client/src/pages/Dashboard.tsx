import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MetricCard } from "@/components/MetricCard";
import { MetricCardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Activity, Clock, MapPin, TrendingUp, Users, Zap } from "lucide-react";
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

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">NYC Taxi Trip Dashboard</h1>
        <p className="text-muted-foreground">
          Explore comprehensive analytics and insights from New York City taxi trip data
        </p>
      </div>

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
