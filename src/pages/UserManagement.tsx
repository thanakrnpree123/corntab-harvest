import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Role, Permission } from "@/lib/types";
import { User as UserIcon, UserPlus, Edit, Trash, Shield, Key } from "lucide-react";

const mockUsers: User[] = [
  {
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
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: {
      id: "2",
      name: "Editor",
      permissions: ["view", "update"],
      createdAt: "2023-01-15T00:00:00Z",
      updatedAt: "2023-01-15T00:00:00Z"
    },
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z"
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: {
      id: "3",
      name: "Viewer",
      permissions: ["view"],
      createdAt: "2023-02-01T00:00:00Z",
      updatedAt: "2023-02-01T00:00:00Z"
    },
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2023-02-01T00:00:00Z"
  }
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    permissions: ["view", "create", "update"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Editor",
    permissions: ["view", "update"],
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z"
  },
  {
    id: "3",
    name: "Viewer",
    permissions: ["view"],
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2023-02-01T00:00:00Z"
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState("");
  
  const [editRoleName, setEditRoleName] = useState("");
  const [editRolePermissions, setEditRolePermissions] = useState<Permission[]>([]);

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserRoleId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedRole = roles.find(role => role.id === newUserRoleId);
    if (!selectedRole) {
      toast.error("Please select a valid role");
      return;
    }

    const newUser: User = {
      id: String(users.length + 1),
      name: newUserName,
      email: newUserEmail,
      role: selectedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    resetAddUserForm();
    setIsAddUserOpen(false);
    toast.success("User added successfully");
  };

  const handleEditRole = () => {
    if (!selectedRole) return;
    
    if (!editRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (editRolePermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const updatedRoles = roles.map(role => 
      role.id === selectedRole.id 
        ? {
            ...role,
            name: editRoleName,
            permissions: editRolePermissions,
            updatedAt: new Date().toISOString()
          }
        : role
    );

    const updatedUsers = users.map(user => {
      if (typeof user.role === 'object' && user.role && user.role.id === selectedRole.id) {
        return {
          ...user,
          role: {
            ...user.role,
            name: editRoleName,
            permissions: editRolePermissions,
            updatedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
      }
      return user;
    });

    setRoles(updatedRoles);
    setUsers(updatedUsers);
    setIsEditRoleOpen(false);
    toast.success("Role updated successfully");
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success("User deleted successfully");
  };

  const openEditRoleDialog = (role: Role) => {
    setSelectedRole(role);
    setEditRoleName(role.name);
    setEditRolePermissions([...role.permissions]);
    setIsEditRoleOpen(true);
  };

  const resetAddUserForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRoleId("");
  };

  const togglePermission = (permission: Permission) => {
    setEditRolePermissions(current => 
      current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button onClick={() => setIsAddUserOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.role.permissions.map((permission) => (
                              <span 
                                key={permission} 
                                className="px-2 py-0.5 bg-slate-100 text-xs rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <UserIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
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
                        <Button variant="ghost" size="icon" onClick={() => openEditRoleDialog(role)}>
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
          </div>
        </div>
        
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and assign a role.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={newUserRoleId}
                  onChange={(e) => setNewUserRoleId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
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
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="view" 
                      checked={editRolePermissions.includes("view")}
                      onCheckedChange={() => togglePermission("view")}
                    />
                    <Label htmlFor="view" className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      View
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="create" 
                      checked={editRolePermissions.includes("create")}
                      onCheckedChange={() => togglePermission("create")}
                    />
                    <Label htmlFor="create" className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      Create
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="update" 
                      checked={editRolePermissions.includes("update")}
                      onCheckedChange={() => togglePermission("update")}
                    />
                    <Label htmlFor="update" className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      Update
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default UserManagement;
