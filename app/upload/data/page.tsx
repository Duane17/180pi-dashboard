"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ESGWizard } from "@/components/upload/wizard/esg-wizard";
import type { ESGWizardValues } from "@/types/esg-wizard.types";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useAuth } from "@/contexts/auth-context";

type AppShellUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatarUrl?: string;
};

export default function UploadPage() {
  const { user: authUser, isAuthenticated, isLoading, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only decide after auth is READY
    if (isReady && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isReady, isAuthenticated, router]);

  // Derive the shell user as a plain value (not a hook) to keep hook order stable
  const shellUser: AppShellUser | null = authUser
    ? {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: "admin",
        // avatarUrl: (authUser as any)?.avatarUrl,
      }
    : null;

  // While loading, or while redirecting unauth’d users, show a skeleton or null
  if (!isReady || isLoading || !isAuthenticated || !shellUser) {
    return (
      <div className="mx-auto mt-16 max-w-5xl rounded-2xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
        <div className="space-y-6">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  const handleWizardSubmit = (values: ESGWizardValues) => {
    console.log("ESG Wizard submit (Phase 1):", values);
  };

  return (
    <AppShell currentUser={shellUser}>
      <div className="relative min-h-[calc(100vh-64px)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#31689a] via-[#7a4aa0] to-[#89c7d6] opacity-25" />
        <div className="pointer-events-none absolute -top-16 -right-10 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] blur-3xl opacity-25" />
        <div className="pointer-events-none absolute bottom-0 left-6 -z-10 h-64 w-64 rounded-full bg-gradient-to-tr from-[#3270a1] via-[#7e509c] to-[#8dcddb] blur-3xl opacity-20" />

        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
            <div className="flex flex-col gap-2">
              <h1
                id="esg-uploads-top"
                className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent"
              >
                Sustainability Intelligence Uploads
              </h1>
              <p className="text-sm text-gray-700">
                Complete the 4-step wizard to provide your company’s Sustainability Intelligence details and
                supporting documents.
              </p>
              <div className="mt-2 h-px w-full bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb]" />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/20 bg-white/40 p-6 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
            <ESGWizard onSubmit={handleWizardSubmit} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
