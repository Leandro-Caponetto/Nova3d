import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rocket, Compass, Sparkles, Globe, MapPin } from 'lucide-react';

interface PlanetInfo {
  id: string;
  name: string;
  subtitle: string;
  distanceAU: string;
  phase: number;
  scrollFraction: number; // 0.0 to 1.0
  color: string;
}

const PLANETS_DATA: PlanetInfo[] = [
  { id: 'earth', name: 'Planeta Tierra y Luna', subtitle: 'Hogar Humano', distanceAU: '1.00 AU (149.6M km)', phase: 1, scrollFraction: 0.0, color: '#38bdf8' },
  { id: 'sun', name: 'El Sol y Mercurio', subtitle: 'Estrella Central', distanceAU: '0.39 AU (57.9M km)', phase: 2, scrollFraction: 0.14, color: '#f59e0b' },
  { id: 'venus', name: 'Venus', subtitle: 'Atmósfera Dorada', distanceAU: '0.72 AU (108.2M km)', phase: 3, scrollFraction: 0.28, color: '#fde047' },
  { id: 'mars', name: 'Marte, Fobos y Deimos', subtitle: 'El Planeta Rojo', distanceAU: '1.52 AU (227.9M km)', phase: 4, scrollFraction: 0.42, color: '#ef4444' },
  { id: 'jupiter', name: 'Júpiter y Lunas', subtitle: 'Gigante Gaseoso', distanceAU: '5.20 AU (778.5M km)', phase: 5, scrollFraction: 0.57, color: '#fb923c' },
  { id: 'saturn', name: 'Saturno y Anillos', subtitle: 'División Cassini & Titán', distanceAU: '9.58 AU (1.43B km)', phase: 6, scrollFraction: 0.71, color: '#facc15' },
  { id: 'neptune', name: 'Urano y Neptuno', subtitle: 'Gigantes de Hielo', distanceAU: '30.05 AU (4.50B km)', phase: 7, scrollFraction: 0.85, color: '#06b6d4' },
  { id: 'deepspace', name: 'Agujero Negro Supermasivo', subtitle: 'Singularidad & Lente Gravitacional', distanceAU: 'Límite Cosmológico', phase: 8, scrollFraction: 1.0, color: '#f97316' },
];

