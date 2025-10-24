import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterPanel } from "@/components/FilterPanel";
import { DataTable } from "@/components/DataTable";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Trip } from "@shared/schema";

export default function DataExplorer() {
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('pickupDatetime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 50;

  // Clean filters - remove undefined/empty values
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = String(value);
    }
    return acc;
  }, {} as Record<string, string>);

  const queryParams = new URLSearchParams({
    ...cleanFilters,
    limit: String(pageSize),
    offset: String((currentPage - 1) * pageSize),
    sortBy,
    sortOrder,
  });

  const { data, isLoading, error } = useQuery<{ trips: Trip[]; total: number }>({
    queryKey: ['/api/trips', queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/trips?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      return response.json();
    },
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const handleExport = () => {
    // Clean filters - remove undefined/empty values
    const cleanExportFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>);
    
    const exportParams = new URLSearchParams(cleanExportFilters);
    window.open(`/api/export?${exportParams}`, '_blank');
  };

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Data Explorer</h1>
            <p className="text-muted-foreground">
              Filter, sort, and explore individual taxi trip records
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2" data-testid="button-export">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <FilterPanel onFilterChange={handleFilterChange} onReset={handleReset} />
          </div>
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <TableSkeleton rows={10} />
          ) : error ? (
            <EmptyState
              type="error"
              title="Failed to load trips"
              description="There was an error loading the trip data. Please try again later."
              action={{
                label: "Retry",
                onClick: () => window.location.reload(),
              }}
            />
          ) : !data || data.trips.length === 0 ? (
            <EmptyState
              type="no-results"
              title="No trips found"
              description="Try adjusting your filters to see more results."
              action={{
                label: "Reset Filters",
                onClick: handleReset,
              }}
            />
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.total)} of {data.total.toLocaleString()} trips
                </p>
              </div>
              <DataTable
                trips={data.trips}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onSort={handleSort}
                sortField={sortBy}
                sortOrder={sortOrder}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
