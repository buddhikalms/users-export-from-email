"use client";

import { Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

import { CTAButtons } from "@/components/marketing/CTAButtons";
import { HeroBackground } from "@/components/marketing/HeroBackground";
import { HeroIllustration } from "@/components/marketing/HeroIllustration";
import { Stats } from "@/components/marketing/Stats";
import { WorkflowAnimation } from "@/components/marketing/WorkflowAnimation";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 70, damping: 22 });
  const y = useSpring(pointerY, { stiffness: 70, damping: 22 });
  const illustrationX = useTransform(x, [-1, 1], [-10, 10]);
  const illustrationY = useTransform(y, [-1, 1], [-8, 8]);
  const rotateX = useTransform(y, [-1, 1], [2.5, -2.5]);
  const rotateY = useTransform(x, [-1, 1], [-3.5, 3.5]);

  return (
    <section
      className="relative isolate overflow-hidden border-b border-slate-200/70"
      onMouseMove={(event) => {
        if (reduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
        pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
      }}
      onMouseLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <HeroBackground x={x} y={y} />
      <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-4 xl:grid-cols-[0.94fr_1.06fr]">
          <motion.div
            className="relative z-20 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.09 } },
            }}
          >
            <motion.h1
              className="mt-7 text-[2.75rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[4.2rem] xl:text-[4.7rem]"
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              The Om Place For{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Zen Contact Management
              </span>
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:mx-0"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0 },
              }}
            >
<<<<<<< HEAD
              OMAZYNC helps businesses automatically extract valuable contacts
=======
              Omazync helps businesses automatically extract valuable contacts
>>>>>>> 5d8ace5 (security: fix vulnerbilities, load testing)
              from Outlook, Microsoft 365, Exchange, and IMAP email accounts,
              remove duplicates, organize contacts, and sync directly to your
              favorite marketing platforms.
            </motion.p>
            <motion.div
              className="mt-8 flex justify-center lg:justify-start"
              variants={{
                hidden: { opacity: 0, x: -18 },
                show: { opacity: 1, x: 0 },
              }}
            >
              <CTAButtons />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Stats />
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-10 mx-auto w-full max-w-2xl [perspective:1200px]"
            style={
              reduceMotion
                ? undefined
                : { x: illustrationX, y: illustrationY, rotateX, rotateY }
            }
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          <WorkflowAnimation />
        </motion.div>
      </div>
    </section>
  );
}
