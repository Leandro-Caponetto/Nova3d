import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useInView } from 'motion/react';
import { cn } from '../../lib/utils';

export function Stat({ label, value, theme }: { label: string, value: string, theme?: 'dark' | 'light' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Parsing the numeric part of the value (e.g., "2.4" from "2.4k+")
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '');
  
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView) {
      springValue.set(numericPart);
    }
  }, [isInView, numericPart, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (numericPart % 1 !== 0) {
        setDisplayValue(latest.toFixed(1));
      } else {
        setDisplayValue(Math.floor(latest).toString());
      }
    });
  }, [springValue, numericPart]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      className="flex flex-col items-center group cursor-default"
    >
      <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-zinc-800 dark:text-zinc-200 group-hover:text-primary transition-colors duration-500 mb-2">
        {isNaN(numericPart) || numericPart === 0 ? value : `${displayValue}${suffix}`}
      </span>
      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 drop-shadow-sm">{label}</span>
    </motion.div>
  );
}
