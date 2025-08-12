"use client"

import type React from "react"
import { isAuthorized } from "./authz"

interface RoleGuardProps {
  /**
   * Allowed roles for access
   */
  allowed?: Array<"admin" | "member" | "viewer">

  /**
   * Required permissions for fine-grained access control
   */
  permissions?: string[]

  /**
   * User object - if not provided, will need to be obtained from context
   */
  user?: { role: string; permissions?: string[] } | null

  /**
   * Fallback component to render when access is denied
   */
  fallback?: React.ReactNode

  /**
   * Children to render when access is granted
   */
  children: React.ReactNode

  /**
   * Additional className for wrapper
   */
  className?: string
}

/**
 * RoleGuard component for protecting UI elements based on user roles and permissions
 *
 * @example
 * // Role-based protection
 * <RoleGuard allowed={["admin", "member"]}>
 *   <EditButton />
 * </RoleGuard>
 *
 * @example
 * // Permission-based protection
 * <RoleGuard permissions={["users.delete"]} fallback={<DisabledButton />}>
 *   <DeleteButton />
 * </RoleGuard>
 *
 * @example
 * // Combined role and permission check
 * <RoleGuard allowed={["admin"]} permissions={["reports.export"]}>
 *   <ExportButton />
 * </RoleGuard>
 */
export function RoleGuard({ allowed, permissions, user, fallback = null, children, className }: RoleGuardProps) {
  // If no user provided, you would typically get it from context
  // For now, we'll assume it needs to be passed as a prop
  if (!user) {
    // In a real app, you might get user from context here
    // const { user } = useAuth()
    return fallback
  }

  const hasAccess = isAuthorized({
    user,
    roles: allowed,
    permissions,
  })

  if (!hasAccess) {
    return fallback
  }

  // If className is provided, wrap in a div
  if (className) {
    return <div className={className}>{children}</div>
  }

  return <>{children}</>
}

/**
 * Higher-Order Component version of RoleGuard
 *
 * @example
 * const ProtectedComponent = withRoleGuard(MyComponent, {
 *   allowed: ["admin"],
 *   fallback: <AccessDenied />
 * })
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RoleGuardProps, "children">,
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleGuard {...guardProps}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}

/**
 * Hook for checking authorization in components
 *
 * @example
 * const canEdit = useAuthorization({ roles: ["admin", "member"] })
 * const canDelete = useAuthorization({ permissions: ["users.delete"] })
 */
export function useAuthorization({
  user,
  roles,
  permissions,
}: {
  user?: { role: string; permissions?: string[] } | null
  roles?: string[]
  permissions?: string[]
}) {
  // In a real app, you would get user from context if not provided
  // const { user: contextUser } = useAuth()
  // const currentUser = user || contextUser

  return isAuthorized({
    user: user || null,
    roles,
    permissions,
  })
}
