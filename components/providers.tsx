"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initAuthTokens } from "@/lib/auth-tokens";
import { AuthProvider } from "@/contexts/auth-context";
import { setAuthFailureHandler } from "@/lib/api"; // ⬅️ register redirect-on-auth-failure

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient only once per mount
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })
  );

  const router = useRouter();

  // Initialize token memory from localStorage on mount
  useEffect(() => {
    initAuthTokens();

    // When the API client can't refresh (or no refresh token), redirect to login
    setAuthFailureHandler(({ message, details } = {}) => {
      // Optional: surface info somewhere (toast/log). Avoiding toast import here for portability.
      if (message) console.warn("Auth failure:", message, details ?? []);
      router.replace("/login");
    });

    // Cleanup on unmount
    return () => setAuthFailureHandler(() => {});
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}