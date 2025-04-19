
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Badge } from "./ui/badge";

interface ProjectFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: "all" | "today" | "week" | "month";
  setDateFilter: (filter: "all" | "today" | "week" | "month") => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  onClearFilters: () => void;
}

export function ProjectFilters({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onClearFilters,
}: ProjectFiltersProps) {
  const activeFiltersCount = [
    dateFilter !== "all",
    sortBy !== "name" || sortOrder !== "asc",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
      <div className="flex gap-2">
        <Input
          className="md:w-[200px]"
          placeholder="ค้นหาโปรเจค..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span>ตัวกรอง</span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">วันที่สร้าง</h4>
                <Select
                  value={dateFilter}
                  onValueChange={(val: any) => setDateFilter(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกช่วงเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="today">วันนี้</SelectItem>
                    <SelectItem value="week">7 วันที่ผ่านมา</SelectItem>
                    <SelectItem value="month">30 วันที่ผ่านมา</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">เรียงตาม</h4>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เรียงตาม" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">ชื่อ</SelectItem>
                      <SelectItem value="date">วันที่สร้าง</SelectItem>
                      <SelectItem value="jobs">จำนวนงาน</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortOrder}
                    onValueChange={(val: any) => setSortOrder(val)}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="ลำดับ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">A-Z</SelectItem>
                      <SelectItem value="desc">Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={onClearFilters}
              >
                ล้างตัวกรอง
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
