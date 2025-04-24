
const isValidJSON = (content: string): boolean => {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
};

const isValidCSV = (content: string): boolean => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return false; // Need at least headers and one data row
  
  // Check for project section
  const projectSectionIndex = lines.findIndex(line => line.trim() === '[PROJECTS]');
  const jobSectionIndex = lines.findIndex(line => line.trim() === '[JOBS]');
  
  if (projectSectionIndex === -1 || jobSectionIndex === -1) {
    return false;
  }

  // Validate project section
  const projectHeaders = lines[projectSectionIndex + 1]?.split(',');
  if (!projectHeaders || projectHeaders.length < 2) return false;

  // Validate job section
  const jobHeaders = lines[jobSectionIndex + 1]?.split(',');
  if (!jobHeaders || jobHeaders.length < 5) return false;

  return true;
};

export const validateFileContent = (content: string, type: "json" | "csv"): { 
  isValid: boolean; 
  error?: string;
} => {
  if (!content.trim()) {
    return { 
      isValid: false, 
      error: `ไฟล์${type.toUpperCase()}ว่างเปล่า` 
    };
  }

  if (type === "json") {
    return {
      isValid: isValidJSON(content),
      error: isValidJSON(content) ? undefined : "รูปแบบ JSON ไม่ถูกต้อง"
    };
  } else {
    return {
      isValid: isValidCSV(content),
      error: isValidCSV(content) ? undefined : "รูปแบบ CSV ไม่ถูกต้อง หรือไม่มีส่วน [PROJECTS] และ [JOBS]"
    };
  }
};
