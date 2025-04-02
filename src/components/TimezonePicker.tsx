
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimezonePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimezonePicker({ value, onChange }: TimezonePickerProps) {
  const [timezones, setTimezones] = useState<string[]>([]);
  
  useEffect(() => {
    // ใช้รายการ timezone แบบ static เพื่อความเข้ากันได้กับทุกเบราว์เซอร์
    const commonTimezones = [
      "UTC",
      "Asia/Bangkok",
      "Asia/Tokyo",
      "Asia/Singapore",
      "Asia/Shanghai",
      "Asia/Kolkata",
      "Asia/Dubai",
      "Asia/Tehran",
      "Europe/Moscow",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Africa/Cairo",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Sao_Paulo",
      "Australia/Sydney",
      "Pacific/Auckland"
    ];
    setTimezones(commonTimezones);
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="เลือก Timezone" />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[200px]">
          {timezones.map((zone) => (
            <SelectItem key={zone} value={zone}>
              {zone}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
