// app/components/Navbar.tsx
import Link from "next/link";
import Image from "next/image";
import { auth, signOut, signIn } from "@/auth";
import { BadgePlus, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

/* ---------- SERVER ACTIONS ---------- */
export async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function loginAction() {
  "use server";
  await signIn("github");
}

/* ---------- SERVER COMPONENT ---------- */
const Navbar = async () => {
  const session = await auth();

  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={144} height={30} />
        </Link>

        <div className="flex items-center gap-5 text-black">
          {session && session.user ? (
            <>
              <Link href="/startup/create">
                <span className="hidden sm:inline">Create</span>
                <BadgePlus className="size-6 sm:hidden"/>
              </Link>

              {/* Logout using Server Action */}
              <form action={logoutAction}>
                <button type="submit">
                  <span className="hidden sm:inline">Logout</span>
                  <LogOut className="h-6 w-6 sm:hidden text-red-500" />
                </button>
              </form>



              <Link href={`/user/${session.id}`}>
                <Avatar className="size-10">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ' '} />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            /* Login using Server Action */
            <form action={loginAction}>
              <button type="submit">Login</button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;