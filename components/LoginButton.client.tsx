"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        Login
      </Button>

      {open ? (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg">
          <button
            className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
            onClick={() => signIn("github")}
          >
            Continue with GitHub
          </button>
          <button
            className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
            onClick={() => signIn("google")}
          >
            Continue with Google
          </button>
        </div>
      ) : null}
    </div>
  );
}
