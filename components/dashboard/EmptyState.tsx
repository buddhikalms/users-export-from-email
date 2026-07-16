import Link from "next/link";
import type { ElementType } from "react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon: Icon,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-card/75 p-10 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6">
        <Link href={actionHref as "/"}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
