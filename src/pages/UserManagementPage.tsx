
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
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
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role.name}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
