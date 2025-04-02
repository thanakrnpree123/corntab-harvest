
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
    // Get a list of all supported timezones
    try {
      const zones = Intl.supportedValuesOf('timeZone');
      setTimezones(zones);
    } catch (e) {
      // Fallback for browsers that don't support Intl.supportedValuesOf
      setTimezones([
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Asia/Kolkata",
        "Australia/Sydney",
        "Pacific/Auckland"
      ]);
    }
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Timezone" />
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
