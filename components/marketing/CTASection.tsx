import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white shadow-2xl shadow-slate-950/20 sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Extract. Clean. Sync.</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Start building your contact database from the inbox you already use.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Connect Outlook or IMAP, clean duplicates, export to Excel, and route contacts to your marketing stack.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
            <Link href={"/register" as any}>
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
            <Link href={"/contact" as any}>View Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
