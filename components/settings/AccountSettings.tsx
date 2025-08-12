"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SettingsSection } from "./SettingsSection"
import { SettingsField } from "./SettingsField"
import { SaveButton } from "./SaveButton"
import { DiscardButton } from "./DiscardButton"
import type { User } from "@/components/rbac/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Camera, Eye, EyeOff, Bell, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().optional(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const preferencesSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    reports: z.boolean(),
    updates: z.boolean(),
  }),
})

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>
type PreferencesData = z.infer<typeof preferencesSchema>

interface AccountSettingsProps {
  user?: User
  preferences?: PreferencesData
  onUpdateProfile?: (data: ProfileData) => Promise<void>
  onChangePassword?: (data: PasswordData) => Promise<void>
  onUpdatePreferences?: (data: PreferencesData) => Promise<void>
  onUploadAvatar?: (file: File) => Promise<string>
  isLoading?: boolean
  className?: string
}

const languages = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
]

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
]

const dateFormats = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (EU)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
]

export function AccountSettings({
  user,
  preferences,
  onUpdateProfile,
  onChangePassword,
  onUpdatePreferences,
  onUploadAvatar,
  isLoading = false,
  className,
}: AccountSettingsProps) {
  const [profileSaveState, setProfileSaveState] = useState<"idle" | "loading" | "success">("idle")
  const [passwordSaveState, setPasswordSaveState] = useState<"idle" | "loading" | "success">("idle")
  const [preferencesSaveState, setPreferencesSaveState] = useState<"idle" | "loading" | "success">("idle")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Profile form
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatarUrl: user?.avatarUrl || "",
    },
  })

  // Password form
  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Preferences form
  const preferencesForm = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: preferences?.language || "en",
      timezone: preferences?.timezone || "UTC",
      dateFormat: preferences?.dateFormat || "MM/DD/YYYY",
      notifications: {
        email: preferences?.notifications?.email ?? true,
        push: preferences?.notifications?.push ?? true,
        reports: preferences?.notifications?.reports ?? true,
        updates: preferences?.notifications?.updates ?? false,
      },
    },
  })

  const handleProfileSave = async (data: ProfileData) => {
    if (!onUpdateProfile) return

    setProfileSaveState("loading")
    try {
      await onUpdateProfile(data)
      setProfileSaveState("success")
      setTimeout(() => setProfileSaveState("idle"), 2000)
    } catch (error) {
      setProfileSaveState("idle")
      console.error("Profile save error:", error)
    }
  }

  const handlePasswordSave = async (data: PasswordData) => {
    if (!onChangePassword) return

    setPasswordSaveState("loading")
    try {
      await onChangePassword(data)
      setPasswordSaveState("success")
      passwordForm.reset()
      setTimeout(() => setPasswordSaveState("idle"), 2000)
    } catch (error) {
      setPasswordSaveState("idle")
      console.error("Password change error:", error)
    }
  }

  const handlePreferencesSave = async (data: PreferencesData) => {
    if (!onUpdatePreferences) return

    setPreferencesSaveState("loading")
    try {
      await onUpdatePreferences(data)
      setPreferencesSaveState("success")
      setTimeout(() => setPreferencesSaveState("idle"), 2000)
    } catch (error) {
      setPreferencesSaveState("idle")
      console.error("Preferences save error:", error)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onUploadAvatar) return

    setAvatarUploading(true)
    try {
      const avatarUrl = await onUploadAvatar(file)
      profileForm.setValue("avatarUrl", avatarUrl, { shouldDirty: true })
    } catch (error) {
      console.error("Avatar upload error:", error)
    } finally {
      setAvatarUploading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Profile Settings */}
      <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
        <SettingsSection
          title="Profile Information"
          description="Update your personal information and profile picture"
          actions={
            <div className="flex items-center gap-3">
              <DiscardButton
                onClick={() => profileForm.reset()}
                disabled={!profileForm.formState.isDirty || profileSaveState === "loading"}
              />
              <SaveButton
                type="submit"
                disabled={!profileForm.formState.isDirty}
                loading={profileSaveState === "loading"}
                success={profileSaveState === "success"}
              />
            </div>
          }
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileForm.watch("avatarUrl") || "/placeholder.svg"} alt={user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                  {getInitials(profileForm.watch("name") || user?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={avatarUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={avatarUploading}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Camera className="h-4 w-4" />
                  {avatarUploading ? "Uploading..." : "Change Photo"}
                </Button>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Full Name" error={profileForm.formState.errors.name?.message} required>
                  <Input {...profileForm.register("name")} placeholder="Enter your full name" />
                </SettingsField>

                <SettingsField label="Email Address" error={profileForm.formState.errors.email?.message} required>
                  <Input {...profileForm.register("email")} type="email" placeholder="Enter your email" />
                </SettingsField>
              </div>
            </div>
          </div>
        </SettingsSection>
      </form>

      {/* Security Settings */}
      <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)}>
        <SettingsSection
          title="Security"
          description="Change your password and manage security settings"
          actions={
            <div className="flex items-center gap-3">
              <DiscardButton
                onClick={() => passwordForm.reset()}
                disabled={!passwordForm.formState.isDirty || passwordSaveState === "loading"}
              />
              <SaveButton
                type="submit"
                disabled={!passwordForm.formState.isDirty}
                loading={passwordSaveState === "loading"}
                success={passwordSaveState === "success"}
              >
                Update Password
              </SaveButton>
            </div>
          }
        >
          <div className="max-w-md space-y-4">
            <SettingsField
              label="Current Password"
              error={passwordForm.formState.errors.currentPassword?.message}
              required
            >
              <div className="relative">
                <Input
                  {...passwordForm.register("currentPassword")}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </SettingsField>

            <SettingsField
              label="New Password"
              description="Must be at least 8 characters long"
              error={passwordForm.formState.errors.newPassword?.message}
              required
            >
              <div className="relative">
                <Input
                  {...passwordForm.register("newPassword")}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </SettingsField>

            <SettingsField
              label="Confirm New Password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              required
            >
              <div className="relative">
                <Input
                  {...passwordForm.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </SettingsField>
          </div>
        </SettingsSection>
      </form>

      {/* Preferences */}
      <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSave)}>
        <SettingsSection
          title="Preferences"
          description="Customize your experience and notification settings"
          actions={
            <div className="flex items-center gap-3">
              <DiscardButton
                onClick={() => preferencesForm.reset()}
                disabled={!preferencesForm.formState.isDirty || preferencesSaveState === "loading"}
              />
              <SaveButton
                type="submit"
                disabled={!preferencesForm.formState.isDirty}
                loading={preferencesSaveState === "loading"}
                success={preferencesSaveState === "success"}
              />
            </div>
          }
        >
          <div className="space-y-6">
            {/* Localization */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4">
                <Globe className="h-4 w-4" />
                Localization
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SettingsField label="Language">
                  <Select
                    value={preferencesForm.watch("language")}
                    onValueChange={(value) => preferencesForm.setValue("language", value, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField label="Timezone">
                  <Select
                    value={preferencesForm.watch("timezone")}
                    onValueChange={(value) => preferencesForm.setValue("timezone", value, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField label="Date Format">
                  <Select
                    value={preferencesForm.watch("dateFormat")}
                    onValueChange={(value) => preferencesForm.setValue("dateFormat", value, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4">
                <Bell className="h-4 w-4" />
                Notifications
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferencesForm.watch("notifications.email")}
                    onCheckedChange={(checked) =>
                      preferencesForm.setValue("notifications.email", checked, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-xs text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={preferencesForm.watch("notifications.push")}
                    onCheckedChange={(checked) =>
                      preferencesForm.setValue("notifications.push", checked, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="report-notifications" className="text-sm font-medium">
                      Report Updates
                    </Label>
                    <p className="text-xs text-gray-600">Get notified when reports are ready</p>
                  </div>
                  <Switch
                    id="report-notifications"
                    checked={preferencesForm.watch("notifications.reports")}
                    onCheckedChange={(checked) =>
                      preferencesForm.setValue("notifications.reports", checked, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="update-notifications" className="text-sm font-medium">
                      Product Updates
                    </Label>
                    <p className="text-xs text-gray-600">Learn about new features and improvements</p>
                  </div>
                  <Switch
                    id="update-notifications"
                    checked={preferencesForm.watch("notifications.updates")}
                    onCheckedChange={(checked) =>
                      preferencesForm.setValue("notifications.updates", checked, { shouldDirty: true })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>
      </form>
    </div>
  )
}
