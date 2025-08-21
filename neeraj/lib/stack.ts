"use client";

import { StackClientApp } from "@stackframe/stack";

export const stackApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
});