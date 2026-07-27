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
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 11.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main group for camera mouse parallax
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // ==========================================
    // 1. HIGH-DEFINITION REALISTIC EARTH (2048 x 1024)
    // ==========================================
    const earthRadius = 2.8;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 96, 96);

    const W = 2048;
    const H = 1024;

    // Canvas 1: Earth Diffuse (Albedo Map with Biomes, Forests, Deserts, Ice)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = W;
    earthCanvas.height = H;
    const ctx = earthCanvas.getContext('2d');

    // Canvas 2: Bump Map (Elevation/Mountains/Relief)
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = W;
    bumpCanvas.height = H;
    const bctx = bumpCanvas.getContext('2d');

    // Canvas 3: Specular Map (Ocean reflects sun specular light, land is matte)
    const specularCanvas = document.createElement('canvas');
    specularCanvas.width = W;
    specularCanvas.height = H;
    const sctx = specularCanvas.getContext('2d');

    if (ctx && bctx && sctx) {
      // --- A. DEEP OCEAN & SHALLOW COASTAL SHELVES ---
      // Base deep ocean gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
      oceanGrad.addColorStop(0, '#041d38');   // Arctic Deep Ocean
      oceanGrad.addColorStop(0.2, '#032c52');  // North Atlantic
      oceanGrad.addColorStop(0.5, '#0284c7');  // Tropical Ocean Blue
      oceanGrad.addColorStop(0.8, '#032c52');  // South Ocean
      oceanGrad.addColorStop(1, '#021226');    // Antarctic Ocean
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, W, H);

      // Specular Map Base: Oceans are bright specular (white = max shine)
      sctx.fillStyle = '#ffffff';
      sctx.fillRect(0, 0, W, H);

      // Bump Map Base: Oceans are flat black (height = 0)
      bctx.fillStyle = '#000000';
      bctx.fillRect(0, 0, W, H);

      // Helper to map (lon, lat) to canvas coordinates
      const toXY = (lon: number, lat: number): [number, number] => [
        ((lon + 180) / 360) * W,
        ((90 - lat) / 180) * H
      ];

      // --- B. DRAW SHALLOW TURQUOISE CONTINENTAL SHELVES ---
      const drawShallowShelf = (points: Array<[number, number]>) => {
        if (points.length < 3) return;
        ctx.save();
        ctx.beginPath();
        const [sx, sy] = toXY(points[0][0], points[0][1]);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < points.length; i++) {
          const [px, py] = toXY(points[i][0], points[i][1]);
          // Smooth curve interpolation
          const [prevX, prevY] = toXY(points[i - 1][0], points[i - 1][1]);
          const midX = (prevX + px) / 2;
          const midY = (prevY + py) / 2;
          ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        }
        ctx.closePath();

        // Layer 1: Wide shallow turquoise water (Bahamas/Great Barrier effect)
        ctx.lineWidth = 24;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.stroke();

        // Layer 2: Inner vibrant cyan coastal shelf
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      };

      // --- C. REALISTIC CONTINENT DRAWING ENGINE ---
      const drawRealContinent = (
        points: Array<[number, number]>,
        biomeColors: { base: string; inner?: string; highlight?: string },
        bumpHeight: number = 190,
        isIsland: boolean = false
      ) => {
        if (points.length < 3) return;

        // 1. Draw Shallow Shelf around landmass
        if (!isIsland) {
          drawShallowShelf(points);
        }

        // Helper path creation with smooth organic curves
        const createSmoothPath = (targetCtx: CanvasRenderingContext2D) => {
          targetCtx.beginPath();
          const [startX, startY] = toXY(points[0][0], points[0][1]);
          targetCtx.moveTo(startX, startY);

          for (let i = 1; i < points.length; i++) {
            const [px, py] = toXY(points[i][0], points[i][1]);
            const [prevX, prevY] = toXY(points[i - 1][0], points[i - 1][1]);
            const midX = (prevX + px) / 2;
            const midY = (prevY + py) / 2;
            targetCtx.quadraticCurveTo(prevX, prevY, midX, midY);
          }
          targetCtx.closePath();
        };

        // 2. Draw Main Land Polygon on Diffuse Canvas
        ctx.save();
        createSmoothPath(ctx);

        // Base Land Color
        ctx.fillStyle = biomeColors.base;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Inner Biome Gradient Layer (e.g. Amazon Deep Rainforest or Sahara Center)
        if (biomeColors.inner) {
          ctx.fillStyle = biomeColors.inner;
          ctx.globalAlpha = 0.75;
          ctx.fill();
        }

        // Highlighting / Coastal vegetation transition
        if (biomeColors.highlight) {
          ctx.fillStyle = biomeColors.highlight;
          ctx.globalAlpha = 0.4;
          ctx.fill();
        }

        // Crisp natural coastline border (sunlit coastal edge)
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.stroke();
        ctx.restore();

        // 3. Mark Land on Specular Map as BLACK (Land is matte)
        sctx.save();
        createSmoothPath(sctx);
        sctx.fillStyle = '#000000';
        sctx.fill();
        sctx.restore();

        // 4. Draw Raised Elevation on Bump Map
        bctx.save();
        createSmoothPath(bctx);
        const hexVal = Math.min(255, Math.max(0, bumpHeight)).toString(16).padStart(2, '0');
        bctx.fillStyle = `#${hexVal}${hexVal}${hexVal}`;
        bctx.fill();
        bctx.restore();
      };

      // Biome Color Palettes (Realistic Earth Satellite Imagery Colors)
      const GREEN_FOREST = { base: '#15803d', inner: '#14532d', highlight: '#22c55e' }; // Amazon/Congo Lush Green
      const SAVANNA_DESERT = { base: '#b45309', inner: '#d97706', highlight: '#f59e0b' }; // Sahara/Arabia Gold Sand
      const TEMPERATE_GREEN = { base: '#16a34a', inner: '#15803d', highlight: '#4ade80' }; // Europe/North America
      const ICE_WHITE = { base: '#e2e8f0', inner: '#f8fafc', highlight: '#ffffff' }; // Antarctica/Greenland Glaciers
      const ARID_BROWN = { base: '#92400e', inner: '#b45309', highlight: '#d97706' }; // Middle East/Central Asia
      const TUNDRA_DARK = { base: '#1e293b', inner: '#166534', highlight: '#64748b' }; // Arctic Siberia/Canada

      // --- D. DETAILED GEOGRAPHIC POLYGONS ---

      // SOUTH AMERICA (High Precision Amazon + Andes Coastline)
      drawRealContinent([
        [-78, 12], [-73, 11], [-65, 11], [-58, 6], [-52, 5], [-44, -2], [-35, -5],
        [-38, -13], [-42, -22], [-48, -28], [-53, -34], [-62, -39], [-65, -45],
        [-68, -55], [-75, -50], [-74, -40], [-72, -30], [-78, -15], [-81, -5],
        [-80, 2], [-78, 12]
      ], GREEN_FOREST, 210);

      // TIERRA DEL FUEGO & FALKLANDS
      drawRealContinent([[-68, -53], [-65, -55], [-69, -56], [-68, -53]], GREEN_FOREST, 170, true);
      drawRealContinent([[-60, -51], [-58, -52], [-61, -52], [-60, -51]], GREEN_FOREST, 150, true);

      // NORTH AMERICA (Canada Arctic, Rockies, East Coast, Florida, Baja, Mexico)
      drawRealContinent([
        [-168, 66], [-155, 71], [-135, 70], [-120, 72], [-100, 74], [-85, 70],
        [-75, 62], [-64, 58], [-55, 52], [-60, 46], [-70, 42], [-76, 35],
        [-80, 26], [-80, 25], [-82, 28], [-90, 30], [-97, 26], [-97, 20],
        [-90, 15], [-83, 8], [-88, 14], [-105, 20], [-110, 24], [-115, 30],
        [-124, 38], [-125, 50], [-135, 57], [-145, 60], [-168, 66]
      ], TEMPERATE_GREEN, 190);

      // FLORIDA & CARIBBEAN ARCHIPELAGO (Cuba, Hispaniola, Jamaica, Puerto Rico)
      drawRealContinent([[-82, 29], [-80, 25], [-81, 25], [-82, 29]], TEMPERATE_GREEN, 120, true);
      drawRealContinent([[-84, 22], [-76, 20], [-74, 22], [-84, 22]], GREEN_FOREST, 140, true); // Cuba
      drawRealContinent([[-74, 19], [-68, 18], [-70, 19], [-74, 19]], GREEN_FOREST, 140, true); // Hispaniola

      // GREENLAND (Massive Ice Sheet)
      drawRealContinent([
        [-55, 60], [-42, 65], [-22, 70], [-18, 76], [-25, 82], [-55, 83], [-70, 77], [-55, 60]
      ], ICE_WHITE, 230);

      // AFRICA (Sahara Desert, Congo Basin, Rift Valley, Cape of Good Hope)
      drawRealContinent([
        [-6, 36], [10, 37], [25, 32], [32, 31], [35, 28], [43, 12], [51, 11],
        [45, 2], [41, -10], [35, -20], [28, -34], [19, -34], [14, -22], [12, -14],
        [12, -5], [8, 4], [-8, 4], [-15, 5], [-17, 15], [-16, 21], [-10, 30], [-6, 36]
      ], SAVANNA_DESERT, 180);

      // MADAGASCAR
      drawRealContinent([[44, -12], [50, -15], [47, -25], [43, -22], [44, -12]], GREEN_FOREST, 170, true);

      // EUROPE (Iberian Peninsula, France, Germany, Italy boot, Balkans, East Europe)
      drawRealContinent([
        [-9, 36], [-9, 43], [-2, 43], [-2, 48], [4, 51], [10, 54], [20, 55],
        [28, 58], [35, 55], [32, 46], [26, 40], [20, 38], [15, 40], [12, 44],
        [8, 44], [3, 42], [0, 38], [-9, 36]
      ], TEMPERATE_GREEN, 170);

      // ITALY & MEDITERRANEAN ISLANDS
      drawRealContinent([[12, 42], [15, 40], [18, 40], [15, 38], [12, 42]], TEMPERATE_GREEN, 160, true);
      drawRealContinent([[8, 41], [9, 42], [9, 39], [8, 41]], TEMPERATE_GREEN, 150, true); // Sardinia/Corsica

      // SCANDINAVIA & FINLAND (Fjords & Taiga)
      drawRealContinent([
        [5, 58], [10, 63], [18, 70], [28, 70], [30, 65], [25, 60], [12, 56], [5, 58]
      ], TUNDRA_DARK, 200);

      // BRITISH ISLES & IRELAND
      drawRealContinent([[-10, 51], [-10, 55], [-6, 54], [-9, 51]], GREEN_FOREST, 150, true);
      drawRealContinent([[-5, 50], [-4, 58], [1, 53], [-5, 50]], GREEN_FOREST, 150, true);

      // ASIA & RUSSIA (Siberian Taiga, Central Asian Steppes, Gobi, East Coast)
      drawRealContinent([
        [28, 58], [40, 65], [60, 72], [100, 77], [140, 72], [170, 68], [170, 60],
        [140, 52], [130, 42], [120, 32], [108, 22], [105, 10], [98, 10], [100, 20],
        [88, 22], [78, 8], [68, 24], [60, 15], [55, 25], [45, 12], [38, 20],
        [35, 30], [32, 46], [28, 58]
      ], ARID_BROWN, 210);

      // ARABIAN PENINSULA & RED SEA
      drawRealContinent([
        [35, 30], [45, 28], [55, 25], [60, 22], [53, 16], [43, 12], [35, 28], [35, 30]
      ], SAVANNA_DESERT, 170);

      // INDIA
      drawRealContinent([
        [68, 24], [88, 22], [78, 8], [68, 24]
      ], GREEN_FOREST, 170);

      // JAPAN ARCHIPELAGO
      drawRealContinent([[130, 32], [135, 35], [141, 40], [143, 44], [138, 36], [130, 32]], GREEN_FOREST, 200, true);

      // INDONESIA, MALAYSIA, PHILIPPINES & PAPUA NEW GUINEA
      drawRealContinent([[95, 5], [105, -6], [115, -8], [118, 4], [95, 5]], GREEN_FOREST, 180, true); // Sumatra/Java
      drawRealContinent([[108, 4], [118, 5], [116, -4], [108, 4]], GREEN_FOREST, 180, true); // Borneo
      drawRealContinent([[120, 14], [126, 18], [124, 8], [120, 14]], GREEN_FOREST, 180, true); // Philippines
      drawRealContinent([[130, -3], [150, -8], [140, -3], [130, -3]], GREEN_FOREST, 190, true); // Papua

      // AUSTRALIA (Outback Desert, Great Dividing Range)
      drawRealContinent([
        [114, -22], [130, -12], [142, -11], [153, -28], [150, -37], [138, -35], [115, -34], [114, -22]
      ], SAVANNA_DESERT, 160);

      // NEW ZEALAND
      drawRealContinent([[172, -35], [178, -38], [170, -45], [172, -35]], GREEN_FOREST, 220, true);

      // ANTARCTICA (South Pole White Ice Cap)
      drawRealContinent([
        [-180, -70], [-120, -74], [-60, -65], [0, -70], [60, -68], [120, -66], [180, -70], [180, -90], [-180, -90]
      ], ICE_WHITE, 255);

      // --- E. SNOW-CAPPED MOUNTAINS (Andes, Himalayas, Rockies, Alps) ---
      const drawSnowMountains = (points: Array<[number, number]>) => {
        ctx.save();
        ctx.beginPath();
        const [sx, sy] = toXY(points[0][0], points[0][1]);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < points.length; i++) {
          const [px, py] = toXY(points[i][0], points[i][1]);
          ctx.lineTo(px, py);
        }
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#ffffff'; // White snow ridge
        ctx.shadowColor = '#e2e8f0';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();

        // Draw mountain ridges on bump map
        bctx.save();
        bctx.beginPath();
        bctx.moveTo(sx, sy);
        for (let i = 1; i < points.length; i++) {
          const [px, py] = toXY(points[i][0], points[i][1]);
          bctx.lineTo(px, py);
        }
        bctx.lineWidth = 14;
        bctx.strokeStyle = '#ffffff'; // Maximum height elevation
        bctx.stroke();
        bctx.restore();
      };

      // Andes Mountains
      drawSnowMountains([[-72, 8], [-75, -15], [-70, -32], [-72, -52]]);
      // Rocky Mountains
      drawSnowMountains([[-150, 62], [-120, 50], [-110, 38]]);
      // Himalayas Mountains
      drawSnowMountains([[70, 32], [85, 28], [100, 28]]);
      // European Alps
      drawSnowMountains([[6, 46], [12, 47], [16, 46]]);

      // --- F. NIGHT CITY LIGHT CLUSTERS (NYC, BA, Tokyo, London, Paris, etc) ---
      const cities = [
        { name: 'Buenos Aires', lon: -58.38, lat: -34.60 },
        { name: 'New York', lon: -74.00, lat: 40.71 },
        { name: 'Los Angeles', lon: -118.24, lat: 34.05 },
        { name: 'São Paulo', lon: -46.63, lat: -23.55 },
        { name: 'London', lon: -0.12, lat: 51.50 },
        { name: 'Paris', lon: 2.35, lat: 48.85 },
        { name: 'Madrid', lon: -3.70, lat: 40.41 },
        { name: 'Cairo', lon: 31.23, lat: 30.04 },
        { name: 'Tokyo', lon: 139.69, lat: 35.68 },
        { name: 'Beijing', lon: 116.40, lat: 39.90 },
        { name: 'Sydney', lon: 151.20, lat: -33.86 },
        { name: 'Dubai', lon: 55.27, lat: 25.20 }
      ];

      cities.forEach(c => {
        const [cx, cy] = toXY(c.lon, c.lat);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 16;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      });

      // --- G. TECH CONNECTION ARCS ---
      const drawArc = (c1: { lon: number; lat: number }, c2: { lon: number; lat: number }) => {
        const [x1, y1] = toXY(c1.lon, c1.lat);
        const [x2, y2] = toXY(c2.lon, c2.lat);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 35;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.setLineDash([8, 6]);
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      };

      drawArc(cities[0], cities[1]); // BA -> NYC
      drawArc(cities[1], cities[4]); // NYC -> London
      drawArc(cities[4], cities[8]); // London -> Tokyo
    }

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    const specularTexture = new THREE.CanvasTexture(specularCanvas);

    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.18,
      specularMap: specularTexture,
      specular: new THREE.Color(0x38bdf8),
      shininess: 45
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    // Position to face South & North America towards user
    earthMesh.rotation.y = -Math.PI / 2.2;
    mainGroup.add(earthMesh);

    // ==========================================
    // 2. ULTRA-REALISTIC ATMOSPHERIC CLOUDS (2048 x 1024)
    // ==========================================
    const cloudW = 2048;
    const cloudH = 1024;
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = cloudW;
    cloudCanvas.height = cloudH;
    const cctx = cloudCanvas.getContext('2d');

    if (cctx) {
      cctx.fillStyle = 'rgba(0,0,0,0)';
      cctx.fillRect(0, 0, cloudW, cloudH);

      // A. ITCZ (Intertropical Convergence Zone) Wavy Equatorial Cloud Band
      cctx.save();
      for (let x = 0; x < cloudW; x += 15) {
        const waveY = cloudH / 2 + Math.sin(x / 120) * 35 + Math.cos(x / 60) * 15;
        const radius = Math.sin(x / 200) * 20 + 25;
        cctx.beginPath();
        cctx.arc(x, waveY, radius, 0, Math.PI * 2);
        cctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        cctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        cctx.shadowBlur = 15;
        cctx.fill();
      }
      cctx.restore();

      // B. Realistic Cyclones & Hurricanes with Spiral Arms & Eye Wall
      const drawHurricaneSwirl = (cx: number, cy: number, radius: number, isClockwise = false) => {
        cctx.save();
        const arms = 4;
        const dir = isClockwise ? 1 : -1;

        // Spiral arms
        for (let a = 0; a < arms; a++) {
          const baseAngle = (a / arms) * Math.PI * 2;
          for (let step = 0; step < 28; step++) {
            const frac = step / 28;
            const angle = baseAngle + dir * frac * Math.PI * 3.2;
            const dist = frac * radius;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            const puffSize = (1 - frac * 0.7) * 22 + 4;

            // Pure ethereal white puff without dark shadows
            cctx.beginPath();
            cctx.arc(px, py, puffSize, 0, Math.PI * 2);
            cctx.fillStyle = `rgba(255, 255, 255, ${0.55 - frac * 0.3})`;
            cctx.shadowColor = '#ffffff';
            cctx.shadowBlur = 10;
            cctx.fill();
          }
        }

        // Eye Wall (Soft ring)
        cctx.beginPath();
        cctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
        cctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        cctx.shadowBlur = 12;
        cctx.fill();

        // Eye Center (Clear storm eye hole)
        cctx.globalCompositeOperation = 'destination-out';
        cctx.beginPath();
        cctx.arc(cx, cy, radius * 0.08, 0, Math.PI * 2);
        cctx.fill();
        cctx.globalCompositeOperation = 'source-over';

        cctx.restore();
      };

      // Atlantic Hurricane off North America coast
      drawHurricaneSwirl(520, 360, 170, false);
      // Pacific Typhoon off East Asia / Philippines
      drawHurricaneSwirl(1550, 310, 200, false);
      // Indian Ocean Cyclone off Madagascar
      drawHurricaneSwirl(1220, 680, 150, true);

      // C. Cold Front Cloud Bands (Mid-latitude Jetstream swirling waves)
      const drawCloudFront = (startX: number, startY: number, length: number, angleDeg: number) => {
        cctx.save();
        const rad = (angleDeg * Math.PI) / 180;
        for (let i = 0; i < length; i += 16) {
          const offsetX = Math.cos(rad) * i + Math.sin(i / 40) * 18;
          const offsetY = Math.sin(rad) * i + Math.cos(i / 50) * 12;
          const px = startX + offsetX;
          const py = startY + offsetY;

          cctx.beginPath();
          cctx.arc(px, py, Math.random() * 16 + 18, 0, Math.PI * 2);
          cctx.fillStyle = 'rgba(255, 255, 255, 0.30)';
          cctx.shadowColor = '#ffffff';
          cctx.shadowBlur = 10;
          cctx.fill();
        }
        cctx.restore();
      };

      // North Atlantic Front
      drawCloudFront(350, 250, 550, 25);
      // North Pacific Front
      drawCloudFront(1200, 220, 650, 15);
      // Southern Ocean Roaring Forties Front
      drawCloudFront(200, 780, 1300, -10);

      // D. Fine Volumetric Cumulus & Cirrus Cloud Fleets
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * cloudW;
        const y = Math.random() * cloudH;
        const rx = Math.random() * 75 + 25;
        const ry = Math.random() * 18 + 5;
        const rot = (Math.random() - 0.5) * 0.5;

        cctx.save();
        // Light White Translucent Cloud Body
        cctx.globalAlpha = Math.random() * 0.35 + 0.15;
        cctx.fillStyle = '#ffffff';
        cctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        cctx.shadowBlur = 8;
        cctx.beginPath();
        cctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
        cctx.fill();
        cctx.restore();
      }
    }

    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.022, 96, 96);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      shininess: 10
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    mainGroup.add(cloudMesh);

    // --- ATMOSPHERIC RAYLEIGH SCATTERING GLOW RING ---
    const atmoGeo = new THREE.SphereGeometry(earthRadius * 1.08, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x38bdf8 : 0x0284c7,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    mainGroup.add(atmosphereMesh);

    // Orbit Wireframe Ring
    const ringGeo = new THREE.RingGeometry(earthRadius * 1.25, earthRadius * 1.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    mainGroup.add(ringMesh);

    // ==========================================
    // 3. LA LUNA (DETAILED MOON)
    // ==========================================
    const moonRadius = 0.65;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 48, 48);

    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 512;
    moonCanvas.height = 256;
    const mctx = moonCanvas.getContext('2d');
    if (mctx) {
      // Base Lunar Highland
      const grad = mctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#f1f5f9');
      grad.addColorStop(0.5, '#cbd5e1');
      grad.addColorStop(1, '#94a3b8');
      mctx.fillStyle = grad;
      mctx.fillRect(0, 0, 512, 256);

      // Dark Basaltic Lunar Maria Seas
      mctx.fillStyle = '#334155';
      mctx.globalAlpha = 0.65;
      mctx.beginPath();
      mctx.ellipse(180, 100, 75, 55, 0, 0, Math.PI * 2);
      mctx.fill();
      mctx.beginPath();
      mctx.ellipse(310, 120, 85, 65, 0, 0, Math.PI * 2);
      mctx.fill();

      // Craters with bright ejecta rays
      for (let i = 0; i < 110; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 10 + 2;

        mctx.save();
        mctx.globalAlpha = 0.5;
        mctx.fillStyle = '#1e293b';
        mctx.beginPath();
        mctx.arc(x, y, r, 0, Math.PI * 2);
        mctx.fill();

        mctx.lineWidth = 1.5;
        mctx.strokeStyle = '#ffffff';
        mctx.globalAlpha = 0.7;
        mctx.stroke();
        mctx.restore();
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

    // Orbit Trail
    const orbitTrailGeo = new THREE.RingGeometry(moonOrbitRadius - 0.02, moonOrbitRadius + 0.02, 128);
    const orbitTrailMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const orbitTrailMesh = new THREE.Mesh(orbitTrailGeo, orbitTrailMat);
    orbitTrailMesh.rotation.x = Math.PI / 2;
    mainGroup.add(orbitTrailMesh);

    // ==========================================
    // 4. ULTRA-REALISTIC STARFIELD, NEBULAE & COMETS
    // ==========================================

    // --- A. DEEP SPACE COSMIC NEBULAE CLOUDS ---
    const createNebulaTexture = (color1: string, color2: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const nctx = canvas.getContext('2d');
      if (nctx) {
        const grad = nctx.createRadialGradient(256, 256, 10, 256, 256, 250);
        grad.addColorStop(0, color1);
        grad.addColorStop(0.4, color2);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        nctx.fillStyle = grad;
        nctx.beginPath();
        nctx.arc(256, 256, 250, 0, Math.PI * 2);
        nctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const nebulaGroup = new THREE.Group();
    scene.add(nebulaGroup);

    const nebulaMat1 = new THREE.SpriteMaterial({
      map: createNebulaTexture('rgba(99, 102, 241, 0.28)', 'rgba(30, 27, 75, 0.08)'),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const nebula1 = new THREE.Sprite(nebulaMat1);
    nebula1.scale.set(65, 65, 1);
    nebula1.position.set(-25, 15, -30);
    nebulaGroup.add(nebula1);

    const nebulaMat2 = new THREE.SpriteMaterial({
      map: createNebulaTexture('rgba(14, 165, 233, 0.25)', 'rgba(12, 74, 110, 0.06)'),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const nebula2 = new THREE.Sprite(nebulaMat2);
    nebula2.scale.set(70, 70, 1);
    nebula2.position.set(28, -18, -35);
    nebulaGroup.add(nebula2);

    const nebulaMat3 = new THREE.SpriteMaterial({
      map: createNebulaTexture('rgba(217, 70, 239, 0.20)', 'rgba(88, 28, 135, 0.05)'),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const nebula3 = new THREE.Sprite(nebulaMat3);
    nebula3.scale.set(55, 55, 1);
    nebula3.position.set(0, -22, -25);
    nebulaGroup.add(nebula3);


    // --- B. BRIGHT STAR GLARE / CROSS-STAR GLINT CANVAS TEXTURE ---
    const createStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const sctx = canvas.getContext('2d');
      if (sctx) {
        const cx = 64;
        const cy = 64;

        // Core Radial Glow
        const grad = sctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sctx.fillStyle = grad;
        sctx.beginPath();
        sctx.arc(cx, cy, 60, 0, Math.PI * 2);
        sctx.fill();

        // 4-Point Lens Flare Cross Spike
        sctx.fillStyle = '#ffffff';
        sctx.beginPath();
        sctx.moveTo(cx - 50, cy);
        sctx.quadraticCurveTo(cx, cy, cx, cy - 50);
        sctx.quadraticCurveTo(cx, cy, cx + 50, cy);
        sctx.quadraticCurveTo(cx, cy, cx, cy + 50);
        sctx.quadraticCurveTo(cx, cy, cx - 50, cy);
        sctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const starGlintTexture = createStarTexture();

    // --- C. DENSE BRIGHT TWINKLING STARFIELD ---
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount);

    // Realistic Star Colors (Blue Giants, White, Yellow, Cyan, Warm Red/Orange)
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#fde047'),
      new THREE.Color('#fdba74'),
      new THREE.Color('#e0e7ff')
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 180;
      starPositions[idx + 1] = (Math.random() - 0.5) * 180;
      starPositions[idx + 2] = -Math.random() * 80 - 2; // Behind earth

      const c = palette[Math.floor(Math.random() * palette.length)];
      starColors[idx] = c.r;
      starColors[idx + 1] = c.g;
      starColors[idx + 2] = c.b;

      // Varied star sizes
      const isMajorStar = Math.random() < 0.12;
      starSizes[i] = isMajorStar ? Math.random() * 0.45 + 0.25 : Math.random() * 0.12 + 0.05;
      starPhases[i] = Math.random() * Math.PI * 2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
      map: starGlintTexture,
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // --- D. REALISTIC PASSING COMET (SHOOTING COMET WITH LUMINOUS TAIL) ---
    // Create Comet Tail Texture
    const createCometTailTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(512, 64, 0, 64);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');      // Bright nucleus core
        grad.addColorStop(0.08, 'rgba(56, 189, 248, 0.95)'); // Cyan coma
        grad.addColorStop(0.35, 'rgba(147, 197, 253, 0.5)'); // Ion tail
        grad.addColorStop(0.75, 'rgba(99, 102, 241, 0.2)');  // Dust tail
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');            // Fade
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(512, 64);
        ctx.lineTo(0, 10);
        ctx.lineTo(0, 118);
        ctx.closePath();
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const cometTailTexture = createCometTailTexture();

    // Comet Mesh Group
    const cometGroup = new THREE.Group();
    scene.add(cometGroup);

    // 1. Comet Head (Glowing Core)
    const cometHeadGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const cometHeadMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0
    });
    const cometHeadMesh = new THREE.Mesh(cometHeadGeo, cometHeadMat);
    cometGroup.add(cometHeadMesh);

    // 2. Comet Coma Glow
    const cometGlowMat = new THREE.SpriteMaterial({
      map: starGlintTexture,
      color: 0x38bdf8,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95
    });
    const cometGlowSprite = new THREE.Sprite(cometGlowMat);
    cometGlowSprite.scale.set(1.8, 1.8, 1);
    cometGroup.add(cometGlowSprite);

    // 3. Comet Long Tail
    const cometTailGeo = new THREE.PlaneGeometry(8.5, 1.2);
    const cometTailMat = new THREE.MeshBasicMaterial({
      map: cometTailTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cometTailMesh = new THREE.Mesh(cometTailGeo, cometTailMat);
    cometTailMesh.position.set(-4.2, 0, 0); // Position behind head
    cometGroup.add(cometTailMesh);

    // Comet State Controller
    const cometState = {
      active: false,
      pos: new THREE.Vector3(),
      target: new THREE.Vector3(),
      speed: 0.12,
      timer: 0,
      nextSpawn: 60 // frames till first launch
    };

    const spawnComet = () => {
      cometState.active = true;
      // Spawn position far behind Earth in background space
      const startX = (Math.random() - 0.5) * 30 + (Math.random() > 0.5 ? 25 : -25);
      const startY = Math.random() * 15 + 10;
      const startZ = -Math.random() * 15 - 8; // Safely behind Earth (z = 0)

      cometState.pos.set(startX, startY, startZ);

      // Trajectory heading downwards across behind Earth
      const endX = -startX * 1.2;
      const endY = -startY - 10;
      const endZ = startZ - 5;
      cometState.target.set(endX, endY, endZ);

      cometGroup.position.copy(cometState.pos);

      // Rotate Comet Tail to align opposite to direction of motion
      const dir = new THREE.Vector3().subVectors(cometState.target, cometState.pos).normalize();
      const angle = Math.atan2(dir.y, dir.x);
      cometGroup.rotation.z = angle;

      cometGroup.visible = true;
    };

    cometGroup.visible = false;

    // --- E. SHOOTING STARS (METEOR STREAKS) ---
    const meteorCount = 3;
    const meteors: Array<{
      mesh: THREE.Line;
      geo: THREE.BufferGeometry;
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
    }> = [];

    for (let i = 0; i < meteorCount; i++) {
      const mGeo = new THREE.BufferGeometry();
      const mPositions = new Float32Array(6); // 2 points for a streak line
      mGeo.setAttribute('position', new THREE.BufferAttribute(mPositions, 3));

      const mMat = new THREE.LineBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending
      });

      const mMesh = new THREE.Line(mGeo, mMat);
      scene.add(mMesh);

      meteors.push({
        mesh: mMesh,
        geo: mGeo,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 40
      });
    }

    // ==========================================
    // 5. LIGHTING & SUNSHINE
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(12, 12, 12);
    scene.add(sunLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.5, 25);
    pointLight.position.set(-8, -5, 5);
    scene.add(pointLight);

    // Mouse Parallax Interaction
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetX = (e.clientX - windowHalfX) * 0.0005;
      targetY = (e.clientY - windowHalfY) * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 6. ANIMATION LOOP & COSMIC EVENTS
    // ==========================================
    let animationFrameId: number;
    let moonAngle = 0;
    let clockTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clockTime += 0.016;

      // Rotate Earth slowly on axis
      earthMesh.rotation.y += 0.0022;

      // Rotate Clouds slightly faster for 3D atmospheric movement
      cloudMesh.rotation.y += 0.0030;

      atmosphereMesh.rotation.y += 0.0012;
      ringMesh.rotation.z += 0.0008;

      // Orbit Moon
      moonAngle += 0.006;
      moonPivot.rotation.y = moonAngle;
      moonMesh.rotation.y += 0.007;

      // Starfield slow drift & twinkling
      starPoints.rotation.y += 0.00015;
      starPoints.rotation.x += 0.00005;

      // Twinkle effect on major stars
      const sizes = starGeo.attributes.size.array as Float32Array;
      for (let i = 0; i < starCount; i += 8) {
        sizes[i] = (Math.sin(clockTime * 2.5 + starPhases[i]) * 0.15) + 0.28;
      }
      starGeo.attributes.size.needsUpdate = true;

      // Nebulae subtle pulse & rotation
      nebula1.rotation.z = Math.sin(clockTime * 0.2) * 0.15;
      nebula2.rotation.z = Math.cos(clockTime * 0.15) * 0.12;

      // --- ANIMATE PASSING COMET (BEHIND EARTH) ---
      if (!cometState.active) {
        cometState.timer++;
        if (cometState.timer > cometState.nextSpawn) {
          spawnComet();
          cometState.timer = 0;
          cometState.nextSpawn = Math.floor(Math.random() * 250 + 180); // Spawn every ~3 to 7 seconds
        }
      } else {
        // Move comet along vector path
        const dir = new THREE.Vector3().subVectors(cometState.target, cometState.pos).normalize();
        cometGroup.position.addScaledVector(dir, cometState.speed);

        // Check if comet has passed screen boundaries
        if (cometGroup.position.distanceTo(cometState.target) < 1.0 || cometGroup.position.y < -25) {
          cometState.active = false;
          cometGroup.visible = false;
        }
      }

      // --- ANIMATE SHOOTING METEORS ---
      meteors.forEach((m) => {
        if (m.life <= 0) {
          if (Math.random() < 0.015) { // Spawn chance
            m.life = m.maxLife;
            const sx = (Math.random() - 0.5) * 40;
            const sy = Math.random() * 20 + 5;
            const sz = -Math.random() * 20 - 5;
            m.pos.set(sx, sy, sz);
            m.vel.set(-Math.random() * 0.4 - 0.3, -Math.random() * 0.4 - 0.2, 0);
          }
        } else {
          m.life--;
          const tailPos = new THREE.Vector3().copy(m.pos).addScaledVector(m.vel, -2.5);

          const positions = m.geo.attributes.position.array as Float32Array;
          positions[0] = m.pos.x;
          positions[1] = m.pos.y;
          positions[2] = m.pos.z;
          positions[3] = tailPos.x;
          positions[4] = tailPos.y;
          positions[5] = tailPos.z;
          m.geo.attributes.position.needsUpdate = true;

          m.pos.add(m.vel);
          const mat = m.mesh.material as THREE.LineBasicMaterial;
          mat.opacity = (m.life / m.maxLife) * 0.8;
        }
      });

      // Smooth camera tilt towards mouse
      mainGroup.rotation.y += (targetX - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetY - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

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
      cloudGeo.dispose();
      cloudMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      nebulaMat1.dispose();
      nebulaMat2.dispose();
      nebulaMat3.dispose();
      cometHeadGeo.dispose();
      cometHeadMat.dispose();
      cometTailGeo.dispose();
      cometTailMat.dispose();
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      {/* Fullscreen 3D Universe Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing" />

      {/* Floating Badges for Universe Controls */}
      <div className="fixed top-24 left-6 z-20 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-white px-4 py-2 rounded-full text-[10px] font-mono tracking-widest hidden md:flex items-center gap-2 shadow-2xl pointer-events-auto">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="uppercase font-bold text-cyan-400">UNIVERSO 3D REALISTA EN TODO EL FONDO // COMETAS & NEBULOSAS HD</span>
      </div>

      <div className="fixed bottom-6 right-6 z-20 bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 px-4 py-2 rounded-full text-[10px] font-mono hidden sm:flex items-center gap-2 shadow-2xl pointer-events-auto">
        <span>💫 Cometas en movimiento, lluvia de meteoros y galaxias en fondo de pantalla completo</span>
      </div>
    </div>
  );
}
