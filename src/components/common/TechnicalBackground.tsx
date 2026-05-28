import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';

const CHARS = 'HITEM3DNOVA3DXYZ8952'.split('');
const GRID_SIZE = 40;

export function TechnicalBackground({ theme }: { theme: 'dark' | 'light' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;
    let grid: { x: number; y: number; char: string }[] = [];

    const initGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      grid = [];
      const cols = Math.ceil(width / GRID_SIZE);
      const rows = Math.ceil(height / GRID_SIZE);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          grid.push({
            x: i * GRID_SIZE,
            y: j * GRID_SIZE,
            char: CHARS[Math.floor(Math.random() * CHARS.length)]
          });
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const isDark = theme === 'dark';
      
      // Draw Grid
      ctx.font = 'bold 10px monospace';
      grid.forEach(cell => {
        const dx = cell.x - mousePos.current.x;
        const dy = cell.y - mousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isActive = dist < 200;
        
        ctx.save();
        ctx.translate(cell.x, cell.y);
        
        if (isActive) {
          const intensity = 1 - (dist / 200);
          ctx.rotate((Math.PI / 2) * intensity);
          ctx.scale(1 + intensity * 0.5, 1 + intensity * 0.5);
          ctx.fillStyle = isDark ? '#ffffff' : '#0ea5e9'; 
          ctx.globalAlpha = 0.2 + intensity * 0.7;
        } else {
          ctx.fillStyle = isDark ? '#ffffff' : '#000000';
          ctx.globalAlpha = isDark ? 0.05 : 0.03;
        }
        
        ctx.fillText(cell.char, 0, 0);
        ctx.restore();
      });

      // Draw Radial Glow
      const gradient = ctx.createRadialGradient(
        mousePos.current.x, mousePos.current.y, 0,
        mousePos.current.x, mousePos.current.y, 400
      );
      
      const glowColor = isDark ? '103, 232, 249' : '14, 165, 233'; // Cyan or Sky Blue
      gradient.addColorStop(0, `rgba(${glowColor}, 0.2)`);
      gradient.addColorStop(0.5, `rgba(244, 114, 182, 0.05)`); // Subtle fuchsia middle
      gradient.addColorStop(1, `rgba(${glowColor}, 0)`);
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mousePos.current.x, mousePos.current.y, 400, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => initGrid();
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
    };

    initGrid();
    render();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
