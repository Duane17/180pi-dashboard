"use client";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { MobileSidebarToggle } from "./MobileSidebarToggle";
import { UserMenu } from "@/components/profile/UserMenu";
import { useAuth } from "@/contexts/auth-context";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";

interface TopbarProps {
  onMenuClick: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onSwitchCompany?: () => void;
  onSignOut?: () => void;
}

export function Topbar({
  onMenuClick,
  onProfile,
  onSettings,
  onSwitchCompany,
  onSignOut,
}: TopbarProps) {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const logout = useLogoutMutation();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  const shellUser = useMemo(
    () =>
      authUser
        ? {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            role: "admin" as const,
          }
        : undefined,
    [authUser]
  );

  const handleSignOut = () => {
    if (onSignOut) return onSignOut();
    logout.mutate();
  };

  // Don’t render until we know auth state; avoids flicker & accidental renders
  if (isLoading || !isAuthenticated || !shellUser) return null;

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-white/20 backdrop-blur-xl" role="banner">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <MobileSidebarToggle onClick={onMenuClick} />

        <div className="flex items-center gap-3 ml-auto pr-2">
          <button
            className="relative p-2 text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-white/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3270a1]/20"
            aria-label="Notifications (1 unread)"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                // handle notification click
              }
            }}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-[#8dcddb] to-[#3270a1] rounded-full" />
          </button>

          <UserMenu
            currentUser={shellUser}
            onProfile={onProfile}
            onSettings={onSettings}
            onSwitchCompany={onSwitchCompany}
            onSignOut={handleSignOut}
            showPresenceIndicator={true}
          />
        </div>
      </div>
    </header>
  );
}
