
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTranslation } from 'react-i18next';

interface ScheduleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ScheduleSelector({ value, onChange }: ScheduleSelectorProps) {
  const { t } = useTranslation();
  const [scheduleType, setScheduleType] = React.useState('minutes');
  const [scheduleValues, setScheduleValues] = React.useState({
    minutes: '15',
    hour: '0',
    minute: '0',
    day: '1',
    month: '1'
  });

  const handleScheduleValueChange = (key: keyof typeof scheduleValues, newValue: string) => {
    setScheduleValues(prev => ({ ...prev, [key]: newValue }));
    const newSchedule = generateCronExpression(scheduleType, { ...scheduleValues, [key]: newValue });
    onChange(newSchedule);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateCronExpression = (type: string, values: Record<string, string>) => {
    switch(type) {
      case 'minutes':
        return `*/${values.minutes} * * * *`;
      case 'daily':
        return `${values.minute} ${values.hour} * * *`;
      case 'monthly':
        return `${values.minute} ${values.hour} ${values.day} * *`;
      case 'yearly':
        return `${values.minute} ${values.hour} ${values.day} ${values.month} *`;
      case 'custom':
        return value;
      default:
        return '';
    }
  };

  const handleScheduleTypeChange = (newType: string) => {
    setScheduleType(newType);
    onChange(generateCronExpression(newType, scheduleValues));
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={scheduleType} onValueChange={handleScheduleTypeChange} className="space-y-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="minutes" id="minutes" />
          <Label htmlFor="minutes" className="flex items-center gap-2">
            Every
            <Select
              value={scheduleValues.minutes}
              onValueChange={(val) => handleScheduleValueChange('minutes', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="15" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 30, 60].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            minute(s)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="daily" id="daily" />
          <Label htmlFor="daily" className="flex items-center gap-2">
            Every day at
            <Select
              value={scheduleValues.hour}
              onValueChange={(val) => handleScheduleValueChange('hour', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            :
            <Select
              value={scheduleValues.minute}
              onValueChange={(val) => handleScheduleValueChange('minute', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="monthly" id="monthly" />
          <Label htmlFor="monthly" className="flex items-center gap-2">
            Every
            <Select
              value={scheduleValues.day}
              onValueChange={(val) => handleScheduleValueChange('day', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            of the month at
            <Select
              value={scheduleValues.hour}
              onValueChange={(val) => handleScheduleValueChange('hour', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            :
            <Select
              value={scheduleValues.minute}
              onValueChange={(val) => handleScheduleValueChange('minute', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yearly" id="yearly" />
          <Label htmlFor="yearly" className="flex items-center gap-2">
            Every year on
            <Select
              value={scheduleValues.day}
              onValueChange={(val) => handleScheduleValueChange('day', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={scheduleValues.month}
              onValueChange={(val) => handleScheduleValueChange('month', val)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="January" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            at
            <Select
              value={scheduleValues.hour}
              onValueChange={(val) => handleScheduleValueChange('hour', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            :
            <Select
              value={scheduleValues.minute}
              onValueChange={(val) => handleScheduleValueChange('minute', val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">Custom cron expression</Label>
        </div>
      </RadioGroup>

      {scheduleType === 'custom' && (
        <div className="pl-6">
          <Label>Cron expression</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="* * * * *"
            className="font-mono"
          />
        </div>
      )}
    </div>
  );
}
