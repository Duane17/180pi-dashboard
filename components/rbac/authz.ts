interface AuthzArgs {
  user: { role: string; permissions?: string[] } | null
  roles?: string[]
  permissions?: string[]
}

/**
 * Check if a user is authorized based on roles and/or permissions
 */
export function isAuthorized({ user, roles, permissions }: AuthzArgs): boolean {
  if (!user) return false

  // Check role-based authorization
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return false
    }
  }

  // Check permission-based authorization
  if (permissions && permissions.length > 0) {
    if (!user.permissions || user.permissions.length === 0) {
      return false
    }

    // User must have ALL required permissions
    const hasAllPermissions = permissions.every((permission) => user.permissions?.includes(permission))

    if (!hasAllPermissions) {
      return false
    }
  }

  return true
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: { role: string } | null): boolean {
  return user?.role === "admin"
}

/**
 * Check if user has admin or member role
 */
export function canEdit(user: { role: string } | null): boolean {
  return user?.role === "admin" || user?.role === "member"
}

/**
 * Check if user can view content (any authenticated user)
 */
export function canView(user: { role: string } | null): boolean {
  return Boolean(user?.role)
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: string): number {
  const roleLevels: Record<string, number> = {
    viewer: 1,
    member: 2,
    admin: 3,
  }
  return roleLevels[role] || 0
}

/**
 * Check if user role is at least the required level
 */
export function hasMinimumRole(user: { role: string } | null, minimumRole: string): boolean {
  if (!user) return false
  return getRoleLevel(user.role) >= getRoleLevel(minimumRole)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: { permissions?: string[] } | null, permissions: string[]): boolean {
  if (!user?.permissions || permissions.length === 0) return false
  return permissions.some((permission) => user.permissions?.includes(permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: { permissions?: string[] } | null, permissions: string[]): boolean {
  if (!user?.permissions || permissions.length === 0) return false
  return permissions.every((permission) => user.permissions?.includes(permission))
}
