
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
        return values.custom;
      default:
        return '';
    }
  };

  const handleScheduleChange = (newType: string) => {
    setScheduleType(newType);
    switch(newType) {
      case 'minutes':
        onChange('*/15 * * * *');
        break;
      case 'daily':
        onChange('0 0 * * *');
        break;
      case 'monthly':
        onChange('0 0 1 * *');
        break;
      case 'yearly':
        onChange('0 0 1 1 *');
        break;
      case 'custom':
        onChange('* * * * *');
        break;
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={scheduleType}
        onValueChange={handleScheduleChange}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="minutes" id="minutes" />
          <Label htmlFor="minutes" className="flex items-center gap-2">
            {t('schedule.every')}
            <Select
              value="15"
              onValueChange={(val) => 
                onChange(generateCronExpression('minutes', { minutes: val }))
              }
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
            {t('schedule.minutes')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="daily" id="daily" />
          <Label htmlFor="daily" className="flex items-center gap-2">
            {t('schedule.everyDayAt')}
            <Select
              value="0"
              onValueChange={(val) =>
                onChange(generateCronExpression('daily', { hour: val, minute: '0' }))
              }
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
              value="00"
              onValueChange={(val) =>
                onChange(generateCronExpression('daily', { hour: '0', minute: val }))
              }
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
            {t('schedule.everyMonthOn')}
            <Select
              value="1"
              onValueChange={(val) =>
                onChange(generateCronExpression('monthly', { day: val, hour: '0', minute: '0' }))
              }
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
            {t('schedule.atTime')}
            <Select value="0" onValueChange={() => {}}>
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
            <Select value="00" onValueChange={() => {}}>
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
            {t('schedule.everyYearOn')}
            <Select value="1" onValueChange={() => {}}>
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
            <Select value="1" onValueChange={() => {}}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="January" />
              </SelectTrigger>
              <SelectContent>
                {/* Fix for the map error - ensure we have an array before mapping */}
                {(t('months', { returnObjects: true }) as string[])?.map((month: string, index: number) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">{t('schedule.custom')}</Label>
        </div>
      </RadioGroup>

      {scheduleType === 'custom' && (
        <div className="pl-6">
          <Label>{t('schedule.cronExpression')}</Label>
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
