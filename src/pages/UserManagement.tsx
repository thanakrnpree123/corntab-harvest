import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { User, Role } from "@/lib/types";
import { UserTable } from "@/components/users/UserTable";
import { RolesList } from "@/components/users/RolesList";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { EditRoleDialog } from "@/components/users/EditRoleDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { DEFAULT_ROLES } from "@/lib/constants";

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: DEFAULT_ROLES[0], // Admin
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: DEFAULT_ROLES[1], // Viewer
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z"
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: DEFAULT_ROLES[2], // Controller
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2023-02-01T00:00:00Z"
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles] = useState<Role[]>(DEFAULT_ROLES);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
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
      if (user.role.id === selectedRole.id) {
        return {
          ...user,
          role: {
            ...user.role,
            name: editRoleName,
            permissions: editRolePermissions,
            updatedAt: new Date().toISOString()
          }
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

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleUserDetailsChange = (field: string, value: string) => {
    if (!selectedUser) return;

    if (field === 'roleId') {
      const newRole = roles.find(role => role.id === value);
      if (!newRole) return;

      setSelectedUser({
        ...selectedUser,
        role: newRole
      });
    } else {
      setSelectedUser({
        ...selectedUser,
        [field]: value
      });
    }
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    setUsers(users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));
    setIsEditUserOpen(false);
    setSelectedUser(null);
    toast.success("User updated successfully");
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
                <UserTable 
                  users={users} 
                  onDeleteUser={handleDeleteUser}
                  onEditUser={handleEditUser}
                />
              </CardContent>
            </Card>
            
            <RolesList roles={roles} onEditRole={openEditRoleDialog} />
          </div>
        </div>
        
        <AddUserDialog
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onSubmit={handleAddUser}
          roles={roles}
          newUserName={newUserName}
          newUserEmail={newUserEmail}
          newUserRoleId={newUserRoleId}
          onNameChange={setNewUserName}
          onEmailChange={setNewUserEmail}
          onRoleChange={setNewUserRoleId}
        />
        
        <EditRoleDialog
          isOpen={isEditRoleOpen}
          onClose={() => setIsEditRoleOpen(false)}
          onSubmit={handleEditRole}
          roleName={editRoleName}
          permissions={editRolePermissions}
          onRoleNameChange={setEditRoleName}
          onTogglePermission={togglePermission}
        />
        
        <EditUserDialog
          isOpen={isEditUserOpen}
          onClose={() => setIsEditUserOpen(false)}
          onSubmit={handleUpdateUser}
          user={selectedUser}
          onUserDetailsChange={handleUserDetailsChange}
        />
      </main>
    </div>
  );
};

export default UserManagement;
