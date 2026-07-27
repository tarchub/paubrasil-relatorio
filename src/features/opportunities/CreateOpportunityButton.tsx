"use client";

import { useTransition } from "react";
import { IconBulb } from "@/components/icons";
import { createOpportunityFromContent } from "./actions";

export function CreateOpportunityButton({ contentId }: { contentId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => createOpportunityFromContent(contentId))}
      className="btn-primary"
    >
      <IconBulb width={16} height={16} />
      {pending ? "Criando…" : "Transformar em oportunidade"}
    </button>
  );
}
