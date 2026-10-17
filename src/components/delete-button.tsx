"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteCandidate } from "@/actions/candidates";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn-danger"
      onClick={() => {
        if (window.confirm(`Delete ${name}? This also removes their stage history and can't be undone.`)) {
          startTransition(() => deleteCandidate(id));
        }
      }}
    >
      <Trash2 size={15} /> {pending ? "Deleting" : "Delete"}
    </button>
  );
}
