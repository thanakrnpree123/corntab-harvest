
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, FileText, AlertCircle, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyValuePair {
  key: string;
  value: string;
}

interface RequestBodyFormProps {
  requestBodyType: "json" | "formdata";
  requestBody: string;
  formDataPairs: KeyValuePair[];
  isJsonValid: boolean;
  onRequestBodyTypeChange: (value: "json" | "formdata") => void;
  onRequestBodyChange: (value: string) => void;
  onFormDataPairsChange: (pairs: KeyValuePair[]) => void;
}

export function RequestBodyForm({
  requestBodyType,
  requestBody,
  formDataPairs,
  isJsonValid,
  onRequestBodyTypeChange,
  onRequestBodyChange,
  onFormDataPairsChange,
}: RequestBodyFormProps) {
  const handleAddFormDataPair = () => {
    onFormDataPairsChange([...formDataPairs, { key: "", value: "" }]);
  };

  const handleRemoveFormDataPair = (index: number) => {
    const updatedPairs = [...formDataPairs];
    updatedPairs.splice(index, 1);
    onFormDataPairsChange(updatedPairs);
  };

  const handleUpdateFormDataPair = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    const updatedPairs = [...formDataPairs];
    updatedPairs[index][field] = newValue;
    onFormDataPairsChange(updatedPairs);
  };

  return (
    <div className="grid gap-2">
      <Label>Request Body</Label>
      <Tabs
        defaultValue={requestBodyType}
        onValueChange={(value) => onRequestBodyTypeChange(value as "json" | "formdata")}
        className="w-full"
      >
        <TabsList className="mb-2">
          <TabsTrigger value="json" className="flex gap-1 items-center">
            <Code size={14} />
            Raw JSON
          </TabsTrigger>
          <TabsTrigger value="formdata" className="flex gap-1 items-center">
            <FileText size={14} />
            Form Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json">
          <div className="space-y-2">
            <Textarea
              value={requestBody}
              onChange={(e) => onRequestBodyChange(e.target.value)}
              placeholder='{"key": "value"}'
              className={cn(
                "min-h-[120px] font-mono text-sm",
                !isJsonValid && "border-red-500 focus-visible:ring-red-500",
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
                    handleUpdateFormDataPair(index, "key", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={pair.value}
                  onChange={(e) =>
                    handleUpdateFormDataPair(index, "value", e.target.value)
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
  );
}
