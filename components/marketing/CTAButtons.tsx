import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CTAButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
<<<<<<< HEAD
      <Button asChild size="lg" className="h-[3.25rem] bg-primary px-7 text-white shadow-[0_14px_34px_-12px_rgba(3,183,178,0.65)] hover:bg-primary/90">
        <Link href="/register">Start Free <ArrowRight className="h-4 w-4" /></Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="h-[3.25rem] border-slate-300 bg-white/75 px-7 text-slate-700 shadow-sm backdrop-blur hover:bg-white">
        <Link href="/contact"><Play className="h-4 w-4 fill-secondary text-secondary" /> View Live Demo</Link>
=======
      <Button asChild size="lg" className="h-[3.25rem] bg-brand-turquoise px-7 text-white shadow-[0_14px_34px_-12px_rgba(1,188,182,0.65)] hover:bg-brand-blue">
        <Link href="/register">Start Free <ArrowRight className="h-4 w-4" /></Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="h-[3.25rem] border-brand-blue/25 bg-white/75 px-7 text-brand-navy shadow-sm backdrop-blur hover:bg-white hover:text-brand-blue">
        <Link href="/contact"><Play className="h-4 w-4 fill-brand-blue text-brand-blue" /> View Live Demo</Link>
>>>>>>> 218bcf8 (feature : load balance)
      </Button>
    </div>
  );
}
