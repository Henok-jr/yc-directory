"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteStartup } from "@/lib/actions";

export default function DeleteStartupButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        const ok = window.confirm("Delete this startup? This cannot be undone.");
        if (!ok) return;

        startTransition(async () => {
          const res = await deleteStartup(id);
          if (res?.status === "SUCCESS") {
            router.push("/");
            router.refresh();
          } else {
            alert(res?.error || "Could not delete startup");
          }
        });
      }}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
