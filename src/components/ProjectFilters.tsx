import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, ArrowUp, ArrowDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale/th";

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFilter: Date | undefined;
  onDateFilterChange: (date: Date | undefined) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  sortBy,
  onSortChange,
}: ProjectFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาโปรเจค..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={dateFilter ? "secondary" : "outline"}
              className={cn(
                "justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateFilter ? (
                format(dateFilter, "PPP", { locale: th })
              ) : (
                "เลือกวันที่"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateFilter}
              onSelect={onDateFilterChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Select
        value={sortBy}
        onValueChange={onSortChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="เรียงลำดับตาม..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nameAsc">
            <div className="flex items-center">
              ชื่อ <ArrowUp className="ml-2 h-4 w-4" />
            </div>
          </SelectItem>
          <SelectItem value="nameDesc">
            <div className="flex items-center">
              ชื่อ <ArrowDown className="ml-2 h-4 w-4" />
            </div>
          </SelectItem>
          <SelectItem value="dateAsc">
            <div className="flex items-center">
              วันที่สร้าง <ArrowUp className="ml-2 h-4 w-4" />
            </div>
          </SelectItem>
          <SelectItem value="dateDesc">
            <div className="flex items-center">
              วันที่สร้าง <ArrowDown className="ml-2 h-4 w-4" />
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
