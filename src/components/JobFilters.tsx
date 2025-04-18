
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobStatus } from "@/lib/types";

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: JobStatus | "all";
  onStatusFilterChange: (value: JobStatus | "all") => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  dateFilter: "today" | "week" | "month" | "all";
  onDateFilterChange: (value: "today" | "week" | "month" | "all") => void;
  onClearFilters: () => void;
}

export function JobFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  dateFilter,
  onDateFilterChange,
  onClearFilters,
}: JobFiltersProps) {
  const activeFiltersCount = [
    statusFilter !== "all",
    dateFilter !== "all",
    sortBy !== "name" || sortOrder !== "asc",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 space-y-2 md:space-y-0">
      <div className="flex gap-2">
        <Input
          className="md:w-[200px]"
          placeholder="ค้นหางาน..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
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
                <h4 className="font-medium text-sm">สถานะ</h4>
                <Select
                  value={statusFilter}
                  onValueChange={onStatusFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="idle">ว่าง</SelectItem>
                    <SelectItem value="running">กำลังทำงาน</SelectItem>
                    <SelectItem value="success">สำเร็จ</SelectItem>
                    <SelectItem value="failed">ล้มเหลว</SelectItem>
                    <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">วันที่สร้าง</h4>
                <Select value={dateFilter} onValueChange={onDateFilterChange}>
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

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">เรียงตาม</h4>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เรียงตาม" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">ชื่อ</SelectItem>
                      <SelectItem value="status">สถานะ</SelectItem>
                      <SelectItem value="date">วันที่สร้าง</SelectItem>
                      <SelectItem value="lastRun">รันล่าสุด</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={onSortOrderChange}>
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
