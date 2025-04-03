
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { TableCell } from "@mui/material";
import { User } from "@/lib/types";

// This component needs to be exported as default for App.tsx to import it
export default function UserManagementPage() {
  // Sample user object for the example
  const user: User = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: {
      id: "1",
      name: "Admin",
      permissions: ["view", "create", "update"],
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z"
    },
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  };

  return (
    <MainLayout>
      {/* Fix the line causing the ReactNode type error */}
      <TableCell>
        {typeof user.role === 'object' && user.role ? user.role.name : String(user.role)}
      </TableCell>
    </MainLayout>
  );
}
