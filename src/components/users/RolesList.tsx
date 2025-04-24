
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Key, Shield } from "lucide-react";
import { Role } from "@/lib/types";

interface RolesListProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
}

export const RolesList = ({ roles, onEditRole }: RolesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <CardDescription>Manage roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{role.name}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onEditRole(role)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {role.permissions.map((permission) => (
                  <span 
                    key={permission} 
                    className="px-2 py-0.5 bg-slate-100 text-xs rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
