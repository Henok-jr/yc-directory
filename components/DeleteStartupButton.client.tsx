"use client";

import { Button } from "@/components/ui/button";

export default function DeleteStartupButton({
  children = "Delete",
}: {
  children?: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      className="startup-card_btn bg-red-600"
      onClick={(e) => {
        const ok = window.confirm(
          "Delete this startup? This cannot be undone."
        );
        if (!ok) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
