'use client';

import { motion } from "framer-motion";
import clsx from "clsx";

interface HeroBackgroundProps {
  className?: string;
}

export default function HeroBackground({ className }: HeroBackgroundProps) {
  return (
    <>
      <motion.div
        className={clsx("absolute inset-0 z-0", className)}
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg,  #b6deb0 40%, #86c086 75%, #4f7f5a 100% , #235450 100% , #1c3240 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={clsx("absolute inset-0 z-0", className)}
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 45%), radial-gradient(circle at 80% 60%, rgba(177,158,239,0.25) 0%, rgba(177,158,239,0) 55%)",
          backgroundSize: "180% 180%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 50%", "0% 0%"],
        }}
        transition={{ duration: 100, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

