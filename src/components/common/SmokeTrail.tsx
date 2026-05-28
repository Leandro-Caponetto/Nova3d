import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function SmokeTrail({ theme }: { theme: 'dark' | 'light' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, isActive: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x: number, y: number) => {
      const type = Math.random();
      let color = '255, 255, 255'; // Brilliant white core
      
      if (type > 0.4 && type < 0.75) {
        color = '103, 232, 249'; // Celestial Blue
      } else if (type >= 0.75) {
        color = '244, 114, 182'; // Fuchsia
      }
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.15 + 0.05;

      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 10 + 15, // Ultra fast fade
        size: Math.random() * 12 + 6,    // More delicate
        color
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((p, i) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        
        const lifeRatio = p.life / p.maxLife;
        const opacity = Math.sin(lifeRatio * Math.PI) * (theme === 'dark' ? 0.05 : 0.03);
        const currentSize = p.size * (1 + lifeRatio * 0.2); 
        
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
        gradient.addColorStop(0, `rgba(${p.color}, ${opacity})`);
        gradient.addColorStop(0.8, `rgba(${p.color}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'lighter';
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.current.splice(i, 1);
        }
      });

      if (mouse.current.isActive) {
        const dist = Math.hypot(mouse.current.x - mouse.current.lastX, mouse.current.y - mouse.current.lastY);
        const count = Math.min(Math.floor(dist / 0.8) + 2, 10);
        
        for (let i = 0; i < count; i++) {
          const lerpX = mouse.current.lastX + (mouse.current.x - mouse.current.lastX) * (i / count);
          const lerpY = mouse.current.lastY + (mouse.current.y - mouse.current.lastY) * (i / count);
          createParticle(lerpX, lerpY);
        }
      }

      mouse.current.lastX = mouse.current.x;
      mouse.current.lastY = mouse.current.y;
      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.isActive = true;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{ filter: 'blur(10px)' }}
    />
  );
}
