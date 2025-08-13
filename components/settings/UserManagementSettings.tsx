"use client"

import { useState } from "react"
import { SettingsSection } from "./SettingsSection"
import { SettingsField } from "./SettingsField"
import { SaveButton } from "./SaveButton"
import { RoleBadge } from "@/components/profile/RoleBadge"
import { RoleGuard } from "@/components/rbac/RoleGuard"
import type { User, Role } from "@/components/rbac/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Mail, Edit2, Trash2, UserPlus, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMember extends User {
  status: "active" | "pending" | "inactive"
  invitedAt?: string
  lastActive?: string
}

interface UserManagementSettingsProps {
  users?: TeamMember[]
  currentUser?: User
  onInviteUser?: (email: string, role: Role) => Promise<void>
  onUpdateUserRole?: (userId: string, role: Role) => Promise<void>
  onRemoveUser?: (userId: string) => Promise<void>
  onResendInvite?: (userId: string) => Promise<void>
  isLoading?: boolean
  className?: string
}

const roleDescriptions: Record<Role, string> = {
  admin: "Full access to all features and settings",
  member: "Can view and edit data, limited settings access",
  viewer: "Read-only access to reports and dashboards",
}

const roleColors: Record<Role, "blue" | "green" | "gray"> = {
  admin: "blue",
  member: "green",
  viewer: "gray",
}

export function UserManagementSettings({
  users = [],
  currentUser,
  onInviteUser,
  onUpdateUserRole,
  onRemoveUser,
  onResendInvite,
  isLoading = false,
  className,
}: UserManagementSettingsProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>("member")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null)
  const [newRole, setNewRole] = useState<Role>("member")
  const [updateLoading, setUpdateLoading] = useState(false)

  const handleInviteUser = async () => {
    if (!onInviteUser || !inviteEmail.trim()) return

    setInviteLoading(true)
    try {
      await onInviteUser(inviteEmail.trim(), inviteRole)
      setInviteEmail("")
      setInviteRole("member")
      setInviteDialogOpen(false)
    } catch (error) {
      console.error("Invite error:", error)
    } finally {
      setInviteLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!onUpdateUserRole || !editingUser) return

    setUpdateLoading(true)
    try {
      await onUpdateUserRole(editingUser.id, newRole)
      setEditingUser(null)
    } catch (error) {
      console.error("Update role error:", error)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!onRemoveUser) return
    await onRemoveUser(userId)
  }

  const handleResendInvite = async (userId: string) => {
    if (!onResendInvite) return
    await onResendInvite(userId)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  const canManageUser = (user: TeamMember) => {
    if (!currentUser) return false
    if (currentUser.id === user.id) return false // Can't manage yourself
    if (currentUser.role !== "admin") return false
    return true
  }

  return (
    <div className={className}>
      <SettingsSection
        title="User Management"
        description="Manage team members, roles, and permissions"
        actions={
          <RoleGuard allowed={["admin"]} user={currentUser}>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <UserPlus className="h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>Send an invitation to join your organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <SettingsField label="Email Address" required>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </SettingsField>
                  <SettingsField label="Role" description={roleDescriptions[inviteRole]}>
                    <Select value={inviteRole} onValueChange={(value: Role) => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <SaveButton
                    onClick={handleInviteUser}
                    loading={inviteLoading}
                    disabled={!inviteEmail.trim()}
                    size="sm"
                  >
                    Send Invite
                  </SaveButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </RoleGuard>
        }
      >
        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-sm">Invite colleagues to collaborate on sustainability reporting</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "glass-card p-4 rounded-lg border border-gray-200 transition-all duration-200",
                    user.status === "pending" && "bg-yellow-50/50 border-yellow-200",
                    user.status === "inactive" && "bg-gray-50/50 border-gray-200 opacity-75",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          {user.id === currentUser?.id && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">You</span>
                          )}
                          {user.status === "pending" && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              Pending
                            </span>
                          )}
                          {user.status === "inactive" && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.status === "pending"
                            ? `Invited ${formatDate(user.invitedAt)}`
                            : `Last active ${formatDate(user.lastActive)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <RoleBadge role={user.role} variant="border" color={roleColors[user.role]} />

                      <RoleGuard allowed={["admin"]} user={currentUser}>
                        {canManageUser(user) && (
                          <div className="flex items-center gap-1">
                            {/* Edit Role */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser(user)
                                    setNewRole(user.role)
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Update Role</DialogTitle>
                                  <DialogDescription>Change {user.name}'s role and permissions</DialogDescription>
                                </DialogHeader>
                                <SettingsField label="Role" description={roleDescriptions[newRole]}>
                                  <Select value={newRole} onValueChange={(value: Role) => setNewRole(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="member">Member</SelectItem>
                                      <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </SettingsField>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                                    Cancel
                                  </Button>
                                  <SaveButton
                                    onClick={handleUpdateRole}
                                    loading={updateLoading}
                                    disabled={newRole === user.role}
                                    size="sm"
                                  >
                                    Update Role
                                  </SaveButton>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Resend Invite (for pending users) */}
                            {user.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResendInvite(user.id)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                title="Resend invitation"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Remove User */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {user.name} from your organization? This action
                                    cannot be undone and they will lose access to all data and reports.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </RoleGuard>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Role Permissions</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <RoleBadge role="admin" variant="border" color="blue" />
              <span className="text-blue-800">{roleDescriptions.admin}</span>
            </div>
            <div className="flex items-start gap-3">
              <RoleBadge role="member" variant="border" color="green" />
              <span className="text-blue-800">{roleDescriptions.member}</span>
            </div>
            <div className="flex items-start gap-3">
              <RoleBadge role="viewer" variant="border" color="gray" />
              <span className="text-blue-800">{roleDescriptions.viewer}</span>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
