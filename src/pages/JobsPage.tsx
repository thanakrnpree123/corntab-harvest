
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { JobExportImport } from "@/components/JobExportImport";
import { CronJob } from "@/lib/types";

// This component needs to be exported as default for App.tsx to import it
export default function JobsPage() {
  // Sample filteredJobs for the example
  const filteredJobs: CronJob[] = [];

  // Handle import jobs function
  const handleImportJobs = (jobs: CronJob[]) => {
    console.log("Imported jobs: ", jobs);
    // Add your import job logic here
  };

  return (
    <MainLayout>
      <JobExportImport 
        jobs={filteredJobs}
        onImportJobs={handleImportJobs}
      />
    </MainLayout>
  );
}
