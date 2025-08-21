"use client";

import { UserButton } from "@/components/user-button";
import { useUser } from "@stackframe/stack";

export function Header() {
  const user = useUser();
  const userName = user?.clientMetadata?.name || user?.displayName || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 flex p-10 justify-between">
          <h1 className="text-lg font-semibold">{userName}&apos;s Dashboard</h1>
        </div>
        <UserButton />
      </div>
    </header>
  );
}