"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { addNote, deleteNote, type FormState } from "@/actions/candidates";
import { formatDateTime } from "@/lib/utils";

export type NoteItem = { id: string; body: string; author: string | null; createdAt: string };

export function Notes({ candidateId, notes }: { candidateId: string; notes: NoteItem[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addNote.bind(null, candidateId), {});
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.values?.saved) ref.current?.reset();
  }, [state]);

  return (
    <div>
      <form ref={ref} action={action} className="space-y-2">
        <label htmlFor="note-body" className="sr-only">
          Add a note
        </label>
        <textarea id="note-body" name="body" rows={3} maxLength={2000} placeholder="Add a note about this candidate" className="field resize-y" />
        {(state.errors?.body?.[0] || state.message) && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {state.errors?.body?.[0] ?? state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-ghost">
          {pending && <Loader2 size={15} className="animate-spin" />} Add note
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="mt-5 text-sm text-muted">No notes yet. Interview feedback and observations go here.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {notes.map((n) => (
            <li key={n.id} className="group flex items-start justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{n.body}</p>
                <p className="mt-1 text-xs text-muted">
                  {n.author ? `${n.author} · ` : ""}
                  {formatDateTime(n.createdAt)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Delete note"
                onClick={() => {
                  if (window.confirm("Delete this note?")) startTransition(() => deleteNote(n.id));
                }}
                className="rounded-lg p-1.5 text-muted opacity-60 hover:bg-canvas hover:text-rose-700 hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