export function HeroScene({ theme }: { theme: 'dark' | 'light' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePlanet, setActivePlanet] = useState<PlanetInfo>(PLANETS_DATA[0]);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. THREE.JS SCENE SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    // Main mouse parallax container
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Helper coordinate conversion (longitude [-180..180], latitude [-90..90] -> canvas X,Y)
    const toXY = (lon: number, lat: number, W: number, H: number): [number, number] => [
      ((lon + 180) / 360) * W,
      ((90 - lat) / 180) * H
    ];

    // Subdivided fractal coast generator to make polygons look natural and non-geometric
    const drawFractalPolygon = (
      ctx: CanvasRenderingContext2D,
      points: Array<[number, number]>,
      W: number,
      H: number,
      noiseSeed: number = 1.0
    ) => {
      if (points.length < 3) return;

      const fullSubdivided: Array<[number, number]> = [];
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];

        const steps = 6;
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const interLon = p1[0] + (p2[0] - p1[0]) * t;
          const interLat = p1[1] + (p2[1] - p1[1]) * t;

          // Multi-frequency noise perturbation for realistic jagged coastline
          const noise1 = Math.sin(interLon * 0.25 + noiseSeed) * Math.cos(interLat * 0.35 + noiseSeed) * 0.8;
          const noise2 = Math.sin(interLon * 0.8 - interLat * 0.6) * 0.35;
          const noise3 = Math.cos(interLon * 1.5 + interLat * 1.2) * 0.15;

          const pertLon = interLon + (noise1 + noise2 + noise3);
          const pertLat = interLat + (noise1 - noise2 + noise3) * 0.5;

          fullSubdivided.push([pertLon, pertLat]);
        }
      }

      ctx.beginPath();
      const [firstX, firstY] = toXY(fullSubdivided[0][0], fullSubdivided[0][1], W, H);
      ctx.moveTo(firstX, firstY);

      for (let i = 1; i < fullSubdivided.length; i++) {
        const [px, py] = toXY(fullSubdivided[i][0], fullSubdivided[i][1], W, H);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    // ==========================================
    // ACCURATE REAL-WORLD CONTINENTAL POLYGONS
    // ==========================================
    const GEO_CONTINENTS = {
      // SOUTH AMERICA
      southAmerica: [
        [-78, 9], [-74, 11], [-62, 10], [-50, 2], [-35, -5], [-38, -13],
        [-43, -23], [-50, -30], [-58, -34], [-65, -45], [-68, -55], [-75, -50],
        [-74, -40], [-72, -30], [-78, -15], [-81, -4], [-80, 2], [-78, 9]
      ] as Array<[number, number]>,

      // NORTH AMERICA
      northAmerica: [
        [-168, 65], [-160, 71], [-130, 70], [-110, 74], [-90, 68], [-80, 62],
        [-62, 60], [-60, 50], [-54, 53], [-64, 45], [-70, 42], [-76, 35],
        [-80, 25], [-81, 28], [-85, 30], [-90, 29], [-97, 26], [-89, 21],
        [-87, 18], [-83, 9], [-78, 8], [-90, 15], [-96, 17], [-105, 20],
        [-110, 23], [-115, 32], [-124, 40], [-125, 48], [-135, 54], [-148, 60],
        [-162, 58], [-168, 65]
      ] as Array<[number, number]>,

      // GREENLAND
      greenland: [
        [-52, 60], [-40, 65], [-22, 70], [-18, 77], [-25, 82], [-50, 82], [-60, 76], [-55, 68], [-52, 60]
      ] as Array<[number, number]>,

      // AFRICA
      africa: [
        [-6, 36], [0, 36], [10, 37], [25, 32], [32, 31], [33, 28], [35, 20],
        [43, 12], [51, 11], [45, 5], [40, -5], [35, -20], [32, -28], [28, -33],
        [18, -34], [12, -26], [13, -18], [9, -1], [2, 5], [-8, 4], [-14, 12],
        [-17, 15], [-16, 21], [-10, 28], [-6, 36]
      ] as Array<[number, number]>,

      // EUROPE
      europe: [
        [-9, 36], [-9, 43], [-2, 43], [3, 48], [-4, 48], [-5, 53], [2, 51],
        [8, 54], [10, 58], [5, 62], [10, 65], [18, 70], [28, 71], [30, 65],
        [24, 60], [20, 55], [30, 50], [40, 45], [35, 41], [28, 41], [23, 38],
        [16, 38], [15, 41], [18, 45], [12, 44], [9, 41], [3, 42], [-3, 37], [-9, 36]
      ] as Array<[number, number]>,

      // ASIA MAINLAND
      asia: [
        [35, 41], [40, 45], [50, 48], [60, 55], [70, 65], [100, 74], [140, 72],
        [170, 66], [160, 56], [140, 50], [130, 42], [127, 36], [120, 32],
        [120, 23], [110, 20], [108, 12], [102, 8], [98, 16], [90, 22], [80, 16],
        [77, 8], [72, 18], [68, 24], [60, 25], [58, 20], [50, 27], [48, 30],
        [43, 12], [35, 20], [33, 28], [35, 33], [35, 41]
      ] as Array<[number, number]>,

      // AUSTRALIA
      australia: [
        [114, -22], [120, -18], [130, -15], [136, -12], [142, -11], [145, -15],
        [150, -23], [153, -28], [150, -37], [140, -38], [135, -34], [120, -34],
        [115, -35], [113, -26], [114, -22]
      ] as Array<[number, number]>,

      // MADAGASCAR
      madagascar: [
        [44, -12], [50, -15], [47, -25], [44, -25], [44, -12]
      ] as Array<[number, number]>,

      // JAPAN
      japan: [
        [130, 31], [136, 35], [141, 41], [145, 44], [141, 45], [138, 37], [130, 31]
      ] as Array<[number, number]>,

      // BRITISH ISLES
      uk: [
        [-5, 50], [-2, 51], [1, 52], [-1, 55], [-4, 58], [-6, 56], [-5, 50]
      ] as Array<[number, number]>,

      // ANTARCTICA
      antarctica: [
        [-180, -68], [-120, -72], [-70, -65], [-60, -63], [-30, -72], [0, -70],
        [40, -68], [90, -66], [140, -66], [170, -70], [180, -68], [180, -90], [-180, -90]
      ] as Array<[number, number]>
    };

    // ==========================================
    // PHOTOREALISTIC EARTH TEXTURE GENERATION
    // ==========================================

    // --- 1. COLOR MAP (4096 x 2048) ---
    const createEarthTexture = () => {
      const W = 2048, H = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep Ocean Abyssal Bathymetry Base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
      oceanGrad.addColorStop(0, '#011222');
      oceanGrad.addColorStop(0.2, '#02213a');
      oceanGrad.addColorStop(0.5, '#0284c7'); // Rich tropical ocean
      oceanGrad.addColorStop(0.8, '#02213a');
      oceanGrad.addColorStop(1, '#010c18');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, W, H);

      // Shallow Turquoise Continental Shelves & Coral Reef Glows
      const drawShallowReef = (lon: number, lat: number, rx: number, ry: number) => {
        const [x, y] = toXY(lon, lat, W, H);
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.60)';
        ctx.fill();
        ctx.restore();
      };
      drawShallowReef(-77, 24, 75, 45); // Bahamas / Florida Keys
      drawShallowReef(147, -18, 110, 50); // Great Barrier Reef
      drawShallowReef(118, 12, 120, 80); // Indonesia & South China Sea
      drawShallowReef(-89, 21, 65, 35); // Yucatan Peninsula Shelf
      drawShallowReef(52, 26, 70, 35); // Persian Gulf & Red Sea
      drawShallowReef(13, 42, 45, 90); // Mediterranean Adriatic Sea

      // Color Palette for Realistic Earth Biomes
      const PALETTE = {
        rainforest: '#0d5c2e',
        jungleDark: '#043419',
        temperateForest: '#166534',
        taigaPine: '#14532d',
        savanna: '#65a30d',
        saharaDesert: '#d97706',
        desertRed: '#b45309',
        desertGold: '#f59e0b',
        tundraGrey: '#475569',
        iceWhite: '#f8fafc',
        mountainPeak: '#e2e8f0'
      };

      // Render Landmasses with Biome Variations
      const drawLand = (points: Array<[number, number]>, primaryColor: string, noiseSeed: number = 1.0) => {
        ctx.save();
        drawFractalPolygon(ctx, points, W, H, noiseSeed);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        // Realistic Coastline Wet Sands & Beaches
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.65)';
        ctx.stroke();
        ctx.restore();
      };

      // Draw Continents
      drawLand(GEO_CONTINENTS.southAmerica, PALETTE.rainforest, 1.2);
      drawLand(GEO_CONTINENTS.northAmerica, PALETTE.temperateForest, 2.1);
      drawLand(GEO_CONTINENTS.africa, PALETTE.savanna, 3.4);
      drawLand(GEO_CONTINENTS.europe, PALETTE.temperateForest, 4.2);
      drawLand(GEO_CONTINENTS.asia, PALETTE.taigaPine, 5.5);
      drawLand(GEO_CONTINENTS.australia, PALETTE.desertRed, 6.3);
      drawLand(GEO_CONTINENTS.greenland, PALETTE.iceWhite, 7.1);
      drawLand(GEO_CONTINENTS.madagascar, PALETTE.rainforest, 8.2);
      drawLand(GEO_CONTINENTS.japan, PALETTE.temperateForest, 9.0);
      drawLand(GEO_CONTINENTS.uk, PALETTE.temperateForest, 10.1);
      drawLand(GEO_CONTINENTS.antarctica, PALETTE.iceWhite, 11.2);

      // Sahara & Arabian Desert Overlay
      const drawDesertZone = (lon: number, lat: number, rx: number, ry: number) => {
        const [x, y] = toXY(lon, lat, W, H);
        const grad = ctx.createRadialGradient(x, y, 10, x, y, rx);
        grad.addColorStop(0, PALETTE.saharaDesert);
        grad.addColorStop(0.7, PALETTE.desertGold);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fill();
        ctx.restore();
      };
      drawDesertZone(18, 23, 190, 80); // Sahara Desert
      drawDesertZone(48, 22, 90, 50); // Arabian Peninsula Desert
      drawDesertZone(132, -25, 110, 60); // Australian Outback
      drawDesertZone(100, 42, 100, 40); // Gobi Desert

      // Amazon Rainforest Core Deep Green
      const drawRainforestZone = (lon: number, lat: number, rx: number, ry: number) => {
        const [x, y] = toXY(lon, lat, W, H);
        const grad = ctx.createRadialGradient(x, y, 5, x, y, rx);
        grad.addColorStop(0, PALETTE.jungleDark);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      };
      drawRainforestZone(-62, -5, 110, 65); // Amazon Basin
      drawRainforestZone(22, -1, 70, 45); // Congo Basin

      // Major Inland Water Bodies (Great Lakes, Caspian, Black Sea)
      const drawLakes = (lon: number, lat: number, rx: number, ry: number) => {
        const [x, y] = toXY(lon, lat, W, H);
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.restore();
      };
      drawLakes(-85, 45, 25, 15); // Great Lakes USA
      drawLakes(51, 42, 20, 35); // Caspian Sea
      drawLakes(34, 43, 22, 12); // Black Sea
      drawLakes(33, -1, 15, 15); // Lake Victoria

      // Major World River Arteries
      const drawRiver = (coords: Array<[number, number]>, width: number = 3) => {
        ctx.save();
        ctx.beginPath();
        const [sx, sy] = toXY(coords[0][0], coords[0][1], W, H);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < coords.length; i++) {
          const [px, py] = toXY(coords[i][0], coords[i][1], W, H);
          ctx.lineTo(px, py);
        }
        ctx.lineWidth = width;
        ctx.strokeStyle = '#0284c7';
        ctx.stroke();
        ctx.restore();
      };
      drawRiver([[-73, -4], [-65, -3], [-55, -2], [-48, 0]], 4); // Amazon
      drawRiver([[31, 3], [32, 15], [31, 28], [30, 31]], 3); // Nile
      drawRiver([[-92, 47], [-90, 38], [-89, 29]], 3); // Mississippi
      drawRiver([[100, 32], [112, 31], [121, 31]], 3); // Yangtze

      return new THREE.CanvasTexture(canvas);
    };

    // --- 2. SPECULAR MAP (Oceans = Bright Reflective White, Land = Dark Matte) ---
    const createEarthSpecularTexture = () => {
      const W = 2048, H = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      const drawLandSpec = (pts: Array<[number, number]>, noiseSeed: number = 1.0) => {
        ctx.save();
        drawFractalPolygon(ctx, pts, W, H, noiseSeed);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.restore();
      };

      drawLandSpec(GEO_CONTINENTS.southAmerica, 1.2);
      drawLandSpec(GEO_CONTINENTS.northAmerica, 2.1);
      drawLandSpec(GEO_CONTINENTS.africa, 3.4);
      drawLandSpec(GEO_CONTINENTS.europe, 4.2);
      drawLandSpec(GEO_CONTINENTS.asia, 5.5);
      drawLandSpec(GEO_CONTINENTS.australia, 6.3);
      drawLandSpec(GEO_CONTINENTS.greenland, 7.1);
      drawLandSpec(GEO_CONTINENTS.madagascar, 8.2);
      drawLandSpec(GEO_CONTINENTS.japan, 9.0);
      drawLandSpec(GEO_CONTINENTS.uk, 10.1);
      drawLandSpec(GEO_CONTINENTS.antarctica, 11.2);

      return new THREE.CanvasTexture(canvas);
    };

    // --- 3. NIGHT CITY LIGHTS EMISSIVE MAP ---
    const createEarthNightLightsTexture = () => {
      const W = 2048, H = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      const drawCityCluster = (lon: number, lat: number, radius: number, intensity: number) => {
        const [x, y] = toXY(lon, lat, W, H);
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgba(254, 240, 138, ${intensity})`);
        grad.addColorStop(0.35, `rgba(245, 158, 11, ${intensity * 0.8})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Major Metropolises
      drawCityCluster(-74, 40, 42, 1.0); // New York / US East Coast
      drawCityCluster(-118, 34, 38, 0.95); // Los Angeles
      drawCityCluster(-87, 41, 32, 0.9); // Chicago
      drawCityCluster(2, 48, 38, 1.0); // Paris
      drawCityCluster(0, 51, 40, 1.0); // London
      drawCityCluster(37, 55, 34, 0.9); // Moscow
      drawCityCluster(31, 30, 30, 0.85); // Cairo / Nile Belt
      drawCityCluster(139, 35, 48, 1.0); // Tokyo Megalopolis
      drawCityCluster(121, 31, 42, 0.95); // Shanghai / East China
      drawCityCluster(72, 19, 36, 0.9); // Mumbai / India
      drawCityCluster(-46, -23, 34, 0.85); // Sao Paulo
      drawCityCluster(-58, -34, 28, 0.85); // Buenos Aires
      drawCityCluster(151, -33, 28, 0.8); // Sydney
      drawCityCluster(-99, 19, 32, 0.85); // Mexico City
      drawCityCluster(127, 37, 32, 0.95); // Seoul
      drawCityCluster(100, 13, 28, 0.8); // Bangkok
      drawCityCluster(106, -6, 30, 0.85); // Jakarta

      // Inter-City Transportation Grid Sparks
      for (let i = 0; i < 450; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.70)';
        ctx.fillRect(x, y, Math.random() * 3.5 + 1, Math.random() * 3.5 + 1);
      }

      return new THREE.CanvasTexture(canvas);
    };

    // --- 4. HIGH-RELIEF 3D TOPOGRAPHIC ELEVATION BUMP MAP ---
    const createEarthBumpTexture = () => {
      const W = 2048, H = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      const drawLandBump = (pts: Array<[number, number]>, elevHex: string, noiseSeed: number = 1.0) => {
        ctx.save();
        drawFractalPolygon(ctx, pts, W, H, noiseSeed);
        ctx.fillStyle = elevHex;
        ctx.fill();
        ctx.restore();
      };

      drawLandBump(GEO_CONTINENTS.southAmerica, '#555555', 1.2);
      drawLandBump(GEO_CONTINENTS.northAmerica, '#555555', 2.1);
      drawLandBump(GEO_CONTINENTS.africa, '#444444', 3.4);
      drawLandBump(GEO_CONTINENTS.europe, '#666666', 4.2);
      drawLandBump(GEO_CONTINENTS.asia, '#777777', 5.5);
      drawLandBump(GEO_CONTINENTS.australia, '#444444', 6.3);

      // Major Mountain Ranges (Highland Elevation Whites)
      const drawMountainRidge = (coords: Array<[number, number]>, width: number) => {
        ctx.save();
        ctx.beginPath();
        const [sx, sy] = toXY(coords[0][0], coords[0][1], W, H);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < coords.length; i++) {
          const [px, py] = toXY(coords[i][0], coords[i][1], W, H);
          ctx.lineTo(px, py);
        }
        ctx.lineWidth = width;
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();
      };

      drawMountainRidge([[70, 30], [85, 35], [100, 28]], 28); // Himalayas & Tibetan Plateau
      drawMountainRidge([[-75, 8], [-72, -15], [-68, -35], [-70, -52]], 22); // Andes Mountain Spine
      drawMountainRidge([[-120, 58], [-110, 45], [-105, 35]], 22); // Rocky Mountains
      drawMountainRidge([[6, 46], [12, 47], [16, 46]], 18); // Alps
      drawMountainRidge([[38, 8], [40, 13], [38, 15]], 18); // Ethiopian Highlands

      return new THREE.CanvasTexture(canvas);
    };

    // --- 5. ATMOSPHERIC CLOUDS TEXTURE ---
    const createEarthCloudTexture = () => {
      const W = 2048, H = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 350; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const rx = Math.random() * 140 + 30;
        const ry = Math.random() * 25 + 6;
        const rot = (Math.random() - 0.5) * 0.5;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Cyclones & Hurricanes
      const drawCyclone = (cx: number, cy: number, r: number) => {
        for (let a = 0; a < 6; a++) {
          const baseA = (a / 6) * Math.PI * 2;
          for (let s = 0; s < 38; s++) {
            const frac = s / 38;
            const angle = baseA + frac * Math.PI * 3.8;
            const dist = frac * r;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(px, py, (1 - frac * 0.5) * 18, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.50 - frac * 0.25})`;
            ctx.fill();
          }
        }
      };

      drawCyclone(550, 360, 140);
      drawCyclone(1650, 310, 160);
      drawCyclone(1100, 680, 130);

      return new THREE.CanvasTexture(canvas);
    };

    // --- 5.5 ORBITAL TEXT RING FOR EARTH ---
    const createEarthTextOrbitalTexture = () => {
      const W = 2048, H = 256;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.clearRect(0, 0, W, H);

      // Cyber Glass Ribbon
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      bgGrad.addColorStop(0.2, 'rgba(15, 23, 42, 0.85)');
      bgGrad.addColorStop(0.8, 'rgba(15, 23, 42, 0.85)');
      bgGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 15, W, H - 30);

      // Top & Bottom Glowing Borders
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(0, 15); ctx.lineTo(W, 15);
      ctx.moveTo(0, H - 15); ctx.lineTo(W, H - 15);
      ctx.stroke();

      // Bold white/cyan/gold text with glow
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 86px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 25;

      const phrase = '  ★  NUEVAS DIMENSIONES  ★  NOVA3D  ★  IMPRESIÓN 3D';
      const textWidth = ctx.measureText(phrase).width || 900;

      let x = 0;
      while (x < W + textWidth) {
        ctx.fillText(phrase, x, H / 2);
        x += textWidth;
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    const createSunTextOrbitalTexture = () => {
      const W = 2048, H = 128;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.clearRect(0, 0, W, H);

      // Solar Golden/Amber Cyber Ribbon
      const bgGrad = ctx.createLinearGradient(0, 0, W, 0);
      bgGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      bgGrad.addColorStop(0.2, 'rgba(120, 53, 15, 0.85)');
      bgGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.9)');
      bgGrad.addColorStop(0.8, 'rgba(120, 53, 15, 0.85)');
      bgGrad.addColorStop(1, 'rgba(245, 158, 11, 0.35)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 15, W, H - 30);

      // Top & Bottom Glowing Amber Borders
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(0, 15); ctx.lineTo(W, 15);
      ctx.moveTo(0, H - 15); ctx.lineTo(W, H - 15);
      ctx.stroke();

      // Bold white/gold text with glow
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 82px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 25;

      const phrase = '  ★  PROPAGANDA & DEMOSTRACIÓN EN VIDEO  ★  NOVA3D';
      const textWidth = ctx.measureText(phrase).width || 1200;

      let x = 0;
      while (x < W + textWidth) {
        ctx.fillText(phrase, x, H / 2);
        x += textWidth;
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };


    // ==========================================
    // OTHER PLANETARY TEXTURE GENERATORS
    // ==========================================
    const createMoonTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Silver/Slate realistic lunar surface gradient base
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#f1f5f9');
      grad.addColorStop(0.5, '#cbd5e1');
      grad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Lunar Maria (dark basaltic plains)
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      const maria = [
        { x: 300, y: 200, rx: 120, ry: 90 },
        { x: 450, y: 160, rx: 140, ry: 100 },
        { x: 250, y: 320, rx: 90, ry: 70 },
        { x: 600, y: 250, rx: 110, ry: 80 },
        { x: 750, y: 180, rx: 80, ry: 60 },
      ];
      maria.forEach(m => {
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, m.rx, m.ry, 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Scatter 400 crisp crater dots matching user screenshot
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = Math.random() * 22 + 4;

        // Outer bright rim
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(248, 250, 252, 0.75)';
        ctx.fill();

        // Dark interior crater bowl
        ctx.beginPath();
        ctx.arc(x + r * 0.12, y + r * 0.12, r * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(51, 65, 85, 0.65)';
        ctx.fill();

        if (r > 12) {
          ctx.beginPath();
          ctx.arc(x, y, r * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
          ctx.fill();
        }
      }

      return new THREE.CanvasTexture(canvas);
    };

    const createCraterBumpTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = '#777777';
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 600; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = Math.random() * 26 + 3;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r * 0.70, 0, Math.PI * 2);
        ctx.fillStyle = '#111111';
        ctx.fill();

        if (r > 12) {
          ctx.beginPath();
          ctx.arc(x, y, r * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createMarsTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(0.5, '#ef4444');
        grad.addColorStop(1, '#991b1b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#450a0a';
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.ellipse(350, 260, 150, 95, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(480, 270);
        ctx.lineTo(780, 290);
        ctx.lineWidth = 18;
        ctx.strokeStyle = '#1c1917';
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.ellipse(W / 2, 20, 320, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(W / 2, H - 20, 280, 32, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createMarsBumpTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = '#555555';
      ctx.fillRect(0, 0, W, H);

      const grad = ctx.createRadialGradient(300, 220, 5, 300, 220, 105);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.8, '#888888');
      grad.addColorStop(1, '#555555');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(300, 220, 105, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(480, 260);
      ctx.lineTo(780, 280);
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      return new THREE.CanvasTexture(canvas);
    };

    const createJupiterTexture = () => {
      const W = 2048, H = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const bandColors = ['#fde047', '#fed7aa', '#ea580c', '#fef08a', '#c2410c', '#ffedd5', '#9a3412', '#fde047', '#fb923c', '#ca8a04'];
        for (let y = 0; y < H; y++) {
          const colorIdx = Math.floor((y / H) * bandColors.length);
          ctx.fillStyle = bandColors[colorIdx];
          ctx.fillRect(0, y, W, 1);
        }

        for (let i = 0; i < 65; i++) {
          const y = (i / 65) * H;
          ctx.beginPath();
          for (let x = 0; x < W; x += 15) {
            const waveY = y + Math.sin(x / 60) * 16 + Math.cos(x / 30) * 8;
            ctx.lineTo(x, waveY);
          }
          ctx.lineWidth = 20;
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(194, 65, 12, 0.50)' : 'rgba(254, 240, 138, 0.50)';
          ctx.stroke();
        }

        // GREAT RED SPOT STORM VORTEX
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(1350, 660, 160, 100, 0, 0, Math.PI * 2);
        const spotGrad = ctx.createRadialGradient(1350, 660, 10, 1350, 660, 160);
        spotGrad.addColorStop(0, '#7f1d1d');
        spotGrad.addColorStop(0.5, '#dc2626');
        spotGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = spotGrad;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.restore();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createGasBumpTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, W, H);

      for (let y = 0; y < H; y += 8) {
        ctx.beginPath();
        for (let x = 0; x < W; x += 10) {
          const waveY = y + Math.sin(x / 30) * 10;
          ctx.lineTo(x, waveY);
        }
        ctx.lineWidth = 6;
        ctx.strokeStyle = y % 16 === 0 ? '#ffffff' : '#333333';
        ctx.stroke();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createSunTexture = () => {
      const W = 2048, H = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // 1. Deep incandescent solar plasma gradient base
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0.0, '#ea580c'); // Deep solar orange poles
      grad.addColorStop(0.2, '#f59e0b'); // Golden amber
      grad.addColorStop(0.5, '#fde047'); // Bright solar yellow equator
      grad.addColorStop(0.8, '#f59e0b');
      grad.addColorStop(1.0, '#ea580c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 2. Solar Granulation / Photosphere Convection Cells (High resolution plasma grain)
      for (let y = 0; y < H; y += 4) {
        for (let x = 0; x < W; x += 4) {
          const n = Math.sin(x * 0.08) * Math.cos(y * 0.08) + Math.sin((x + y) * 0.05) * 0.5;
          if (n > 0.1) {
            ctx.fillStyle = `rgba(254, 240, 138, ${0.15 + n * 0.25})`;
            ctx.fillRect(x, y, 3, 3);
          } else if (n < -0.2) {
            ctx.fillStyle = `rgba(185, 28, 28, ${0.12 + Math.abs(n) * 0.20})`;
            ctx.fillRect(x, y, 3, 3);
          }
        }
      }

      // 3. Solar Plasma Turbulence & Swirling Magnetic Loops
      ctx.lineWidth = 14;
      for (let i = 0; i < 45; i++) {
        const yBase = (i / 45) * H;
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 30) {
          const waveY = yBase + Math.sin(x * 0.02 + i) * 25 + Math.cos(x * 0.04 - i) * 15;
          ctx.lineTo(x, waveY);
        }
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 243, 199, 0.28)' : 'rgba(217, 119, 6, 0.32)';
        ctx.stroke();
      }

      // 4. Photorealistic Active Solar Regions & Sunspots (Umbra + Penumbra)
      const sunspots = [
        { x: 500, y: 220, r: 38 },
        { x: 550, y: 240, r: 24 },
        { x: 1200, y: 310, r: 45 },
        { x: 1260, y: 290, r: 28 },
        { x: 1650, y: 210, r: 35 },
        { x: 300, y: 350, r: 22 }
      ];

      sunspots.forEach(spot => {
        // Bright Solar Faculae Halo surrounding active regions
        const faculaeGrad = ctx.createRadialGradient(spot.x, spot.y, spot.r * 0.8, spot.x, spot.y, spot.r * 2.5);
        faculaeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        faculaeGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.45)');
        faculaeGrad.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
        ctx.fillStyle = faculaeGrad;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Penumbra (Dark reddish-brown outer region)
        const penumbraGrad = ctx.createRadialGradient(spot.x, spot.y, spot.r * 0.3, spot.x, spot.y, spot.r);
        penumbraGrad.addColorStop(0, '#450a0a');
        penumbraGrad.addColorStop(0.7, '#78350f');
        penumbraGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = penumbraGrad;
        ctx.beginPath();
        ctx.ellipse(spot.x, spot.y, spot.r, spot.r * 0.75, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Umbra (Deep dark cool core)
        ctx.fillStyle = '#180202';
        ctx.beginPath();
        ctx.ellipse(spot.x + spot.r * 0.08, spot.y + spot.r * 0.08, spot.r * 0.45, spot.r * 0.35, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. White-Hot Solar Flares & Bright Prominence Patches
      for (let i = 0; i < 20; i++) {
        const fx = Math.random() * W;
        const fy = Math.random() * H;
        const fr = Math.random() * 30 + 15;
        const flareGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
        flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        flareGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.60)');
        flareGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const createVenusTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#eab308');
        grad.addColorStop(0.7, '#ca8a04');
        grad.addColorStop(1, '#854d0e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        for (let y = 0; y < H; y += 12) {
          ctx.beginPath();
          for (let x = 0; x < W; x += 10) {
            const waveY = y + Math.sin(x / 40) * 15 + Math.cos(x / 20) * 8;
            ctx.lineTo(x, waveY);
          }
          ctx.lineWidth = Math.random() * 8 + 4;
          ctx.strokeStyle = `rgba(254, 243, 199, ${Math.random() * 0.4 + 0.1})`;
          ctx.stroke();
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createSaturnTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.3, '#fde047');
        grad.addColorStop(0.6, '#eab308');
        grad.addColorStop(1, '#a16207');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createSaturnRingsTexture = () => {
      const W = 1024, H = 128;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        for (let x = 0; x < W; x++) {
          const frac = x / W;
          if ((frac > 0.65 && frac < 0.70) || (frac > 0.88 && frac < 0.90)) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
          } else {
            const alpha = Math.sin(frac * Math.PI) * 0.92;
            ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
          }
          ctx.fillRect(x, 0, 1, H);
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createNeptuneTexture = () => {
      const W = 1024, H = 512;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#0369a1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#0f172a';
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.ellipse(600, 280, 85, 55, -0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.75;
        ctx.fillRect(580, 220, 130, 7);
        ctx.fillRect(620, 340, 95, 6);
      }
      return new THREE.CanvasTexture(canvas);
    };


    // Helper function for creating glowing 3D orbit rings
    const createOrbitRing = (radius: number, color = 0x38bdf8, opacity = 0.45, tube = 0.03, tiltX = Math.PI / 2, tiltZ = 0) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 120);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = tiltX;
      ringMesh.rotation.z = tiltZ;
      return ringMesh;
    };

    // ==========================================
    // 2. CREATE PLANETARY 3D OBJECTS
    // ==========================================

    // STATION 0: EARTH & MOON (0, 0, 0)
    const earthRadius = 2.8;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    const earthMat = new THREE.MeshPhongMaterial({
      map: createEarthTexture(),
      bumpMap: createEarthBumpTexture(),
      bumpScale: 0.38,
      specularMap: createEarthSpecularTexture(),
      specular: new THREE.Color(0x38bdf8),
      shininess: 32,
      emissiveMap: createEarthNightLightsTexture(),
      emissive: new THREE.Color(0xffa500),
      emissiveIntensity: 0.95
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
    mainGroup.add(earthMesh);

    // Realistic Cloud Layer Mesh
    const earthCloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(earthRadius * 1.018, 64, 64),
      new THREE.MeshStandardMaterial({
        map: createEarthCloudTexture(),
        transparent: true,
        opacity: 0.28,
        blending: THREE.NormalBlending,
        depthWrite: false
      })
    );
    earthMesh.add(earthCloudMesh);

    // Rayleigh Atmosphere Scattering Fresnel Glow Shader
    const atmosphereShader = {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.22, 0.68, 1.0, 1.0) * intensity * 1.35;
        }
      `
    };

    const atmoGeo = new THREE.SphereGeometry(earthRadius * 1.12, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereShader.vertexShader,
      fragmentShader: atmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    mainGroup.add(new THREE.Mesh(atmoGeo, atmoMat));

    // Moon Orbiting Earth with Glowing Orbit Ring
    const moonGeo = new THREE.SphereGeometry(0.68, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      bumpMap: createCraterBumpTexture(),
      bumpScale: 0.28,
      roughness: 0.85
    });
    const moonPivot = new THREE.Group();
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(5.2, 0, 0);
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;
    moonPivot.add(moonMesh);
    mainGroup.add(moonPivot);

    const earthMoonOrbitRing = createOrbitRing(5.2, 0x38bdf8, 0.42, 0.032, Math.PI / 2.2, 0.1);
    mainGroup.add(earthMoonOrbitRing);

    // 3D Orbital Text Ring wrapped around Earth ("IMPRIMÍ TODO EN 3D")
    const earthTextRingGeo = new THREE.CylinderGeometry(earthRadius * 1.35, earthRadius * 1.35, 0.72, 64, 1, true);
    const earthTextTexture = createEarthTextOrbitalTexture();
    const earthTextRingMat = new THREE.MeshBasicMaterial({
      map: earthTextTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const earthTextOrbitalMesh = new THREE.Mesh(earthTextRingGeo, earthTextRingMat);
    earthTextOrbitalMesh.rotation.x = 0;
    earthTextOrbitalMesh.rotation.z = 0;
    mainGroup.add(earthTextOrbitalMesh);


    // STATION 1: SUN & MERCURY (-18, -4, -45)
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-18, -4, -45);
    mainGroup.add(sunGroup);

    const sunGeo = new THREE.SphereGeometry(6.5, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ map: createSunTexture() });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    const sunPointLight = new THREE.PointLight(0xfff5d6, 4.2, 350);
    sunGroup.add(sunPointLight);

    // Solar Corona Fresnel Rim Glow Shader
    const sunCoronaShader = {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.78 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          vec3 solarGold = vec3(1.0, 0.88, 0.42);
          vec3 solarAmber = vec3(0.96, 0.58, 0.05);
          
          vec3 glowColor = mix(solarAmber, solarGold, smoothstep(0.0, 0.8, intensity));
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 1.1;
        }
      `
    };

    const sunFresnelGeo = new THREE.SphereGeometry(6.5 * 1.06, 64, 64);
    const sunFresnelMat = new THREE.ShaderMaterial({
      vertexShader: sunCoronaShader.vertexShader,
      fragmentShader: sunCoronaShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const sunCoronaMesh = new THREE.Mesh(sunFresnelGeo, sunFresnelMat);
    sunGroup.add(sunCoronaMesh);

    // Outer Soft Solar Corona Atmosphere
    const sunGlowGeo2 = new THREE.SphereGeometry(8.2, 48, 48);
    const sunGlowMat2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    sunGroup.add(new THREE.Mesh(sunGlowGeo2, sunGlowMat2));

    // Deep Cosmic Solar Flare Halo
    const sunGlowGeo3 = new THREE.SphereGeometry(10.5, 32, 32);
    const sunGlowMat3 = new THREE.MeshBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    sunGroup.add(new THREE.Mesh(sunGlowGeo3, sunGlowMat3));

    // 3D Orbital Text Ring wrapped around Sun ("PROPAGANDA & DEMOSTRACIÓN EN VIDEO")
    const sunTextRingGeo = new THREE.CylinderGeometry(6.5 * 1.38, 6.5 * 1.38, 1.2, 64, 1, true);
    const sunTextTexture = createSunTextOrbitalTexture();
    const sunTextRingMat = new THREE.MeshBasicMaterial({
      map: sunTextTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const sunTextOrbitalMesh = new THREE.Mesh(sunTextRingGeo, sunTextRingMat);
    sunTextOrbitalMesh.rotation.x = 0;
    sunTextOrbitalMesh.rotation.z = 0;
    sunGroup.add(sunTextOrbitalMesh);

    // Mercury Orbiting Sun
    const mercuryPivot = new THREE.Group();
    sunGroup.add(mercuryPivot);

    const mercuryGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const mercuryMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      bumpMap: createCraterBumpTexture(),
      bumpScale: 0.32,
      roughness: 0.85
    });
    const mercuryMesh = new THREE.Mesh(mercuryGeo, mercuryMat);
    mercuryMesh.position.set(10.5, 0, 0);
    mercuryPivot.add(mercuryMesh);

    const mercuryOrbitRing = createOrbitRing(10.5, 0xfbbf24, 0.45, 0.038, Math.PI / 2, 0);
    sunGroup.add(mercuryOrbitRing);


    // STATION 2: VENUS (20, 8, -90)
    const venusGroup = new THREE.Group();
    venusGroup.position.set(20, 8, -90);
    mainGroup.add(venusGroup);

    const venusGeo = new THREE.SphereGeometry(2.6, 48, 48);
    const venusMat = new THREE.MeshStandardMaterial({
      map: createVenusTexture(),
      bumpMap: createGasBumpTexture(),
      bumpScale: 0.18,
      roughness: 0.4
    });
    const venusMesh = new THREE.Mesh(venusGeo, venusMat);
    venusGroup.add(venusMesh);

    // Orbit Ring & Orbiting Research Probe / Satellite
    const venusOrbitalPivot = new THREE.Group();
    venusGroup.add(venusOrbitalPivot);

    const venusOrbitRing = createOrbitRing(4.5, 0xfde047, 0.42, 0.03, Math.PI / 2.2, -0.15);
    venusGroup.add(venusOrbitRing);

    const venusProbeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    venusProbeMesh.position.set(4.5, 0, 0);
    venusOrbitalPivot.add(venusProbeMesh);


    // STATION 3: MARS & MOONS (-22, -6, -140)
    const marsGroup = new THREE.Group();
    marsGroup.position.set(-22, -6, -140);
    mainGroup.add(marsGroup);

    const marsGeo = new THREE.SphereGeometry(2.0, 48, 48);
    const marsMat = new THREE.MeshStandardMaterial({
      map: createMarsTexture(),
      bumpMap: createMarsBumpTexture(),
      bumpScale: 0.35,
      roughness: 0.65
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsGroup.add(marsMesh);

    const marsAtmoGeo = new THREE.SphereGeometry(2.08, 32, 32);
    const marsAtmoMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    marsGroup.add(new THREE.Mesh(marsAtmoGeo, marsAtmoMat));

    // Phobos & Deimos Pivots + Orbit Rings
    const phobosPivot = new THREE.Group();
    const deimosPivot = new THREE.Group();
    marsGroup.add(phobosPivot);
    marsGroup.add(deimosPivot);

    const phobosOrbitRing = createOrbitRing(3.8, 0xef4444, 0.45, 0.028, Math.PI / 2.1, 0.12);
    const deimosOrbitRing = createOrbitRing(5.6, 0xf87171, 0.38, 0.025, Math.PI / 2.3, -0.18);
    marsGroup.add(phobosOrbitRing);
    marsGroup.add(deimosOrbitRing);

    const phobosMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x78716c,
        bumpMap: createCraterBumpTexture(),
        bumpScale: 0.22,
        roughness: 0.9
      })
    );
    phobosMesh.position.set(3.8, 0, 0);
    phobosPivot.add(phobosMesh);

    const deimosMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xa8a29e,
        bumpMap: createCraterBumpTexture(),
        bumpScale: 0.2,
        roughness: 0.9
      })
    );
    deimosMesh.position.set(5.6, 0, 0);
    deimosPivot.add(deimosMesh);


    // STATION 4: JUPITER & GALILEAN MOONS (26, 10, -195)
    const jupiterGroup = new THREE.Group();
    jupiterGroup.position.set(26, 10, -195);
    mainGroup.add(jupiterGroup);

    const jupiterGeo = new THREE.SphereGeometry(4.2, 64, 64);
    const jupiterMat = new THREE.MeshStandardMaterial({
      map: createJupiterTexture(),
      bumpMap: createGasBumpTexture(),
      bumpScale: 0.16,
      roughness: 0.5
    });
    const jupiterMesh = new THREE.Mesh(jupiterGeo, jupiterMat);
    jupiterGroup.add(jupiterMesh);

    // Galilean Moon Pivots & Orbit Rings
    const ioPivot = new THREE.Group();
    const europaPivot = new THREE.Group();
    const ganymedePivot = new THREE.Group();
    jupiterGroup.add(ioPivot);
    jupiterGroup.add(europaPivot);
    jupiterGroup.add(ganymedePivot);

    const ioOrbitRing = createOrbitRing(6.2, 0xfacc15, 0.42, 0.035, Math.PI / 2.2, 0.1);
    const europaOrbitRing = createOrbitRing(8.5, 0x38bdf8, 0.4, 0.035, Math.PI / 2.0, -0.15);
    const ganymedeOrbitRing = createOrbitRing(11.0, 0xc084fc, 0.38, 0.03, Math.PI / 2.3, 0.2);
    jupiterGroup.add(ioOrbitRing);
    jupiterGroup.add(europaOrbitRing);
    jupiterGroup.add(ganymedeOrbitRing);

    const ioMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.8 })
    );
    ioMesh.position.set(6.2, 0, 0);
    ioPivot.add(ioMesh);

    const europaMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
    );
    europaMesh.position.set(8.5, 0, 0);
    europaPivot.add(europaMesh);

    const ganymedeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.7 })
    );
    ganymedeMesh.position.set(11.0, 0, 0);
    ganymedePivot.add(ganymedeMesh);


    // STATION 5: SATURN, 3D RINGS & TITAN (-28, -10, -255)
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(-28, -10, -255);
    saturnGroup.rotation.z = 0.45;
    mainGroup.add(saturnGroup);

    const saturnGeo = new THREE.SphereGeometry(3.6, 48, 48);
    const saturnMat = new THREE.MeshStandardMaterial({
      map: createSaturnTexture(),
      bumpMap: createGasBumpTexture(),
      bumpScale: 0.14,
      roughness: 0.5
    });
    const saturnMesh = new THREE.Mesh(saturnGeo, saturnMat);
    saturnMesh.castShadow = true;
    saturnMesh.receiveShadow = true;
    saturnGroup.add(saturnMesh);

    const ringGeo = new THREE.RingGeometry(4.6, 9.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: createSaturnRingsTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94
    });
    const saturnRingsMesh = new THREE.Mesh(ringGeo, ringMat);
    saturnRingsMesh.rotation.x = Math.PI / 2;
    saturnRingsMesh.receiveShadow = true;
    saturnGroup.add(saturnRingsMesh);

    const titanPivot = new THREE.Group();
    saturnGroup.add(titanPivot);

    const titanOrbitRing = createOrbitRing(11.2, 0xfacc15, 0.45, 0.04, Math.PI / 2, 0);
    saturnGroup.add(titanOrbitRing);

    const titanMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 })
    );
    titanMesh.position.set(11.2, 0, 0);
    titanPivot.add(titanMesh);


    // STATION 6: NEPTUNE (22, 8, -315)
    const neptuneGroup = new THREE.Group();
    neptuneGroup.position.set(22, 8, -315);
    mainGroup.add(neptuneGroup);

    const neptuneGeo = new THREE.SphereGeometry(2.5, 48, 48);
    const neptuneMat = new THREE.MeshStandardMaterial({
      map: createNeptuneTexture(),
      bumpMap: createGasBumpTexture(),
      bumpScale: 0.12,
      roughness: 0.4
    });
    const neptuneMesh = new THREE.Mesh(neptuneGeo, neptuneMat);
    neptuneGroup.add(neptuneMesh);

    const tritonPivot = new THREE.Group();
    neptuneGroup.add(tritonPivot);

    const tritonOrbitRing = createOrbitRing(5.2, 0x06b6d4, 0.45, 0.035, Math.PI / 2.15, -0.18);
    neptuneGroup.add(tritonOrbitRing);

    const tritonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x67e8f9, roughness: 0.6 })
    );
    tritonMesh.position.set(5.2, 0, 0);
    tritonPivot.add(tritonMesh);


    // ==========================================
    // 3. DEEP SPACE COSMIC BACKGROUND & NEBULAE
    // ==========================================
    const createStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Soft circular star point with radial glow (eliminates square WebGL points)
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.15, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      return new THREE.CanvasTexture(canvas);
    };

    const starTexture = createStarTexture();

    const starCount = 6000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const possibleColors = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x38bdf8), // Cyan star
      new THREE.Color(0xfde047), // Warm yellow star
      new THREE.Color(0xa855f7), // Purple star
      new THREE.Color(0xf87171)  // Red giant
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 320;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 320;
      starPositions[i * 3 + 2] = -Math.random() * 500;

      const col = possibleColors[Math.floor(Math.random() * possibleColors.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 1.1,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    }));
    scene.add(starPoints);

    const createNebulaCloud = (colorHex: number, x: number, y: number, z: number, scale: number) => {
      const nebGeo = new THREE.SphereGeometry(scale, 16, 16);
      const nebMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      });
      const nebMesh = new THREE.Mesh(nebGeo, nebMat);
      nebMesh.position.set(x, y, z);
      scene.add(nebMesh);
    };
    createNebulaCloud(0x38bdf8, 30, -20, -180, 45);
    createNebulaCloud(0xa855f7, -40, 20, -280, 55);
    createNebulaCloud(0xf43f5e, 10, -30, -360, 60);

    // Passing Comet
    const cometGroup = new THREE.Group();
    scene.add(cometGroup);
    cometGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    ));

    let cometActive = false;
    let cometPos = new THREE.Vector3();
    let cometVel = new THREE.Vector3();

    const triggerComet = () => {
      cometActive = true;
      cometPos.set((Math.random() - 0.5) * 40, Math.random() * 20 + 10, camera.position.z - 30);
      cometVel.set(-0.38, -0.25, -0.14);
      cometGroup.position.copy(cometPos);
      cometGroup.visible = true;
    };


    // STATION 7: SUPERMASSIVE BLACK HOLE (0, 0, -385)
    // Helper: Superheated Plasma Accretion Disk Texture Generator
    const createBlackHoleDiskTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const center = 512;
      const radius = 512;

      // Concentric Radial Plasma Gradient
      const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
      grad.addColorStop(0.00, 'rgba(0, 0, 0, 0.0)');
      grad.addColorStop(0.22, 'rgba(0, 0, 0, 0.0)');
      grad.addColorStop(0.25, 'rgba(255, 255, 255, 1.0)'); // Blinding white-hot inner rim
      grad.addColorStop(0.30, 'rgba(254, 240, 138, 0.98)'); // Incandescent blue-gold plasma
      grad.addColorStop(0.42, 'rgba(249, 115, 22, 0.88)'); // Hyper-hot orange
      grad.addColorStop(0.62, 'rgba(225, 29, 72, 0.65)');  // Deep crimson red
      grad.addColorStop(0.82, 'rgba(147, 51, 234, 0.30)'); // Relativistic purple haze
      grad.addColorStop(1.00, 'rgba(0, 0, 0, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw swirling plasma noise filaments and logarithmic spiral arcs
      ctx.save();
      ctx.translate(center, center);
      const spiralLines = 220;
      for (let i = 0; i < spiralLines; i++) {
        const angle = (i / spiralLines) * Math.PI * 2;
        const innerR = 130 + Math.random() * 25;
        const outerR = 430 + Math.random() * 70;

        ctx.strokeStyle = `rgba(255, ${Math.floor(130 + Math.random() * 125)}, ${Math.floor(20 + Math.random() * 110)}, ${0.08 + Math.random() * 0.20})`;
        ctx.lineWidth = 1.8 + Math.random() * 3.5;

        ctx.beginPath();
        for (let r = innerR; r < outerR; r += 10) {
          const twist = angle + (r - innerR) * 0.009;
          const x = Math.cos(twist) * r;
          const y = Math.sin(twist) * r;
          if (r === innerR) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    const blackHoleGroup = new THREE.Group();
    blackHoleGroup.position.set(0, 0, -385);
    mainGroup.add(blackHoleGroup);

    // 1. Singularity Event Horizon (Pitch Black Sphere that absorbs all light)
    const singularityGeo = new THREE.SphereGeometry(5.2, 64, 64);
    const singularityMat = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    const singularityMesh = new THREE.Mesh(singularityGeo, singularityMat);
    blackHoleGroup.add(singularityMesh);

    // 2. Photon Ring (Razor-thin Einstein Light Border)
    const photonRingShader = {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.8);
          vec3 brightCore = vec3(1.0, 0.98, 0.85);
          vec3 orangeEdge = vec3(0.98, 0.45, 0.08);
          vec3 col = mix(orangeEdge, brightCore, smoothstep(0.1, 0.8, intensity));
          gl_FragColor = vec4(col, 1.0) * intensity * 3.5;
        }
      `
    };
    const photonRingGeo = new THREE.SphereGeometry(5.38, 64, 64);
    const photonRingMat = new THREE.ShaderMaterial({
      vertexShader: photonRingShader.vertexShader,
      fragmentShader: photonRingShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const photonRingMesh = new THREE.Mesh(photonRingGeo, photonRingMat);
    blackHoleGroup.add(photonRingMesh);

    // 3. Main Accretion Disk (Horizontal Plasma Disc passing through black hole equator)
    const diskTexture = createBlackHoleDiskTexture();
    const accretionDiskGeo = new THREE.RingGeometry(5.4, 22.0, 128);
    const accretionDiskMat = new THREE.MeshBasicMaterial({
      map: diskTexture,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const accretionDiskMesh = new THREE.Mesh(accretionDiskGeo, accretionDiskMat);
    // Horizontal disk orientation across equator, tilted slightly ~12° towards camera for 3D depth
    accretionDiskMesh.rotation.x = Math.PI / 2 - 0.22;
    accretionDiskMesh.rotation.y = 0;
    accretionDiskMesh.rotation.z = 0;
    blackHoleGroup.add(accretionDiskMesh);

    // 4. Vertical Gravitational Lensing Arc (Light Warped Over & Under Event Horizon)
    const lensingArcGeo = new THREE.RingGeometry(5.4, 18.5, 128);
    const lensingArcMat = new THREE.MeshBasicMaterial({
      map: diskTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const lensingArcMesh = new THREE.Mesh(lensingArcGeo, lensingArcMat);
    lensingArcMesh.rotation.x = 0;
    lensingArcMesh.rotation.y = 0;
    lensingArcMesh.rotation.z = 0;
    blackHoleGroup.add(lensingArcMesh);

    // 5. Outer Gravitational Lensing & Distortion Halo (Ultra-Subtle & Faint)
    const lensHaloShader = {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float glow = pow(rim, 4.2);
          vec3 cyanGlow = vec3(0.3, 0.7, 1.0);
          vec3 goldGlow = vec3(1.0, 0.5, 0.1);
          vec3 purpleGlow = vec3(0.5, 0.2, 0.8);
          
          vec3 col = mix(goldGlow, cyanGlow, smoothstep(0.3, 0.8, glow));
          col = mix(col, purpleGlow, smoothstep(0.8, 1.0, glow));
          
          // Very faint, almost invisible atmospheric lensing glow for high realism
          gl_FragColor = vec4(col, 1.0) * glow * 0.18;
        }
      `
    };
    const lensHaloGeo = new THREE.SphereGeometry(26.0, 48, 48);
    const lensHaloMat = new THREE.ShaderMaterial({
      vertexShader: lensHaloShader.vertexShader,
      fragmentShader: lensHaloShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const lensHaloMesh = new THREE.Mesh(lensHaloGeo, lensHaloMat);
    blackHoleGroup.add(lensHaloMesh);

    // 6. Infalling Light & Matter Spiral Particles (Horizontal Infalling Swirl)
    const infallingCount = 500;
    const infallingGeo = new THREE.BufferGeometry();
    const infallingPositions = new Float32Array(infallingCount * 3);
    const infallingColors = new Float32Array(infallingCount * 3);
    const infallingRadii = new Float32Array(infallingCount);
    const infallingAngles = new Float32Array(infallingCount);
    const infallingSpeeds = new Float32Array(infallingCount);
    const infallingYOffsets = new Float32Array(infallingCount);

    for (let i = 0; i < infallingCount; i++) {
      const r = 5.5 + Math.random() * 18.0;
      const angle = Math.random() * Math.PI * 2;
      infallingRadii[i] = r;
      infallingAngles[i] = angle;
      infallingSpeeds[i] = 0.06 + Math.random() * 0.10;
      infallingYOffsets[i] = (Math.random() - 0.5) * (r * 0.15);

      infallingPositions[i * 3] = Math.cos(angle) * r;
      infallingPositions[i * 3 + 1] = infallingYOffsets[i];
      infallingPositions[i * 3 + 2] = Math.sin(angle) * r;

      const col = Math.random() > 0.4 ? new THREE.Color(0xfde047) : new THREE.Color(0x38bdf8);
      infallingColors[i * 3] = col.r;
      infallingColors[i * 3 + 1] = col.g;
      infallingColors[i * 3 + 2] = col.b;
    }

    infallingGeo.setAttribute('position', new THREE.BufferAttribute(infallingPositions, 3));
    infallingGeo.setAttribute('color', new THREE.BufferAttribute(infallingColors, 3));

    const infallingParticles = new THREE.Points(infallingGeo, new THREE.PointsMaterial({
      size: 0.9,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    // Align particles with the horizontal accretion disk tilt
    infallingParticles.rotation.x = -0.22;
    blackHoleGroup.add(infallingParticles);


    // ==========================================
    // 4. LIGHTING & ILLUMINATION
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const mainSunLight = new THREE.DirectionalLight(0xfff5d6, 2.9);
    mainSunLight.position.set(16, 18, 14);
    mainSunLight.castShadow = true;
    scene.add(mainSunLight);


    // ==========================================
    // 5. CAMERA TRAJECTORY CATMULL-ROM SPLINE
    // ==========================================
    const cameraWaypoints = [
      new THREE.Vector3(0, 0, 11.5),      // 0. Earth
      new THREE.Vector3(-10, -2, -32),    // 1. Sun & Mercury
      new THREE.Vector3(14, 6, -76),      // 2. Venus
      new THREE.Vector3(-15, -4, -125),   // 3. Mars
      new THREE.Vector3(18, 8, -178),     // 4. Jupiter
      new THREE.Vector3(-20, -8, -238),   // 5. Saturn
      new THREE.Vector3(14, 6, -298),     // 6. Uranus & Neptune
      new THREE.Vector3(0, 0, -355)       // 7. Deep Space
    ];

    const lookAtWaypoints = [
      new THREE.Vector3(0, 0, 0),         // 0. Earth
      new THREE.Vector3(-18, -4, -45),    // 1. Sun & Mercury
      new THREE.Vector3(20, 8, -90),      // 2. Venus
      new THREE.Vector3(-22, -6, -140),   // 3. Mars
      new THREE.Vector3(26, 10, -195),    // 4. Jupiter
      new THREE.Vector3(-28, -10, -255),  // 5. Saturn
      new THREE.Vector3(22, 8, -315),     // 6. Uranus & Neptune
      new THREE.Vector3(0, 0, -380)       // 7. Deep Space
    ];

    const cameraCurve = new THREE.CatmullRomCurve3(cameraWaypoints, false, 'catmullrom', 0.5);
    const lookAtCurve = new THREE.CatmullRomCurve3(lookAtWaypoints, false, 'catmullrom', 0.5);


    // ==========================================
    // 6. SCROLL & MOUSE INTERACTION LOGIC
    // ==========================================
    let targetProgress = 0;
    let currentProgress = 0;

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const raw = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      targetProgress = raw;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let targetX = 0, targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.0004;
      targetY = (e.clientY - window.innerHeight / 2) * 0.0004;
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
    // 7. ANIMATION LOOP & FLIGHT PHYSICS
    // ==========================================
    let animationFrameId: number;
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      frameCount++;

      currentProgress += (targetProgress - currentProgress) * 0.06;

      const clampedProg = Math.min(0.999, Math.max(0.0001, currentProgress));
      const camPos = cameraCurve.getPoint(clampedProg);
      const lookTarget = lookAtCurve.getPoint(clampedProg);

      camera.position.copy(camPos);
      camera.lookAt(lookTarget);

      // Rotate Planets, Moons & Orbital Pivots
      starPoints.rotation.y += 0.0001;
      earthMesh.rotation.y += 0.003;
      earthCloudMesh.rotation.y += 0.0038;
      earthTextOrbitalMesh.rotation.y += 0.005;
      earthTextTexture.offset.x -= 0.002;
      moonPivot.rotation.y += 0.008;

      sunMesh.rotation.y += 0.001;
      sunCoronaMesh.rotation.y -= 0.0008;
      sunTextOrbitalMesh.rotation.y += 0.005;
      sunTextTexture.offset.x -= 0.002;
      const sunPulse = 1.0 + Math.sin(frameCount * 0.035) * 0.022;
      sunCoronaMesh.scale.set(sunPulse, sunPulse, sunPulse);
      mercuryPivot.rotation.y += 0.014;

      venusMesh.rotation.y += 0.002;
      venusOrbitalPivot.rotation.y += 0.010;

      marsMesh.rotation.y += 0.003;
      phobosPivot.rotation.y += 0.016;
      deimosPivot.rotation.y += 0.009;

      jupiterMesh.rotation.y += 0.004;
      ioPivot.rotation.y += 0.017;
      europaPivot.rotation.y += 0.012;
      ganymedePivot.rotation.y += 0.007;

      saturnMesh.rotation.y += 0.003;
      titanPivot.rotation.y += 0.008;

      neptuneMesh.rotation.y += 0.003;
      tritonPivot.rotation.y += 0.011;

      // Animate Supermassive Black Hole Accretion Disk & Infalling Particles
      accretionDiskMesh.rotation.z += 0.007;
      lensingArcMesh.rotation.z -= 0.005;
      photonRingMesh.rotation.y += 0.003;

      const infallingPosAttr = infallingGeo.attributes.position as THREE.BufferAttribute;
      const infallingArray = infallingPosAttr.array as Float32Array;
      for (let i = 0; i < infallingCount; i++) {
        infallingAngles[i] += 0.012 + (1.0 / infallingRadii[i]) * 0.08;
        infallingRadii[i] -= infallingSpeeds[i];

        // If light particle crosses event horizon (r <= 5.2), swallow it and respawn at outer rim
        if (infallingRadii[i] <= 5.2) {
          infallingRadii[i] = 22.0 + Math.random() * 4.0;
          infallingAngles[i] = Math.random() * Math.PI * 2;
          infallingYOffsets[i] = (Math.random() - 0.5) * (infallingRadii[i] * 0.15);
        }

        infallingArray[i * 3] = Math.cos(infallingAngles[i]) * infallingRadii[i];
        infallingArray[i * 3 + 1] = infallingYOffsets[i] * (infallingRadii[i] / 22.0);
        infallingArray[i * 3 + 2] = Math.sin(infallingAngles[i]) * infallingRadii[i];
      }
      infallingPosAttr.needsUpdate = true;

      if (cometActive) {
        cometPos.add(cometVel);
        cometGroup.position.copy(cometPos);
        if (cometPos.y < -30) cometActive = false;
      } else if (Math.random() < 0.005) {
        triggerComet();
      }

      mainGroup.rotation.y += (targetX - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetY - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);

      if (frameCount % 8 === 0) {
        setScrollProgress(currentProgress);
        let bestPlanet = PLANETS_DATA[0];
        let minDist = 999;
        PLANETS_DATA.forEach((p) => {
          const dist = Math.abs(p.scrollFraction - currentProgress);
          if (dist < minDist) {
            minDist = dist;
            bestPlanet = p;
          }
        });
        setActivePlanet(bestPlanet);
      }
    };

    animate();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const jumpToPlanet = (fraction: number) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: fraction * maxScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      {/* 3D WebGL Space Voyage Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing" />

      {/* SPACE FLIGHT HUD TELEMETRY OVERLAY */}
      <div className="fixed top-[145px] left-4 right-4 md:left-6 md:right-6 z-20 pointer-events-none flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        {/* Active Target Planet Telemetry Card */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 text-white px-2.5 py-1.5 rounded-xl flex items-center gap-2 shadow-lg pointer-events-auto transition-all duration-300">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <Rocket className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-none mb-0.5">
              <span className="text-[8.5px] font-mono tracking-wider text-cyan-400 font-bold uppercase flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                FASE {activePlanet.phase}/8
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex items-center gap-1.5 leading-tight">
              <h3 className="text-[11px] font-bold text-white tracking-wide truncate">
                {activePlanet.name}
              </h3>
              {activePlanet.id === 'earth' && (
                <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded font-mono flex items-center gap-0.5 shrink-0">
                  <Globe className="w-2 h-2 text-emerald-400" /> HD
                </span>
              )}
            </div>
            <p className="text-[9.5px] text-slate-400 font-mono truncate leading-tight">
              {activePlanet.subtitle} &bull; <span className="text-cyan-300 font-semibold">{activePlanet.distanceAU}</span>
            </p>
          </div>
        </div>

        {/* Flight Progress Telemetry */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-slate-300 text-[10px] font-mono hidden lg:flex items-center gap-2 pointer-events-auto shadow-md">
          <Compass className="w-3 h-3 text-amber-400 animate-spin" />
          <span>VUELO: <strong className="text-amber-400">{Math.round(scrollProgress * 100)}%</strong></span>
          <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-500 transition-all duration-150"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* QUICK PLANETARY WARP SELECTOR BAR (BOTTOM CENTER) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 backdrop-blur-lg border border-cyan-500/30 px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-2xl pointer-events-auto overflow-x-auto max-w-[95vw]">
        {PLANETS_DATA.map((p) => {
          const isActive = activePlanet.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => jumpToPlanet(p.scrollFraction)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold shadow-lg scale-105' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <span>{p.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HeroScene;
