'use client';

import { StackProvider } from "@stackframe/stack";
import { stackApp } from "@/lib/stack";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackApp}>
      {children}
    </StackProvider>
  );
}