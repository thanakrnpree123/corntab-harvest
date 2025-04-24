
import { Role } from "./types";

export const DEFAULT_ROLES: Role[] = [
  {
    id: "admin",
    name: "Admin",
    permissions: ["view", "create", "update", "delete"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "viewer",
    name: "Viewer",
    permissions: ["view"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "controller",
    name: "Controller",
    permissions: ["view", "trigger"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
