import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Project } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Plus,
  Mail,
  Code,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmailPreview } from "./EmailPreview";
import { ScheduleSelector } from "@/components/ui/schedule-selector";

const httpMethods = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PATCH", label: "PATCH" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
];

const commonTimezones = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+7)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
  { value: "America/New_York", label: "America/New_York (UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8/-7)" },
  { value: "Europe/London", label: "Europe/London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1/+2)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10/+11)" },
];

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob?: (jobData: any) => void;
  onEditJob?: (jobData: any) => void;
  editJobData?: any | null;
  projects: Project[];
  selectedProjectId: string;
}

interface KeyValuePair {
  key: string;
  value: string;
}

export function CreateJobModal({
  isOpen,
  onClose,
  onCreateJob,
  onEditJob,
  editJobData,
  projects,
  selectedProjectId,
}: CreateJobModalProps) {
  const [jobName, setJobName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [requestBodyType, setRequestBodyType] = useState<"json" | "formdata">(
    "json",
  );
  const [requestBody, setRequestBody] = useState("");
  const [formDataPairs, setFormDataPairs] = useState<KeyValuePair[]>([
    { key: "", value: "" },
  ]);
  const [schedule, setSchedule] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("cron");
  const [projectId, setProjectId] = useState(selectedProjectId);
  const [useLocalTime, setUseLocalTime] = useState(true);
  const [sendEmailNotifications, setSendEmailNotifications] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    message: "",
  });
  const [notifyOnSuccess, setNotifyOnSuccess] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);

  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });

  useEffect(() => {
    if (isOpen && editJobData) {
      setJobName(editJobData.name || "");
      setEndpoint(editJobData.endpoint || "");
      setHttpMethod(editJobData.httpMethod || "GET");
      setRequestBody(editJobData.requestBody || "");
      setSchedule(editJobData.schedule || "");
      setDescription(editJobData.description || "");
      setProjectId(editJobData.projectId || selectedProjectId);
      setUseLocalTime(editJobData.useLocalTime ?? true);
      setScheduleType("cron");
      setTimezone(editJobData.timezone || timezone);

      if (editJobData.httpMethod !== "GET" && editJobData.requestBody) {
        try {
          const parsed = JSON.parse(editJobData.requestBody);
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            !Array.isArray(parsed)
          ) {
            setRequestBodyType("formdata");
            setFormDataPairs(
              Object.entries(parsed).map(([key, value]) => ({
                key,
                value: String(value ?? ""),
              })),
            );
          } else {
            setRequestBodyType("json");
            setFormDataPairs([{ key: "", value: "" }]);
          }
        } catch {
          setRequestBodyType("json");
          setFormDataPairs([{ key: "", value: "" }]);
        }
      } else {
        setRequestBodyType("json");
        setFormDataPairs([{ key: "", value: "" }]);
      }

      let hasEmail = false;
      if (editJobData.emailNotifications) {
        try {
          const emailObj = JSON.parse(editJobData.emailNotifications);
          setSendEmailNotifications(true);
          setEmailRecipients(
            (emailObj.recipients || []).join(", "),
          );
          setNotifyOnSuccess(emailObj.onSuccess ?? true);
          setNotifyOnFailure(emailObj.onFailure ?? true);
          hasEmail = true;
        } catch {
          setSendEmailNotifications(false);
          setEmailRecipients("");
          setNotifyOnSuccess(true);
          setNotifyOnFailure(true);
        }
      }
      if (!hasEmail) {
        setSendEmailNotifications(false);
        setEmailRecipients("");
        setNotifyOnSuccess(true);
        setNotifyOnFailure(true);
      }
      setIsJsonValid(true);
      setEmailValidation({ isValid: true, message: "" });
    } else if (isOpen && !editJobData) {
      resetForm();
    }
  }, [isOpen, editJobData]);

  const validateJson = (jsonString: string) => {
    if (!jsonString) return true;

    try {
      JSON.parse(jsonString);
      setIsJsonValid(true);
      return true;
    } catch (e) {
      setIsJsonValid(false);
      return false;
    }
  };

  const validateEmails = (emails: string): boolean => {
    if (!emails) {
      setEmailValidation({
        isValid: false,
        message: "กรุณาระบุอีเมลอย่างน้อย 1 อีเมล",
      });
      return false;
    }

    const emailList = emails.split(",").map((email) => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValid = emailList.every((email) => emailRegex.test(email));

    if (!isValid) {
      setEmailValidation({
        isValid: false,
        message: "กรุณาระบุอีเมลให้ถูกต้อง (เช่น example@domain.com)",
      });
      return false;
    }

    setEmailValidation({
      isValid: true,
      message: "",
    });
    return true;
  };

  const handleAddFormDataPair = () => {
    setFormDataPairs([...formDataPairs, { key: "", value: "" }]);
  };

  const handleRemoveFormDataPair = (index: number) => {
    const updatedPairs = [...formDataPairs];
    updatedPairs.splice(index, 1);
    setFormDataPairs(updatedPairs);
  };

  const handleUpdateFormDataPair = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    const updatedPairs = [...formDataPairs];
    updatedPairs[index][field] = newValue;
    setFormDataPairs(updatedPairs);
  };

  const buildFormDataBody = () => {
    const dataObject: Record<string, string> = {};
    formDataPairs.forEach((pair) => {
      if (pair.key.trim()) {
        dataObject[pair.key] = pair.value;
      }
    });
    return JSON.stringify(dataObject);
  };

  const handleSubmit = () => {
    if (!jobName || !endpoint || !schedule) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    if (
      httpMethod !== "GET" &&
      requestBodyType === "json" &&
      !validateJson(requestBody)
    ) {
      toast({
        title: "JSON ไม่ถูกต้อง",
        description: "กรุณาตรวจสอบรูปแบบ JSON ให้ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    if (sendEmailNotifications && !validateEmails(emailRecipients)) {
      toast({
        title: "อีเมลไม่ถูกต้อง",
        description:
          emailValidation.message || "กรุณาตรวจสอบรูปแบบอีเมลให้ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const finalRequestBody =
      httpMethod !== "GET"
        ? requestBodyType === "json"
          ? requestBody
          : buildFormDataBody()
        : "";

    const emailSettings = sendEmailNotifications
      ? {
          recipients: emailRecipients.split(",").map((email) => email.trim()),
          onSuccess: notifyOnSuccess,
          onFailure: notifyOnFailure,
        }
      : null;

    const jobPayload = {
      ...(editJobData ? { id: editJobData.id } : {}),
      name: jobName,
      endpoint,
      httpMethod,
      requestBody: finalRequestBody,
      schedule,
      description,
      projectId,
      timezone: useLocalTime ? timezone : "UTC",
      useLocalTime,
      emailNotifications: emailSettings
        ? JSON.stringify(emailSettings)
        : null,
      tags: editJobData?.tags || [],
      status: editJobData?.status,
    };

    try {
      if (editJobData && onEditJob) {
        onEditJob(jobPayload);
        toast({
          title: "บันทึกการแก้ไข",
          description: `อัปเดต Job "${jobName}" เรียบร้อยแล้ว`,
        });
      } else if (!editJobData && onCreateJob) {
        onCreateJob(jobPayload);
        toast({
          title: "กำลังสร้าง Job",
          description: "กรุณารอสักครู่...",
        });
      }

      setTimeout(() => {
        resetForm();
        onClose();
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถประมวลผลข้อมูล Job",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobName("");
    setEndpoint("");
    setHttpMethod("GET");
    setRequestBody("");
    setRequestBodyType("json");
    setFormDataPairs([{ key: "", value: "" }]);
    setSchedule("");
    setDescription("");
    setScheduleType("cron");
    setProjectId(selectedProjectId);
    setUseLocalTime(true);
    setSendEmailNotifications(false);
    setEmailRecipients("");
    setIsJsonValid(true);
    setNotifyOnSuccess(true);
    setNotifyOnFailure(true);
    setEmailValidation({ isValid: true, message: "" });
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const scheduleExamples = {
    cron: "* * * * *",
    interval: "30s, 5m, 1h",
    fixed: "YYYY-MM-DD HH:MM:SS",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editJobData ? "แก้ไขงาน" : "สร้าง Job ใหม่"}
          </DialogTitle>
          <DialogDescription>
            {editJobData
              ? "แก้ไขข้อมูล Cron Job"
              : "เพิ่ม Cron Job ใหม่เข้าสู่ระบบบริหารจัดการ"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project">โปรเจค *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกโปรเจค" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project?.id} value={project?.id}>
                    {project?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">ชื่อ Job *</Label>
            <Input
              id="name"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="ตรวจสอบการทำงานของ API ประจำวัน"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="httpMethod">HTTP Method</Label>
            <Select value={httpMethod} onValueChange={setHttpMethod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือก HTTP method" />
              </SelectTrigger>
              <SelectContent>
                {httpMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endpoint">Endpoint URL *</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/health"
            />
          </div>

          {httpMethod !== "GET" && (
            <div className="grid gap-2">
              <Label>Request Body</Label>
              <Tabs
                defaultValue={requestBodyType}
                onValueChange={(value) =>
                  setRequestBodyType(value as "json" | "formdata")
                }
                className="w-full"
              >
                <TabsList className="mb-2">
                  <TabsTrigger value="json" className="flex gap-1 items-center">
                    <Code size={14} />
                    Raw JSON
                  </TabsTrigger>
                  <TabsTrigger
                    value="formdata"
                    className="flex gap-1 items-center"
                  >
                    <FileText size={14} />
                    Form Data
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="json">
                  <div className="space-y-2">
                    <Textarea
                      value={requestBody}
                      onChange={(e) => {
                        setRequestBody(e.target.value);
                        validateJson(e.target.value);
                      }}
                      placeholder='{"key": "value"}'
                      className={cn(
                        "min-h-[120px] font-mono text-sm",
                        !isJsonValid &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                    />
                    {!isJsonValid && (
                      <Alert variant="destructive" className="p-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          รูปแบบ JSON ไม่ถูกต้อง
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="formdata">
                  <div className="space-y-3">
                    {formDataPairs.map((pair, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Key"
                          value={pair.key}
                          onChange={(e) =>
                            handleUpdateFormDataPair(
                              index,
                              "key",
                              e.target.value,
                            )
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={pair.value}
                          onChange={(e) =>
                            handleUpdateFormDataPair(
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFormDataPair(index)}
                          disabled={formDataPairs.length <= 1}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddFormDataPair}
                      className="mt-2"
                      type="button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      เพิ่ม Field
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="grid gap-2">
            <Label>{t('schedule.title')}</Label>
            <ScheduleSelector
              value={schedule}
              onChange={setSchedule}
            />
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <Checkbox
              id="use-local-time"
              checked={useLocalTime}
              onCheckedChange={(checked) => setUseLocalTime(checked as boolean)}
            />
            <Label htmlFor="use-local-time" className="text-sm font-normal">
              ใช้เวลาท้องถิ่นแทน UTC
            </Label>
          </div>

          {useLocalTime && (
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="เลือก timezone" />
                </SelectTrigger>
                <SelectContent>
                  {commonTimezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2 mt-1">
            <Checkbox
              id="send-email"
              checked={sendEmailNotifications}
              onCheckedChange={(checked) =>
                setSendEmailNotifications(checked as boolean)
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
                    setEmailRecipients(e.target.value);
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
                        setNotifyOnSuccess(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="notify-success"
                      className="text-sm font-normal"
                    >
                      Job ทำงานสำเร็จ
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="notify-failure"
                      checked={notifyOnFailure}
                      onCheckedChange={(checked) =>
                        setNotifyOnFailure(checked as boolean)
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
                  jobData={{
                    name: jobName || "Job ใหม่",
                    endpoint: endpoint || "https://example.com/api",
                    schedule:
                      schedule ||
                      scheduleExamples[
                        scheduleType as keyof typeof scheduleExamples
                      ],
                    httpMethod: httpMethod,
                  }}
                  emailRecipients={emailRecipients || "example@email.com"}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ตรวจสอบสถานะการทำงานของ API endpoint เป็นประจำ"
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editJobData ? "กำลังบันทึก..." : "กำลังสร้าง..."}
              </>
            ) : (
              editJobData ? "บันทึกการแก้ไข" : "สร้าง Job"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
