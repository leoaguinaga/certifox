"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { switchOrganizationAction } from "../actions";

export interface OrganizationOption {
  id: string;
  name: string;
  role: string;
}

/** Selector de organización activa (solo se muestra si el usuario pertenece a varias). */
export function OrganizationSwitcher({ options, activeId }: { options: OrganizationOption[]; activeId: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (options.length < 2) return null;

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      <label htmlFor="org-switcher" className="font-semibold text-stone-500">
        Organización
      </label>
      <select
        id="org-switcher"
        disabled={pending}
        value={activeId ?? ""}
        onChange={(e) =>
          startTransition(async () => {
            const res = await switchOrganizationAction(e.target.value);
            if (!res.success) toast.error(res.error);
            else router.refresh();
          })
        }
        className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 font-semibold text-stone-800"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} · {o.role}
          </option>
        ))}
      </select>
    </div>
  );
}
