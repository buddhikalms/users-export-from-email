"use client";

import type { MotionValue } from "framer-motion";
import { motion, useReducedMotion, useTransform } from "framer-motion";

const particles = [
  [8, 18, 5], [16, 72, 3], [25, 32, 4], [36, 84, 5], [48, 12, 3],
  [57, 62, 4], [66, 25, 5], [75, 78, 3], [84, 42, 4], [94, 16, 3],
] as const;

export function HeroBackground({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();
  const meshX = useTransform(x, [-1, 1], [-20, 20]);
  const meshY = useTransform(y, [-1, 1], [-14, 14]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
<<<<<<< HEAD
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_72%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(3,183,178,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,127,212,0.055)_1px,transparent_1px)] bg-[size:58px_58px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      <motion.div style={{ x: meshX, y: meshY }} className="absolute inset-0">
        <motion.div
          className="absolute -left-40 top-8 h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-[120px]"
=======
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#FDFDFD_0%,#F2F8FF_52%,#FDFDFD_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(4,130,230,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(1,188,182,0.06)_1px,transparent_1px)] bg-[size:58px_58px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      <motion.div style={{ x: meshX, y: meshY }} className="absolute inset-0">
        <motion.div
          className="absolute -left-40 top-8 h-[30rem] w-[30rem] rounded-full bg-brand-light-purple/25 blur-[120px]"
>>>>>>> 218bcf8 (feature : load balance)
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], x: [0, 28, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
<<<<<<< HEAD
          className="absolute right-[-8rem] top-20 h-[32rem] w-[32rem] rounded-full bg-secondary/20 blur-[130px]"
          animate={reduceMotion ? undefined : { scale: [1.05, 0.96, 1.05], y: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute left-[42%] top-[15%] h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
=======
          className="absolute right-[-8rem] top-20 h-[32rem] w-[32rem] rounded-full bg-brand-turquoise/20 blur-[130px]"
          animate={reduceMotion ? undefined : { scale: [1.05, 0.96, 1.05], y: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute left-[42%] top-[15%] h-72 w-72 rounded-full bg-brand-blue/15 blur-[100px]" />
>>>>>>> 218bcf8 (feature : load balance)
      </motion.div>
      {particles.map(([left, top, size], index) => (
        <motion.span
          key={`${left}-${top}`}
<<<<<<< HEAD
          className="absolute rounded-full bg-primary/45 shadow-[0_0_12px_rgba(3,183,178,0.55)]"
=======
          className="absolute rounded-full bg-brand-turquoise/50 shadow-[0_0_12px_rgba(1,188,182,0.55)]"
>>>>>>> 218bcf8 (feature : load balance)
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
          animate={reduceMotion ? undefined : { opacity: [0.2, 0.8, 0.2], y: [0, -10, 0] }}
          transition={{ duration: 4 + (index % 3), delay: index * 0.25, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
