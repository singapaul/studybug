"use client";

// Better Auth does not require a session provider — sessions are managed via
// the authClient directly. This file is kept as a pass-through so that
// app/layout.tsx does not need to be changed, but the wrapper is a no-op.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
