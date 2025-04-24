
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Key } from "lucide-react";
import { Permission } from "@/lib/types";

interface EditRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  roleName: string;
  permissions: Permission[];
  onRoleNameChange: (value: string) => void;
  onTogglePermission: (permission: Permission) => void;
}

export const EditRoleDialog = ({
  isOpen,
  onClose,
  onSubmit,
  roleName,
  permissions,
  onRoleNameChange,
  onTogglePermission,
}: EditRoleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update role name and permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => onRoleNameChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Permissions</Label>
            <div className="space-y-2">
              {["view", "create", "update", "delete", "trigger"].map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox 
                    id={permission} 
                    checked={permissions.includes(permission as Permission)}
                    onCheckedChange={() => onTogglePermission(permission as Permission)}
                  />
                  <Label htmlFor={permission} className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    {permission.charAt(0).toUpperCase() + permission.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
