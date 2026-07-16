import * as React from "react";

import { cn } from "@/lib/utils";

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-4 text-sm text-foreground shadow-sm backdrop-blur dark:bg-card/80",
        className,
      )}
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 className={cn("font-semibold", className)} {...props} />;
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-1 leading-6 text-muted-foreground", className)} {...props} />
  );
}

export { Alert, AlertDescription, AlertTitle };
