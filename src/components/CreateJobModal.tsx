import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Project } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BasicJobDetails } from "./job-form/BasicJobDetails";
import { RequestBodyForm } from "./job-form/RequestBodyForm";
import { EmailNotificationForm } from "./job-form/EmailNotificationForm";
import { ScheduleSelector } from "./ScheduleSelector";
import { useEffect } from "react";

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
  const { t } = useTranslation();
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
  const [useLocalTime, setUseLocalTime] = useState(() => {
    if (editJobData) {
      return editJobData.useLocalTime ?? true;
    }
    return true;
  });
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
    if (editJobData?.timezone) {
      return editJobData.timezone;
    }
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
          <BasicJobDetails
            projectId={projectId}
            projects={projects}
            jobName={jobName}
            endpoint={endpoint}
            httpMethod={httpMethod}
            onProjectChange={setProjectId}
            onJobNameChange={setJobName}
            onEndpointChange={setEndpoint}
            onHttpMethodChange={setHttpMethod}
          />

          {httpMethod !== "GET" && (
            <RequestBodyForm
              requestBodyType={requestBodyType}
              requestBody={requestBody}
              formDataPairs={formDataPairs}
              isJsonValid={isJsonValid}
              onRequestBodyTypeChange={setRequestBodyType}
              onRequestBodyChange={(value) => {
                setRequestBody(value);
                validateJson(value);
              }}
              onFormDataPairsChange={setFormDataPairs}
            />
          )}

          <div className="grid gap-2">
            <Label>Schedule</Label>
            <ScheduleSelector
              value={schedule}
              onChange={setSchedule}
            />
          </div>

          <EmailNotificationForm
            sendEmailNotifications={sendEmailNotifications}
            emailRecipients={emailRecipients}
            notifyOnSuccess={notifyOnSuccess}
            notifyOnFailure={notifyOnFailure}
            emailValidation={emailValidation}
            previewData={{
              name: jobName || "Job ใหม่",
              endpoint: endpoint || "https://example.com/api",
              schedule: schedule,
              httpMethod: httpMethod,
            }}
            useLocalTime={useLocalTime}
            timezone={timezone}
            onSendEmailNotificationsChange={setSendEmailNotifications}
            onEmailRecipientsChange={setEmailRecipients}
            onNotifyOnSuccessChange={setNotifyOnSuccess}
            onNotifyOnFailureChange={setNotifyOnFailure}
            onUseLocalTimeChange={setUseLocalTime}
            onTimezoneChange={setTimezone}
            validateEmails={validateEmails}
          />

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
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
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
