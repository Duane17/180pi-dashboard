// app/upload/page.tsx (or pages/upload/index.tsx)
"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";

// Wizard container
import { ESGWizard } from "@/components/upload/wizard/esg-wizard";
import type { ESGWizardValues } from "@/types/esg-wizard.types";

// Existing UX
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
// (Keep EmptyState import if you still use it elsewhere)
// import { EmptyState } from "@/components/dashboard/EmptyState";

import { useAuth } from "@/contexts/auth-context";

// Mock user for unauthenticated view
const mockUser = {
  id: "1",
  name: "Maha Chairi",
  email: "Maha@180pi.com",
  role: "admin" as const,
  permissions: ["dashboard.view", "data.validate", "reports.generate"],
};

export default function UploadPage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();

  // Use real user when available; otherwise fallback to mock user
  const shellUser = useMemo(
    () =>
      (authUser
        ? {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            role: "admin" as const, // keep if AppShell expects it
          }
        : {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          }),
    [authUser]
  );

  // Phase 1: capture-only
  const handleWizardSubmit = (values: ESGWizardValues) => {
    console.log("ESG Wizard submit (Phase 1):", values);
  };

  return (
    <AppShell currentUser={shellUser}>
      {/* Background layer: soft gradient wash + floating blobs for depth */}
      <div className="relative min-h-[calc(100vh-64px)]">
        {/* page backdrop gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#31689a] via-[#7a4aa0] to-[#89c7d6] opacity-25" />
        {/* subtle blobs */}
        <div className="pointer-events-none absolute -top-16 -right-10 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c] blur-3xl opacity-25" />
        <div className="pointer-events-none absolute bottom-0 left-6 -z-10 h-64 w-64 rounded-full bg-gradient-to-tr from-[#3270a1] via-[#7e509c] to-[#8dcddb] blur-3xl opacity-20" />

        {authLoading ? (
          // Glassy panel for loading state
          <div className="mx-auto mt-16 max-w-5xl rounded-2xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
            <div className="space-y-6">
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-10">
            {/* Optional demo ribbon when unauthenticated */}
            {!isAuthenticated && (
              <div className="mb-4 rounded-xl border border-white/20 bg-white/40 px-4 py-2 text-sm text-gray-800 backdrop-blur-xl">
                <span className="font-medium">Demo mode:</span> 
              </div>
            )}

            {/* Header block with glass and gradient accent */}
            <div className="rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
              <div className="flex flex-col gap-2">
                <h1
                  id="esg-uploads-top"
                  className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent"
                >
                  Sustainabilty Intelligence Uploads
                </h1>
                <p className="text-sm text-gray-700">
                  Complete the 4-step wizard to provide your company’s Sustainability Intelligence
                  details and supporting documents.
                </p>
                {/* gradient accent line */}
                <div className="mt-2 h-px w-full bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb]" />
              </div>
            </div>

            {/* Wizard card — elevated, glassy surface */}
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/40 p-6 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/25">
              {/* The wizard owns all form state, steps, validation, and persistence */}
              <ESGWizard onSubmit={handleWizardSubmit} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
