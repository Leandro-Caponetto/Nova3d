import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { cn } from '../../lib/utils';

const TRAIL_COUNT = 8;

export function CustomCursor({ theme }: { theme: 'dark' | 'light' }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Main mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const ringX = useSpring(mouseX, { damping: 20, stiffness: 200 });
  const ringY = useSpring(mouseY, { damping: 20, stiffness: 200 });
  
  // Extra springs for a "Light Beam" trail
  const beamX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const beamY = useSpring(mouseY, { damping: 25, stiffness: 150 });
  const beam2X = useSpring(mouseX, { damping: 30, stiffness: 120 });
  const beam2Y = useSpring(mouseY, { damping: 30, stiffness: 120 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.getAttribute('role') === 'button';
      
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden hidden md:block">
      {/* Fine Trailing Beam (As de Luz) */}
      <motion.div
        style={{
          x: beamX,
          y: beamY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.2 : 0.8,
          opacity: 0.4,
        }}
        className={cn(
          "w-1 h-1 rounded-full fixed top-0 left-0 bg-white blur-[1px] z-10 shadow-[0_0_15px_white]"
        )}
      />
      <motion.div
        style={{
          x: beam2X,
          y: beam2Y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1 : 0.6,
          opacity: 0.2,
        }}
        className={cn(
          "w-2 h-2 rounded-full fixed top-0 left-0 bg-white/50 blur-[2px] z-10"
        )}
      />

      {/* Outer Tech Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 2.5 : isClicking ? 0.8 : 1,
          opacity: 0.5,
          borderWidth: isHovering ? '1px' : '2px',
        }}
        className={cn(
          "w-10 h-10 rounded-full border fixed top-0 left-0 transition-colors duration-300",
          theme === 'dark' ? "border-primary/50 bg-primary/5" : "border-primary/30 bg-primary/2"
        )}
      />

      {/* Main Cursor Core */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
        }}
        className={cn(
          "w-1.5 h-1.5 rounded-full fixed top-0 left-0 z-20",
          theme === 'dark' 
            ? "bg-white shadow-[0_0_15px_rgba(255,255,255,1),0_0_30px_rgba(103,232,249,0.8)]" 
            : "bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        )}
      />
    </div>
  );
}
