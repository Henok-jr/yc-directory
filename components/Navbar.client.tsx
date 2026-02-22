"use client"

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { BadgePlus, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import React from "react";

export default function NavbarClient() {
  const { data: session } = useSession();

  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={144} height={30} />
        </Link>

        <div className="flex items-center gap-5 text-black">
          {session ? (
            <>
              <Link href="/startup/create">
                <span className="hidden sm:inline">Create</span>
                <BadgePlus className="size-6 sm:hidden" />
              </Link>

              <button onClick={() => signOut({ callbackUrl: "/" })}>
                <span className="hidden sm:inline">Logout</span>
                <LogOut className="h-6 w-6 sm:hidden text-red-500" />
              </button>

              <Link href={`/user/${session.user?.id}`}>
                <Avatar className="size-10">
                  <AvatarImage src={(session.user as any)?.image || ""} alt={(session.user as any)?.name || ""} />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <button onClick={() => signIn('github')}>Login</button>
          )}
        </div>
      </nav>
    </header>
  );
}
