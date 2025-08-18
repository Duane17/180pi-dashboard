"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";

type Props = {
  children: React.ReactNode;
  redirectTo?: string; // default "/auth"
};

export function RequireAuth({ children, redirectTo = "/auth" }: Props) {
  const router = useRouter();
  const { isAuthenticated, isLoading, authReady } = useAuth();

  useEffect(() => {
    if (!authReady) return; // wait until initial auth pass is complete
    if (!isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [authReady, isAuthenticated, redirectTo, router]);

  // While loading/hydrating/validating, show a neutral skeleton
  if (isLoading || !authReady) {
    return (
      <div className="mx-auto mt-16 max-w-5xl rounded-2xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
        <div className="space-y-6">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // If ready and unauthenticated, we’re navigating away; render a small hint
  if (!isAuthenticated) {
    return (
      <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
        <EmptyState title="Redirecting to sign in" description="Please sign in to continue." />
      </div>
    );
  }

  return <>{children}</>;
}
