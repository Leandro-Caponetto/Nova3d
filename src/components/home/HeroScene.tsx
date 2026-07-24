import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

export function HeroScene({ theme }: { theme: 'dark' | 'light' }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold Earth, Atmosphere & Moon for mouse tilt
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- EARTH ---
    // Earth core sphere
    const earthRadius = 2.8;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // Canvas procedural texture for Earth (continents + oceans + glowing grid)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const ctx = earthCanvas.getContext('2d');
    if (ctx) {
      // Base deep ocean gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#0284c7'); // Cyan blue
      grad.addColorStop(0.5, '#0369a1');
      grad.addColorStop(1, '#0f172a'); // Deep navy
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Procedural stylized continents
      ctx.fillStyle = '#f59e0b'; // Amber landmasses
      ctx.globalAlpha = 0.85;

      // Draw stylized continent shapes
      const drawBlob = (cx: number, cy: number, rx: number, ry: number) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      };

      // Americas
      drawBlob(280, 180, 70, 110);
      drawBlob(340, 330, 80, 120);
      // Europe & Africa
      drawBlob(540, 170, 75, 60);
      drawBlob(550, 310, 85, 110);
      // Asia & Australia
      drawBlob(750, 180, 130, 90);
      drawBlob(830, 360, 60, 50);

      // Lat/Long Latitude lines grid overlay
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (let y = 0; y < 512; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
      for (let x = 0; x < 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
    }

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 25,
      specular: new THREE.Color(0x38bdf8),
      bumpScale: 0.05
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    mainGroup.add(earthMesh);

    // Earth Outer Atmosphere Glow Ring
    const atmoGeo = new THREE.SphereGeometry(earthRadius * 1.06, 48, 48);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0xf59e0b : 0x0284c7,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    mainGroup.add(atmosphereMesh);

    // Earth Wireframe Orbit Ring (Equator halo)
    const ringGeo = new THREE.RingGeometry(earthRadius * 1.2, earthRadius * 1.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    mainGroup.add(ringMesh);

    // --- MOON (LA LUNA) ---
    const moonRadius = 0.65;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 32, 32);

    // Procedural Moon texture
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 256;
    moonCanvas.height = 128;
    const mctx = moonCanvas.getContext('2d');
    if (mctx) {
      mctx.fillStyle = '#cbd5e1'; // Slate gray base
      mctx.fillRect(0, 0, 256, 128);
      mctx.fillStyle = '#64748b'; // Craters
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 128;
        const r = Math.random() * 12 + 2;
        mctx.beginPath();
        mctx.arc(x, y, r, 0, Math.PI * 2);
        mctx.fill();
      }
    }
    const moonTexture = new THREE.CanvasTexture(moonCanvas);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.8,
      metalness: 0.1
    });

    const moonPivot = new THREE.Group();
    mainGroup.add(moonPivot);

    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    const moonOrbitRadius = 5.2;
    moonMesh.position.set(moonOrbitRadius, 0.8, 0);
    moonPivot.add(moonMesh);

    // Moon Orbit Trail Ring
    const orbitTrailGeo = new THREE.RingGeometry(moonOrbitRadius - 0.02, moonOrbitRadius + 0.02, 128);
    const orbitTrailMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const orbitTrailMesh = new THREE.Mesh(orbitTrailGeo, orbitTrailMat);
    orbitTrailMesh.rotation.x = Math.PI / 2;
    mainGroup.add(orbitTrailMesh);

    // --- STARS PARTICLES ---
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 60;
      starPositions[i + 1] = (Math.random() - 0.5) * 60;
      starPositions[i + 2] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: theme === 'dark' ? 0xffffff : 0x0f172a,
      size: 0.08,
      transparent: true,
      opacity: 0.7
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(10, 10, 10);
    scene.add(sunLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 1.5, 20);
    pointLight.position.set(-8, -5, 5);
    scene.add(pointLight);

    // --- MOUSE PARALLAX INTERACTION ---
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetX = (e.clientX - windowHalfX) * 0.0005;
      targetY = (e.clientY - windowHalfY) * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    let moonAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate Earth on axis
      earthMesh.rotation.y += 0.003;
      atmosphereMesh.rotation.y += 0.002;
      ringMesh.rotation.z += 0.001;

      // Orbit Moon around Earth
      moonAngle += 0.008;
      moonPivot.rotation.y = moonAngle;
      moonMesh.rotation.y += 0.01;

      // Rotate starfield slowly
      starPoints.rotation.y += 0.0003;

      // Smooth camera tilt towards mouse
      mainGroup.rotation.y += (targetX - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetY - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [theme]);

  return (
    <div className="w-full h-[450px] md:h-[550px] relative flex items-center justify-center overflow-hidden rounded-3xl pointer-events-auto">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Badges for Earth & Moon */}
      <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-white px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="uppercase font-bold text-amber-400">PLANETA TIERRA Y LA LUNA 3D</span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 px-3.5 py-1.5 rounded-full text-[10px] font-mono hidden sm:flex items-center gap-2 shadow-lg">
        <span>🌐 Órbita Realista interactiva // Arrastra con el mouse</span>
      </div>
    </div>
  );
}
