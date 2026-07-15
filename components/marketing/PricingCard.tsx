import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingCard({
  description,
  featured = false,
  name,
  price,
  features,
}: {
  description: string;
  featured?: boolean;
  name: string;
  price: string;
  features: string[];
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border p-6 shadow-sm",
        featured
          ? "border-brand-blue bg-slate-950 text-white shadow-xl shadow-brand-blue/15"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]",
      )}
    >
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className={cn("mt-2 text-sm leading-6", featured ? "text-slate-300" : "text-slate-600 dark:text-slate-300")}>
        {description}
      </p>
      <div className="mt-6 text-4xl font-semibold">{price}</div>
      <Button asChild className={cn("mt-6", featured ? "bg-white text-slate-950 hover:bg-slate-100" : "")}>
        <Link href={(name === "Enterprise" ? "/book-demo" : "/register") as any}>{name === "Enterprise" ? "Contact Sales" : "Start Free"}</Link>
      </Button>
      <ul className="mt-6 grid gap-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <Check className={cn("mt-0.5 h-4 w-4 shrink-0", featured ? "text-brand-light-purple" : "text-brand-blue")} />
            <span className={featured ? "text-slate-200" : "text-slate-700 dark:text-slate-200"}>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
