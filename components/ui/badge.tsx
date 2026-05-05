import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
