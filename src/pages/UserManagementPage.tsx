
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { apiService } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";
import { Permission, Role, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await apiService.getUsers();
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "Error fetching users",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await apiService.getRoles();
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        toast({
          title: "Error fetching roles",
          description: "Failed to load roles. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  const handleEditPermissions = (user: User) => {
    setSelectedUser(user);
    setSelectedPermissions(user.role?.permissions || []);
    setIsPermissionDialogOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);

    try {
      // Find or create a role with the selected permissions
      let role = roles.find(r => 
        r.permissions.length === selectedPermissions.length && 
        r.permissions.every(p => selectedPermissions.includes(p))
      );

      if (!role) {
        // Create a new role if no matching role exists
        const newRoleName = `Custom Role (${new Date().toISOString()})`;
        const response = await apiService.createRole({
          name: newRoleName,
          permissions: selectedPermissions
        });

        if (!response.success || !response.data) {
          toast({
            title: "Error",
            description: "Failed to create role. Please try again.",
            variant: "destructive",
          });
          return;
        }

        role = response.data;
      }

      // Update the user's role
      const updateResponse = await apiService.updateUser(selectedUser.id, {
        roleId: role.id
      });

      if (updateResponse.success) {
        toast({
          title: "Success",
          description: "User permissions updated successfully",
        });
        refetchUsers();
      } else {
        toast({
          title: "Error",
          description: "Failed to update user permissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsPermissionDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const allPermissions: Permission[] = ["view", "create", "update", "delete"];

  return (
    <PageLayout title="User Management">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Permissions</CardTitle>
            <CardDescription>
              Manage access and permissions for system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">User</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role?.name || "No Role"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.role?.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                            >
                              {permission}
                            </span>
                          ))}
                          {!user.role?.permissions.length && (
                            <span className="text-muted-foreground">No permissions</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Edit Permissions
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Edit User Permissions</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will change the permissions for {user.name}.
                                Are you sure you want to continue?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <div className="space-y-4">
                                {allPermissions.map((permission) => (
                                  <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`permission-${permission}`}
                                      checked={user.role?.permissions.includes(permission)}
                                      disabled
                                    />
                                    <Label htmlFor={`permission-${permission}`} className="capitalize">
                                      {permission}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleEditPermissions(user)}>
                                Continue to Edit
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              {selectedUser ? `Manage permissions for ${selectedUser.name}` : "Select permissions for this user"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {allPermissions.map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={`dialog-permission-${permission}`}
                  checked={selectedPermissions.includes(permission)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPermissions([...selectedPermissions, permission]);
                    } else {
                      setSelectedPermissions(
                        selectedPermissions.filter((p) => p !== permission)
                      );
                    }
                  }}
                />
                <Label htmlFor={`dialog-permission-${permission}`} className="capitalize">
                  {permission}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
