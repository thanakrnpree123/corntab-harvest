
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/lib/types";
import { useTranslation } from "react-i18next";

interface BasicJobDetailsProps {
  projectId: string;
  projects: Project[];
  jobName: string;
  endpoint: string;
  httpMethod: string;
  onProjectChange: (value: string) => void;
  onJobNameChange: (value: string) => void;
  onEndpointChange: (value: string) => void;
  onHttpMethodChange: (value: string) => void;
}

const httpMethods = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PATCH", label: "PATCH" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
];

export function BasicJobDetails({
  projectId,
  projects,
  jobName,
  endpoint,
  httpMethod,
  onProjectChange,
  onJobNameChange,
  onEndpointChange,
  onHttpMethodChange,
}: BasicJobDetailsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="project">โปรเจค *</Label>
        <Select value={projectId} onValueChange={onProjectChange}>
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
          onChange={(e) => onJobNameChange(e.target.value)}
          placeholder="ตรวจสอบการทำงานของ API ประจำวัน"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="httpMethod">HTTP Method</Label>
        <Select value={httpMethod} onValueChange={onHttpMethodChange}>
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
          onChange={(e) => onEndpointChange(e.target.value)}
          placeholder="https://api.example.com/health"
        />
      </div>
    </div>
  );
}
