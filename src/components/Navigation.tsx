"use client"

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Sign } from "crypto";
import { SignOutButton } from "./SignOutButton";

export default function Navigation() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <nav className="flex gap-4">
      {session ? (
        <>
          <Button asChild>
            <Link href="/admin/editor">Write</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin">Dashboard</Link>
          </Button>
          <SignOutButton />
        </>
      ) : (
        <Button asChild>
          <Link href="/signin">Sign In</Link>
        </Button>
      )}
    </nav>
  );
}