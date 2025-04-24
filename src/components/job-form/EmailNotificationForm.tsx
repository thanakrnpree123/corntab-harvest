import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Clock } from "lucide-react";
import { EmailPreview } from "../EmailPreview";
import { TimezonePicker } from "../TimezonePicker";

interface EmailNotificationFormProps {
  sendEmailNotifications: boolean;
  emailRecipients: string;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  emailValidation: { isValid: boolean; message: string };
  previewData: {
    name: string;
    endpoint: string;
    schedule: string;
    httpMethod: string;
  };
  useLocalTime: boolean;
  timezone: string;
  onSendEmailNotificationsChange: (checked: boolean) => void;
  onEmailRecipientsChange: (value: string) => void;
  onNotifyOnSuccessChange: (checked: boolean) => void;
  onNotifyOnFailureChange: (checked: boolean) => void;
  onUseLocalTimeChange: (checked: boolean) => void;
  onTimezoneChange: (value: string) => void;
  validateEmails: (emails: string) => void;
}

export function EmailNotificationForm({
  sendEmailNotifications,
  emailRecipients,
  notifyOnSuccess,
  notifyOnFailure,
  emailValidation,
  previewData,
  useLocalTime,
  timezone,
  onSendEmailNotificationsChange,
  onEmailRecipientsChange,
  onNotifyOnSuccessChange,
  onNotifyOnFailureChange,
  onUseLocalTimeChange,
  onTimezoneChange,
  validateEmails,
}: EmailNotificationFormProps) {
  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-local-time"
            checked={useLocalTime}
            onCheckedChange={(checked) => onUseLocalTimeChange(checked as boolean)}
          />
          <Label
            htmlFor="use-local-time"
            className="text-sm font-normal flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            ใช้เวลา UTC
          </Label>
        </div>

        {!useLocalTime && (
          <div className="ml-6">
            <Label htmlFor="timezone" className="text-sm font-medium mb-1.5">
              Timezone
            </Label>
            <TimezonePicker value={timezone} onChange={onTimezoneChange} />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="send-email"
            checked={sendEmailNotifications}
            onCheckedChange={(checked) =>
              onSendEmailNotificationsChange(checked as boolean)
            }
          />
          <Label
            htmlFor="send-email"
            className="text-sm font-normal flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            ส่งการแจ้งเตือนทางอีเมล
          </Label>
        </div>

        {sendEmailNotifications && (
          <div className="space-y-4 border rounded-md p-4 bg-muted/30">
            <div className="grid gap-2">
              <Label htmlFor="email-recipients">อีเมลผู้รับ *</Label>
              <Input
                id="email-recipients"
                value={emailRecipients}
                onChange={(e) => {
                  onEmailRecipientsChange(e.target.value);
                  if (e.target.value) validateEmails(e.target.value);
                }}
                placeholder="email@example.com, another@example.com"
                className={!emailValidation.isValid ? "border-red-500" : ""}
              />
              {!emailValidation.isValid && (
                <p className="text-xs text-red-500">
                  {emailValidation.message}
                </p>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                คั่นอีเมลหลายอันด้วยเครื่องหมายจุลภาค (,)
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">ส่งอีเมลเมื่อ:</Label>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notify-success"
                    checked={notifyOnSuccess}
                    onCheckedChange={(checked) =>
                      onNotifyOnSuccessChange(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="notify-success"
                    className="text-sm font-normal"
                  >
                    Job ทำงานสำเ��็จ
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notify-failure"
                    checked={notifyOnFailure}
                    onCheckedChange={(checked) =>
                      onNotifyOnFailureChange(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="notify-failure"
                    className="text-sm font-normal"
                  >
                    Job ทำงานล้มเหลว
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <EmailPreview
                jobData={previewData}
                emailRecipients={emailRecipients || "example@email.com"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
