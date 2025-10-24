import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

export function FilterPanel({ onFilterChange, onReset }: FilterPanelProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [minDistance, setMinDistance] = useState<string>("");
  const [maxDistance, setMaxDistance] = useState<string>("");
  const [minDuration, setMinDuration] = useState<string>("");
  const [maxDuration, setMaxDuration] = useState<string>("");
  const [passengerCount, setPassengerCount] = useState<string>("all");
  const [hourOfDay, setHourOfDay] = useState<string>("all");
  const [pickupLatMin, setPickupLatMin] = useState<string>("");
  const [pickupLatMax, setPickupLatMax] = useState<string>("");
  const [pickupLonMin, setPickupLonMin] = useState<string>("");
  const [pickupLonMax, setPickupLonMax] = useState<string>("");
  const [dropoffLatMin, setDropoffLatMin] = useState<string>("");
  const [dropoffLatMax, setDropoffLatMax] = useState<string>("");
  const [dropoffLonMin, setDropoffLonMin] = useState<string>("");
  const [dropoffLonMax, setDropoffLonMax] = useState<string>("");

  const handleApplyFilters = () => {
    onFilterChange({
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      minDistance: minDistance ? parseFloat(minDistance) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      minDuration: minDuration ? parseInt(minDuration) * 60 : undefined,
      maxDuration: maxDuration ? parseInt(maxDuration) * 60 : undefined,
      passengerCount: passengerCount !== "all" ? parseInt(passengerCount) : undefined,
      hourOfDay: hourOfDay !== "all" ? parseInt(hourOfDay) : undefined,
      pickupLatMin: pickupLatMin ? parseFloat(pickupLatMin) : undefined,
      pickupLatMax: pickupLatMax ? parseFloat(pickupLatMax) : undefined,
      pickupLonMin: pickupLonMin ? parseFloat(pickupLonMin) : undefined,
      pickupLonMax: pickupLonMax ? parseFloat(pickupLonMax) : undefined,
      dropoffLatMin: dropoffLatMin ? parseFloat(dropoffLatMin) : undefined,
      dropoffLatMax: dropoffLatMax ? parseFloat(dropoffLatMax) : undefined,
      dropoffLonMin: dropoffLonMin ? parseFloat(dropoffLonMin) : undefined,
      dropoffLonMax: dropoffLonMax ? parseFloat(dropoffLonMax) : undefined,
    });
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setMinDistance("");
    setMaxDistance("");
    setMinDuration("");
    setMaxDuration("");
    setPassengerCount("all");
    setHourOfDay("all");
    setPickupLatMin("");
    setPickupLatMax("");
    setPickupLonMin("");
    setPickupLonMax("");
    setDropoffLatMin("");
    setDropoffLatMax("");
    setDropoffLonMin("");
    setDropoffLonMax("");
    onReset();
  };

  return (
    <Card data-testid="filter-panel">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            data-testid="button-reset-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                  data-testid="button-start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                  data-testid="button-end-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Trip Distance (km)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={minDistance}
                onChange={(e) => setMinDistance(e.target.value)}
                data-testid="input-min-distance"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                data-testid="input-max-distance"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Trip Duration (minutes)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                data-testid="input-min-duration"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                data-testid="input-max-duration"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Passenger Count</Label>
          <Select value={passengerCount} onValueChange={setPassengerCount}>
            <SelectTrigger data-testid="select-passenger-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Hour of Day</Label>
          <Select value={hourOfDay} onValueChange={setHourOfDay}>
            <SelectTrigger data-testid="select-hour">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hours</SelectItem>
              {Array.from({ length: 24 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {i.toString().padStart(2, '0')}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Pickup Location (NYC Bounds)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Lat Min</Label>
              <Input
                type="number"
                placeholder="40.4"
                step="0.01"
                value={pickupLatMin}
                onChange={(e) => setPickupLatMin(e.target.value)}
                data-testid="input-pickup-lat-min"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lat Max</Label>
              <Input
                type="number"
                placeholder="41.0"
                step="0.01"
                value={pickupLatMax}
                onChange={(e) => setPickupLatMax(e.target.value)}
                data-testid="input-pickup-lat-max"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lon Min</Label>
              <Input
                type="number"
                placeholder="-74.3"
                step="0.01"
                value={pickupLonMin}
                onChange={(e) => setPickupLonMin(e.target.value)}
                data-testid="input-pickup-lon-min"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lon Max</Label>
              <Input
                type="number"
                placeholder="-73.7"
                step="0.01"
                value={pickupLonMax}
                onChange={(e) => setPickupLonMax(e.target.value)}
                data-testid="input-pickup-lon-max"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Dropoff Location (NYC Bounds)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Lat Min</Label>
              <Input
                type="number"
                placeholder="40.4"
                step="0.01"
                value={dropoffLatMin}
                onChange={(e) => setDropoffLatMin(e.target.value)}
                data-testid="input-dropoff-lat-min"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lat Max</Label>
              <Input
                type="number"
                placeholder="41.0"
                step="0.01"
                value={dropoffLatMax}
                onChange={(e) => setDropoffLatMax(e.target.value)}
                data-testid="input-dropoff-lat-max"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lon Min</Label>
              <Input
                type="number"
                placeholder="-74.3"
                step="0.01"
                value={dropoffLonMin}
                onChange={(e) => setDropoffLonMin(e.target.value)}
                data-testid="input-dropoff-lon-min"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lon Max</Label>
              <Input
                type="number"
                placeholder="-73.7"
                step="0.01"
                value={dropoffLonMax}
                onChange={(e) => setDropoffLonMax(e.target.value)}
                data-testid="input-dropoff-lon-max"
              />
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleApplyFilters}
          data-testid="button-apply-filters"
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
