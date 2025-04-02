
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CronJob } from "@/lib/types";
import { Eye } from "lucide-react";

interface EmailPreviewProps {
  jobData: {
    name: string;
    endpoint: string;
    schedule: string;
    httpMethod: string;
  };
  emailRecipients: string;
}

export function EmailPreview({ jobData, emailRecipients }: EmailPreviewProps) {
  const [open, setOpen] = useState(false);
  
  // สร้างเนื้อหาตัวอย่างอีเมล
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">Job Notification</h2>
      <p>ระบบได้สร้าง Cron Job ใหม่ในระบบเรียบร้อยแล้ว:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <div style="margin-bottom: 10px;"><strong>ชื่องาน:</strong> ${jobData.name}</div>
        <div style="margin-bottom: 10px;"><strong>Endpoint URL:</strong> ${jobData.endpoint}</div>
        <div style="margin-bottom: 10px;"><strong>กำหนดการทำงาน:</strong> ${jobData.schedule}</div>
        <div style="margin-bottom: 10px;"><strong>HTTP Method:</strong> ${jobData.httpMethod}</div>
      </div>
      
      <p>คุณได้รับอีเมลนี้เนื่องจากคุณได้ลงทะเบียนเพื่อรับการแจ้งเตือนเกี่ยวกับการทำงานของงานนี้</p>
      
      <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666;">
        <p>ผู้รับอีเมลนี้: ${emailRecipients}</p>
        <p>กรุณาอย่าตอบกลับอีเมลนี้ เพราะเป็นการส่งโดยอัตโนมัติ</p>
      </div>
    </div>
  `;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          type="button"
        >
          <Eye className="h-4 w-4" />
          ดูตัวอย่างอีเมล
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ตัวอย่างอีเมลแจ้งเตือน</DialogTitle>
          <DialogDescription>
            นี่คือตัวอย่างอีเมลที่จะส่งไปยังผู้รับที่ระบุ
          </DialogDescription>
        </DialogHeader>
        <div 
          className="border rounded-md p-4 bg-white dark:bg-gray-800"
          dangerouslySetInnerHTML={{ __html: emailContent }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline">ปิด</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
