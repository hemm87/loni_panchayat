'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  UserCog,
  Search,
  MoreVertical,
  Crown,
  Trash2,
  UserX,
  UserCheck,
  Loader2,
  UserPlus,
  Mail,
  User,
  Key
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp, deleteApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import type { AppUser, UserRole } from '@/lib/types';
import { isSuperAdmin, SUPER_ADMIN_EMAIL } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Firebase config for secondary app (user creation without affecting current session)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface UserManagementProps {
  currentUserEmail?: string;
}

export function UserManagement({ currentUserEmail }: UserManagementProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  
  // Add User Dialog State
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'viewer' as UserRole,
  });

  // Fetch all users
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<AppUser>(usersQuery);

  // Filter users
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Check if current user is super admin
  const isCurrentSuperAdmin = isSuperAdmin(currentUserEmail);

  const handleRoleChange = async (user: AppUser, newRole: UserRole) => {
    if (!firestore) return;
    
    // Prevent changing super admin role
    if (isSuperAdmin(user.email)) {
      toast({
        variant: 'destructive',
        title: 'Cannot Change Role',
        description: 'Super Admin role cannot be modified.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        role: newRole,
      });
      toast({
        title: 'Role Updated',
        description: `${user.displayName || user.email} is now ${newRole}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user role.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (user: AppUser) => {
    if (!firestore) return;
    
    if (isSuperAdmin(user.email)) {
      toast({
        variant: 'destructive',
        title: 'Cannot Deactivate',
        description: 'Super Admin cannot be deactivated.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        isActive: !user.isActive,
      });
      toast({
        title: user.isActive ? 'User Deactivated' : 'User Activated',
        description: `${user.displayName || user.email} has been ${user.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user status.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!firestore || !userToDelete) return;

    setIsProcessing(true);
    try {
      await deleteDoc(doc(firestore, 'users', userToDelete.uid));
      toast({
        title: 'User Deleted',
        description: `${userToDelete.displayName || userToDelete.email} has been removed.`,
      });
      setUserToDelete(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUser = async () => {
    if (!firestore) return;
    
    // Validation
    if (!newUserData.email || !newUserData.password || !newUserData.displayName) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (newUserData.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }

    setIsProcessing(true);
    
    // Create a secondary Firebase app for user creation
    // This prevents the current super admin from being logged out
    let secondaryApp = null;
    
    try {
      // Initialize secondary app
      const secondaryAppName = 'SecondaryApp_' + Date.now();
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      
      // Create user in Firebase Auth using secondary app
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        newUserData.email, 
        newUserData.password
      );

      // Create user document in Firestore (using main firestore instance)
      const userData: AppUser = {
        uid: userCredential.user.uid,
        email: newUserData.email,
        displayName: newUserData.displayName,
        role: newUserData.role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        photoURL: undefined,
      };

      await setDoc(doc(firestore, 'users', userCredential.user.uid), userData);

      // Sign out from secondary app and delete it
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);
      secondaryApp = null;

      toast({
        title: 'User Created • उपयोगकर्ता बनाया गया',
        description: `${newUserData.displayName} has been added as ${newUserData.role}.`,
      });

      // Reset form and close dialog
      setNewUserData({ email: '', password: '', displayName: '', role: 'viewer' });
      setShowAddUserDialog(false);
    } catch (error: any) {
      // Clean up secondary app if it exists
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (e) {
          console.error('Error cleaning up secondary app:', e);
        }
      }
      
      let errorMessage = 'Failed to create user.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadge = (role: UserRole, email: string) => {
    if (isSuperAdmin(email)) {
      return (
        <Badge className="gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
          <Crown className="w-3 h-3" />
          Super Admin
        </Badge>
      );
    }
    switch (role) {
      case 'admin':
        return (
          <Badge className="gap-1 bg-blue-100 text-blue-700 border-blue-300">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </Badge>
        );
      case 'viewer':
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            Viewer
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {role}
          </Badge>
        );
    }
  };

  if (!isCurrentSuperAdmin) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          Only Super Admin ({SUPER_ADMIN_EMAIL}) can manage users.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">User Management</h3>
            <p className="text-sm text-muted-foreground">उपयोगकर्ता प्रबंधन • Manage system users</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            className="gap-2"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <UserPlus className="w-4 h-4" />
            Add User • उपयोगकर्ता जोड़ें
          </Button>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white gap-1 px-3 py-1.5">
            <Crown className="w-4 h-4" />
            Super Admin Access
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-2"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v: 'all' | UserRole) => setRoleFilter(v)}>
          <SelectTrigger className="w-full md:w-48 h-11 border-2">
            <Shield className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super-admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No users found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.uid} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg uppercase">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                      {getRoleBadge(user.role, user.email)}
                      {user.isActive === false && (
                        <Badge variant="destructive" className="gap-1">
                          <UserX className="w-3 h-3" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {!isSuperAdmin(user.email) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isProcessing}>
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleRoleChange(user, 'admin')}>
                        <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user, 'viewer')}>
                        <Users className="w-4 h-4 mr-2" />
                        Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                        {user.isActive !== false ? (
                          <>
                            <UserX className="w-4 h-4 mr-2 text-orange-600" />
                            Deactivate User
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                            Activate User
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setUserToDelete(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center border-2">
          <p className="text-2xl font-bold text-primary">{users?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </Card>
        <Card className="p-4 text-center border-2">
          <p className="text-2xl font-bold text-yellow-600">
            {users?.filter(u => isSuperAdmin(u.email)).length || 0}
          </p>
          <p className="text-sm text-muted-foreground">Super Admin</p>
        </Card>
        <Card className="p-4 text-center border-2">
          <p className="text-2xl font-bold text-blue-600">
            {users?.filter(u => u.role === 'admin' && !isSuperAdmin(u.email)).length || 0}
          </p>
          <p className="text-sm text-muted-foreground">Admins</p>
        </Card>
        <Card className="p-4 text-center border-2">
          <p className="text-2xl font-bold text-gray-600">
            {users?.filter(u => u.role === 'viewer').length || 0}
          </p>
          <p className="text-sm text-muted-foreground">Viewers</p>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.displayName || userToDelete?.email}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <span>Add New User</span>
                <p className="text-sm font-normal text-muted-foreground">नया उपयोगकर्ता जोड़ें</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Create a new user account with Viewer or Admin role. Super Admin role cannot be assigned.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name • पूरा नाम <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                placeholder="Enter full name"
                value={newUserData.displayName}
                onChange={(e) => setNewUserData({ ...newUserData, displayName: e.target.value })}
                className="h-11 border-2"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address • ईमेल <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="h-11 border-2"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                Password • पासवर्ड <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                className="h-11 border-2"
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                User Role • उपयोगकर्ता भूमिका <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={newUserData.role} 
                onValueChange={(v: UserRole) => setNewUserData({ ...newUserData, role: v })}
              >
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium">Viewer</span>
                        <span className="text-xs text-muted-foreground ml-2">- Can only view data</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground ml-2">- Can add & modify data</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Role Description */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                {newUserData.role === 'viewer' ? (
                  <div className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Viewer Permissions:</p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <li>• View dashboard and reports</li>
                        <li>• View property listings</li>
                        <li>• Cannot add, edit or delete data</li>
                        <li>• Cannot access settings</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Admin Permissions:</p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <li>• All viewer permissions</li>
                        <li>• Add & edit properties</li>
                        <li>• Generate bills & record payments</li>
                        <li>• View settings (read-only)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddUserDialog(false);
                setNewUserData({ email: '', password: '', displayName: '', role: 'viewer' });
              }}
              disabled={isProcessing}
            >
              Cancel • रद्द करें
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={isProcessing || !newUserData.email || !newUserData.password || !newUserData.displayName}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Create User • बनाएं
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
