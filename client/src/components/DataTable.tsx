import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { Trip } from "@shared/schema";

interface DataTableProps {
  trips: Trip[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSort: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export function DataTable({ 
  trips, 
  currentPage, 
  totalPages, 
  onPageChange, 
  onSort,
  sortField,
  sortOrder 
}: DataTableProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const SortableHeader = ({ field, label }: { field: string; label: string }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 font-medium hover-elevate"
        onClick={() => onSort(field)}
        data-testid={`sort-${field}`}
      >
        {label}
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <SortableHeader field="pickupDatetime" label="Pickup Time" />
                  <TableHead>Dropoff Time</TableHead>
                  <SortableHeader field="tripDistance" label="Distance" />
                  <SortableHeader field="tripDuration" label="Duration" />
                  <SortableHeader field="tripSpeed" label="Speed" />
                  <TableHead>Passengers</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No trips found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  trips.map((trip, index) => (
                    <TableRow 
                      key={trip.id} 
                      className="hover-elevate"
                      data-testid={`row-trip-${index}`}
                    >
                      <TableCell className="font-mono text-xs" data-testid={`text-id-${index}`}>
                        {trip.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(trip.pickupDatetime), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(trip.dropoffDatetime), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono">
                        {trip.tripDistance?.toFixed(2)} km
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatDuration(trip.tripDuration)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {trip.tripSpeed?.toFixed(1)} km/h
                      </TableCell>
                      <TableCell>{trip.passengerCount}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {trip.pickupLatitude.toFixed(4)}, {trip.pickupLongitude.toFixed(4)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
