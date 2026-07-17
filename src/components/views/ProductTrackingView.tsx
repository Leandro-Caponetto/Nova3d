import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Truck, Navigation, Shield, Check, Phone, MessageSquare, 
  Clock, Map as MapIcon, Play, Pause, RotateCcw, AlertCircle, 
  Sparkles, Star, ChevronRight, ArrowLeft, RefreshCw, UserCheck,
  Mail, X, ExternalLink, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Product } from '../../types';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Vite builds (using Custom CSS & DivIcons instead)
// This ensures we never get a 404 on marker shadow or marker-icon PNGs.
const leafletCustomStyles = `
  .leaflet-container {
    background: #0f172a !important;
  }
  .leaflet-bar {
    border: 1px solid #334155 !important;
    background-color: #0f172a !important;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
  }
  .leaflet-bar a {
    background-color: #0f172a !important;
    color: #94a3b8 !important;
    border-bottom: 1px solid #334155 !important;
    transition: all 0.2s;
  }
  .leaflet-bar a:hover {
    background-color: #1e293b !important;
    color: #f8fafc !important;
  }
  .custom-checkpoint-marker, .custom-truck-marker {
    background: transparent !important;
    border: none !important;
  }
`;

// Insert custom style element for Leaflet theme integration
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = leafletCustomStyles;
  document.head.appendChild(styleEl);
}

interface LeafletMapProps {
  center: { lat: number; lng: number; heading: number };
  progress: number;
  geoCheckpoints: Array<{ lat: number; lng: number; label: string; sub: string; emoji: string }>;
  activePhaseIndex: number;
  followDriver: boolean;
  onMapDrag: () => void;
  setSelectedCheckpoint: (index: number) => void;
  theme: 'dark' | 'light';
  osrmRoutePoints: Array<{ lat: number; lng: number }>;
}

function LeafletMapComponent({
  center,
  progress,
  geoCheckpoints,
  activePhaseIndex,
  followDriver,
  onMapDrag,
  setSelectedCheckpoint,
  theme,
  osrmRoutePoints
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);
  const checkpointMarkersRef = useRef<L.Marker[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    // Create map instance - set default zoom to 14 for excellent street name/GPS detail and wider area view
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    // Standard OpenStreetMap tiles for ultimate GPS-like street-by-street clarity with all names and intersections
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    // Event listeners
    map.on('dragstart', onMapDrag);

    // Create route polyline
    const latLngs = osrmRoutePoints.length > 0
      ? osrmRoutePoints.map(p => [p.lat, p.lng] as [number, number])
      : geoCheckpoints.map(c => [c.lat, c.lng] as [number, number]);

    const routePolyline = L.polyline(latLngs, {
      color: theme === 'dark' ? '#3b82f6' : '#2563eb',
      weight: 4,
      opacity: 0.4,
      dashArray: '5, 8'
    }).addTo(map);
    routePolylineRef.current = routePolyline;

    // Create completed polyline
    const completedPolyline = L.polyline([], {
      color: '#10b981',
      weight: 5,
      opacity: 0.9
    }).addTo(map);
    completedPolylineRef.current = completedPolyline;

    // Create checkpoint markers with high-fidelity tooltips showing the real addresses
    checkpointMarkersRef.current = geoCheckpoints.map((checkpoint, index) => {
      const isCompleted = progress >= (index / (geoCheckpoints.length - 1)) * 100;
      const isActive = activePhaseIndex === index && progress < 100;

      const html = `
        <div class="relative flex items-center justify-center group" style="width: 40px; height: 40px;">
          ${isActive ? '<div class="absolute inset-0 bg-blue-500/25 rounded-full animate-ping"></div>' : ''}
          <div class="w-9 h-9 rounded-full shadow-lg border-2 flex items-center justify-center text-sm transition-transform duration-300 hover:scale-115 ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-300 text-white shadow-emerald-950/20' 
              : 'bg-slate-800 border-slate-600 text-slate-300'
          }">
            ${checkpoint.emoji}
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html,
        className: 'custom-checkpoint-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([checkpoint.lat, checkpoint.lng], { icon: markerIcon }).addTo(map);
      marker.on('click', () => setSelectedCheckpoint(index));

      // Bind dynamic high-fidelity tooltip with address sub-details
      marker.bindTooltip(`
        <div class="bg-slate-900/95 border border-slate-700/60 rounded-xl px-3 py-1.5 text-[10px] font-bold shadow-2xl space-y-0.5 text-white">
          <div class="text-orange-400 font-black tracking-wider uppercase text-[8px]">${checkpoint.label}</div>
          <div class="text-slate-200 text-[10px] leading-tight font-medium">${checkpoint.sub}</div>
        </div>
      `, {
        permanent: true,
        direction: 'top',
        offset: [0, -18],
        className: 'custom-leaflet-tooltip'
      });

      return marker;
    });

    // Create driver/truck marker
    if (progress < 100) {
      const truckHtml = `
        <div class="relative flex items-center justify-center" style="width: 48px; height: 48px;">
          <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" style="transform: scale(1.2);"></div>
          <div class="w-10 h-10 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-2xl text-white transform-truck-inner" style="transform: rotate(${center.heading}deg); transition: transform 0.1s linear; display: flex;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${-center.heading}deg); transition: transform 0.1s linear;"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><polyline points="14 10 20 10 22 14 22 18 14 18"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg>
          </div>
        </div>
      `;

      const truckIcon = L.divIcon({
        html: truckHtml,
        className: 'custom-truck-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      driverMarkerRef.current = L.marker([center.lat, center.lng], { icon: truckIcon }).addTo(map);
    }

    // Fit bounds dynamically so the whole route and addresses are fully visible inside the frame
    try {
      const bounds = L.latLngBounds(geoCheckpoints.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn("Failed to fit Leaflet map bounds:", e);
    }

    // Cleanup map on unmount
    return () => {
      map.off('dragstart', onMapDrag);
      checkpointMarkersRef.current.forEach(m => m.remove());
      if (driverMarkerRef.current) driverMarkerRef.current.remove();
      if (routePolylineRef.current) routePolylineRef.current.remove();
      if (completedPolylineRef.current) completedPolylineRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [theme, osrmRoutePoints, geoCheckpoints]);

  // Update Driver Marker, Polylines and Map Pan
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Update Completed Polyline path
    const completedPath: [number, number][] = [];
    if (osrmRoutePoints.length > 0) {
      const pointCount = osrmRoutePoints.length;
      const maxIndex = Math.min(pointCount - 1, Math.floor((progress / 100) * (pointCount - 1)));
      for (let i = 0; i <= maxIndex; i++) {
        completedPath.push([osrmRoutePoints[i].lat, osrmRoutePoints[i].lng]);
      }
      completedPath.push([center.lat, center.lng]);
    } else {
      const pointCount = geoCheckpoints.length;
      const segmentWidth = 100 / (pointCount - 1);
      const currentIndex = Math.min(pointCount - 2, Math.floor(progress / segmentWidth));
      
      for (let i = 0; i <= currentIndex; i++) {
        completedPath.push([geoCheckpoints[i].lat, geoCheckpoints[i].lng]);
      }
      completedPath.push([center.lat, center.lng]);
    }

    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs(completedPath);
    }

    // 2. Update Driver Marker position and heading
    if (progress < 100) {
      if (!driverMarkerRef.current) {
        const truckHtml = `
          <div class="relative flex items-center justify-center" style="width: 48px; height: 48px;">
            <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" style="transform: scale(1.2);"></div>
            <div class="w-10 h-10 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-2xl text-white transform-truck-inner" style="transform: rotate(${center.heading}deg); transition: transform 0.1s linear; display: flex;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${-center.heading}deg); transition: transform 0.1s linear;"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><polyline points="14 10 20 10 22 14 22 18 14 18"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg>
            </div>
          </div>
        `;
        const truckIcon = L.divIcon({
          html: truckHtml,
          className: 'custom-truck-marker',
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
        driverMarkerRef.current = L.marker([center.lat, center.lng], { icon: truckIcon }).addTo(map);
      } else {
        driverMarkerRef.current.setLatLng([center.lat, center.lng]);
        
        // Update rotation on the div directly to prevent stuttering
        const element = driverMarkerRef.current.getElement();
        if (element) {
          const innerIcon = element.querySelector('.transform-truck-inner') as HTMLDivElement;
          const svgIcon = element.querySelector('svg') as SVGElement;
          if (innerIcon) {
            innerIcon.style.transform = `rotate(${center.heading}deg)`;
          }
          if (svgIcon) {
            svgIcon.style.transform = `rotate(${-center.heading}deg)`;
          }
        }
      }
    } else {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.remove();
        driverMarkerRef.current = null;
      }
    }

    // 3. Update checkpoint markers completeness styles
    checkpointMarkersRef.current.forEach((marker, index) => {
      const isCompleted = progress >= (index / (geoCheckpoints.length - 1)) * 100;
      const isActive = activePhaseIndex === index && progress < 100;
      const checkpoint = geoCheckpoints[index];

      const html = `
        <div class="relative flex items-center justify-center group" style="width: 40px; height: 40px;">
          ${isActive ? '<div class="absolute inset-0 bg-blue-500/25 rounded-full animate-ping"></div>' : ''}
          <div class="w-9 h-9 rounded-full shadow-lg border-2 flex items-center justify-center text-sm transition-transform duration-300 hover:scale-115 ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-300 text-white shadow-emerald-950/20' 
              : 'bg-slate-800 border-slate-600 text-slate-300'
          }">
            ${checkpoint.emoji}
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html,
        className: 'custom-checkpoint-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      marker.setIcon(markerIcon);
    });

    // 4. Smoothly Pan Map
    if (followDriver) {
      map.panTo([center.lat, center.lng]);
    }
  }, [center.lat, center.lng, center.heading, progress, followDriver, activePhaseIndex, osrmRoutePoints, geoCheckpoints]);

  return <div ref={containerRef} className="w-full h-full rounded-2xl" style={{ minHeight: '100%', zIndex: 1 }} />;
}

// Google Maps API Key Setup
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Google Maps Polyline Component
interface PolylineProps {
  path: google.maps.LatLngLiteral[];
  options?: google.maps.PolylineOptions;
}

function MapPolyline({ path, options }: PolylineProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path,
      map,
      ...options,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, options]);

  return null;
}

// Google Maps Pan/Camera Controller
function MapController({ 
  center, 
  followDriver, 
  onMapDrag 
}: { 
  center: google.maps.LatLngLiteral; 
  followDriver: boolean;
  onMapDrag: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !followDriver) return;
    map.panTo(center);
  }, [map, center.lat, center.lng, followDriver]);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('dragstart', onMapDrag);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onMapDrag]);

  return null;
}

// Google Maps Styled Dark Theme
const mapDarkStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#022c22" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#10b981" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#475569" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f8fafc" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f1e40" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3b82f6" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f1e40" }]
  }
];

// Google Maps Styled Light Theme
const mapLightStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#f0fdf4" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e0f2fe" }]
  }
];

interface ProductTrackingViewProps {
  product: Product | null;
  quantity: number;
  locationText: string;
  postalCode: string;
  onBackToStore: () => void;
  theme: 'dark' | 'light';
  profileAddress?: string;
  profilePostalCode?: string;
  profileFullName?: string;
  profilePhone?: string;
  onUpdateProfile?: (data: { address?: string; postalCode?: string; fullName?: string; phone?: string }) => void;
}

export function ProductTrackingView({
  product,
  quantity,
  locationText,
  postalCode,
  onBackToStore,
  theme,
  profileAddress = '',
  profilePostalCode = '',
  profileFullName = '',
  profilePhone = '',
  onUpdateProfile
}: ProductTrackingViewProps) {
  // Use either the purchased product or a high-fidelity default
  const activeProduct = product || {
    id: 'default-tracker',
    name: 'Soporte de Auriculares Articulado Nova3D (Edición Especial)',
    price: 18500,
    images: ['https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500&auto=format&fit=crop&q=80'],
    category: 'Soportes',
    description: 'Soporte articulado premium de auriculares con terminación mate.',
    stock: 5,
    rating: 5,
    reviews: []
  } as Product;

  const orderNumber = useRef("NV" + Math.floor(100000 + Math.random() * 900000));
  const trackingCode = useRef("AR-" + Math.floor(100000000 + Math.random() * 900000000) + "-ML");

  // Tracking animation states
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(35); // Initial progress starts halfway through transit
  const [simulationSpeed, setSimulationSpeed] = useState(1); // multiplier
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<number | null>(null);

  // Address editing states in tracking view
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempName, setTempName] = useState(profileFullName);
  const [tempAddress, setTempAddress] = useState(profileAddress || locationText);
  const [tempPostal, setTempPostal] = useState(profilePostalCode || postalCode);
  const [tempPhone, setTempPhone] = useState(profilePhone);

  // Sync edits when states change
  useEffect(() => {
    setTempName(profileFullName);
    setTempAddress(profileAddress || locationText);
    setTempPostal(profilePostalCode || postalCode);
    setTempPhone(profilePhone);
  }, [profileFullName, profileAddress, locationText, profilePostalCode, postalCode, profilePhone]);

  // Map View Mode: 'real' (Leaflet OpenStreetMap), 'google' (Google Maps - requires key), 'svg' (Stylized Mock SVG)
  const [mapViewMode, setMapViewMode] = useState<'real' | 'google' | 'svg'>(
    hasValidKey ? 'google' : 'real'
  );
  const [followDriver, setFollowDriver] = useState(true);

  // Dynamic deterministic target coordinates based on locationText / postalCode to dynamically update maps in real time!
  const targetCoords = useMemo(() => {
    const cleanAddress = (locationText || '').toLowerCase();
    const cleanPostal = (postalCode || '').toLowerCase();
    
    if (cleanAddress.includes('córdoba') || cleanPostal.startsWith('5')) {
      return { lat: -31.4135, lng: -64.1811 };
    }
    if (cleanAddress.includes('rosario') || cleanAddress.includes('santa fe') || cleanPostal.startsWith('2')) {
      return { lat: -32.9468, lng: -60.6393 };
    }
    if (cleanAddress.includes('mendoza') || cleanPostal.startsWith('4')) {
      return { lat: -32.8895, lng: -68.8458 };
    }
    if (cleanAddress.includes('la plata') || cleanPostal.startsWith('19')) {
      return { lat: -34.9214, lng: -57.9545 };
    }
    if (cleanAddress.includes('tigre')) {
      return { lat: -34.4251, lng: -58.5796 };
    }
    if (cleanAddress.includes('palermo')) {
      return { lat: -34.5889, lng: -58.4306 };
    }
    if (cleanAddress.includes('belgrano')) {
      return { lat: -34.5621, lng: -58.4563 };
    }
    
    // Hash-based deterministic coordinate generation so that any custom address typed moves the marker to a unique real street
    let hash = 0;
    for (let i = 0; i < cleanAddress.length; i++) {
      hash = cleanAddress.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((hash % 100) / 1000) * 0.15;
    const lngOffset = (((hash >> 8) % 100) / 1000) * 0.15;
    
    return {
      lat: -34.5200 + latOffset,
      lng: -58.4800 + lngOffset
    };
  }, [locationText, postalCode]);

  // Real geographic coordinates for Google Maps & Leaflet (dynamic routing based on destination city)
  const geoCheckpoints = useMemo(() => {
    const cleanAddress = (locationText || '').toLowerCase();
    const cleanPostal = (postalCode || '').toLowerCase();

    // Factory is always the starting point
    const startPoint = { lat: -34.5889, lng: -58.4306, label: "Fábrica Nova3D", sub: "Palermo, CABA", emoji: "🏢" };

    if (cleanAddress.includes('córdoba') || cleanPostal.startsWith('5')) {
      return [
        startPoint,
        { lat: -34.5612, lng: -58.4563, label: "Centro de Clasificación Flex", sub: "Belgrano, CABA", emoji: "📦" },
        { lat: -33.9806, lng: -60.5694, label: "Ruta 9 - San Nicolás", sub: "Provincia de Buenos Aires", emoji: "🛣️" },
        { lat: -31.4135, lng: -64.1811, label: "Centro Logístico Córdoba", sub: "Córdoba", emoji: "🏪" },
        { lat: targetCoords.lat, lng: targetCoords.lng, label: "Tu Domicilio", sub: locationText || "Córdoba, Centro", emoji: "🏠" }
      ];
    }
    
    if (cleanAddress.includes('rosario') || cleanAddress.includes('santa fe') || cleanPostal.startsWith('2')) {
      return [
        startPoint,
        { lat: -34.5612, lng: -58.4563, label: "Centro de Clasificación Flex", sub: "Belgrano, CABA", emoji: "📦" },
        { lat: -33.9806, lng: -60.5694, label: "Ruta 9 - San Nicolás", sub: "Provincia de Buenos Aires", emoji: "🛣️" },
        { lat: targetCoords.lat, lng: targetCoords.lng, label: "Tu Domicilio", sub: locationText || "Rosario, Santa Fe", emoji: "🏠" }
      ];
    }

    if (cleanAddress.includes('mendoza') || cleanPostal.startsWith('4')) {
      return [
        startPoint,
        { lat: -34.6158, lng: -58.4333, label: "Centro de Clasificación CABA", sub: "Caballito, CABA", emoji: "📦" },
        { lat: -34.5997, lng: -60.9486, label: "Ruta 7 - Junín", sub: "Buenos Aires", emoji: "🛣️" },
        { lat: -33.3015, lng: -66.3378, label: "Centro Logístico San Luis", sub: "San Luis", emoji: "🏪" },
        { lat: targetCoords.lat, lng: targetCoords.lng, label: "Tu Domicilio", sub: locationText || "Mendoza, Centro", emoji: "🏠" }
      ];
    }

    // Default for Palermo / CABA / GBA local delivery
    const isPalermo = cleanAddress.includes('palermo') || cleanAddress.includes('recoleta') || cleanAddress.includes('almagro') || cleanAddress.includes('capital');
    if (isPalermo) {
      return [
        startPoint,
        { lat: -34.5845, lng: -58.4200, label: "Distribuidor Local Palermo", sub: "CABA", emoji: "📦" },
        { lat: -34.5860, lng: -58.4250, label: "Repartidor en Zona", sub: "Palermo Soho", emoji: "🛵" },
        { lat: targetCoords.lat, lng: targetCoords.lng, label: "Tu Domicilio", sub: locationText || "Palermo, CABA", emoji: "🏠" }
      ];
    }

    // Default GBA (Olivos, San Isidro, etc.)
    return [
      startPoint,
      { lat: -34.5612, lng: -58.4563, label: "Centro de Clasificación Flex", sub: "Belgrano, CABA", emoji: "📦" },
      { lat: -34.5385, lng: -58.4751, label: "Av. General Paz Checkpoint", sub: "Límite CABA", emoji: "🛣️" },
      { lat: -34.5106, lng: -58.4984, label: "Distribuidora Zona Norte", sub: "Olivos", emoji: "🏪" },
      { lat: targetCoords.lat, lng: targetCoords.lng, label: "Tu Domicilio", sub: locationText || "San Isidro, GBA", emoji: "🏠" }
    ];
  }, [targetCoords, locationText, postalCode]);

  // Keep track of downloaded real-world street points and step info (OSRM public keyless API)
  const [osrmRoutePoints, setOsrmRoutePoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [osrmSteps, setOsrmSteps] = useState<Array<{ name: string; lat: number; lng: number; instruction?: string }>>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Fetch real street-by-street GPS route coordinates from free OSRM Routing API
  useEffect(() => {
    let active = true;
    setIsLoadingRoute(true);
    
    const fetchRoute = async () => {
      try {
        const queryCoords = geoCheckpoints.map(c => `${c.lng},${c.lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${queryCoords}?overview=full&geometries=geojson&steps=true`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('OSRM routing API response error');
        const data = await response.json();
        
        if (!active) return;
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Extract full path coordinates (lon, lat in geojson converted to lat, lng)
          const coords: Array<{ lat: number; lng: number }> = route.geometry.coordinates.map(
            (c: [number, number]) => ({ lat: c[1], lng: c[0] })
          );
          
          // Extract steps to get actual street names and turn instructions
          const stepsList: Array<{ name: string; lat: number; lng: number; instruction?: string }> = [];
          
          if (route.legs) {
            route.legs.forEach((leg: any) => {
              if (leg.steps) {
                leg.steps.forEach((step: any) => {
                  const streetName = step.name || '';
                  const [lon, lat] = step.maneuver.location;
                  const type = step.maneuver.type || 'drive';
                  const modifier = step.maneuver.modifier || '';
                  
                  // Translate turn maneuvers to Spanish for high-fidelity GPS realism
                  let instruction = `Seguir por ${streetName || 'calle'}`;
                  if (type === 'turn') {
                    const direction = modifier === 'left' ? 'a la izquierda' : modifier === 'right' ? 'a la derecha' : '';
                    instruction = `Girar ${direction} en ${streetName || 'calle'}`;
                  } else if (type === 'new name') {
                    instruction = `Continuar por ${streetName}`;
                  } else if (type === 'merge') {
                    instruction = `Incorporarse a ${streetName}`;
                  } else if (type === 'on ramp') {
                    instruction = `Tomar la rampa hacia ${streetName}`;
                  } else if (type === 'off ramp') {
                    instruction = `Tomar la rampa de salida hacia ${streetName}`;
                  } else if (type === 'roundabout') {
                    instruction = `Ingresar a la rotonda hacia ${streetName}`;
                  }
                  
                  if (streetName && streetName.trim().length > 0) {
                    stepsList.push({
                      name: streetName,
                      lat,
                      lng: lon,
                      instruction
                    });
                  }
                });
              }
            });
          }
          
          setOsrmRoutePoints(coords);
          setOsrmSteps(stepsList);
        }
      } catch (err) {
        console.error('Failed to retrieve free GPS OSRM street route:', err);
      } finally {
        if (active) setIsLoadingRoute(false);
      }
    };
    
    fetchRoute();
    
    return () => {
      active = false;
    };
  }, [geoCheckpoints]);

  // Calculate latitude and longitude at progress percent
  const getLatLngAtProgress = (pct: number) => {
    // If we have precise OSRM routing points, trace the real streets
    if (osrmRoutePoints.length > 0) {
      const pointCount = osrmRoutePoints.length;
      if (pct <= 0) {
        const pA = osrmRoutePoints[0];
        const pB = osrmRoutePoints[1] || pA;
        const heading = Math.atan2(pB.lng - pA.lng, pB.lat - pA.lat) * (180 / Math.PI);
        return { lat: pA.lat, lng: pA.lng, heading };
      }
      if (pct >= 100) {
        const pA = osrmRoutePoints[pointCount - 2] || osrmRoutePoints[pointCount - 1];
        const pB = osrmRoutePoints[pointCount - 1];
        const heading = Math.atan2(pB.lng - pA.lng, pB.lat - pA.lat) * (180 / Math.PI);
        return { lat: pB.lat, lng: pB.lng, heading };
      }

      const floatIndex = (pct / 100) * (pointCount - 1);
      const index = Math.floor(floatIndex);
      const segmentPct = floatIndex - index;

      const pA = osrmRoutePoints[index];
      const pB = osrmRoutePoints[index + 1] || pA;

      const lat = pA.lat + (pB.lat - pA.lat) * segmentPct;
      const lng = pA.lng + (pB.lng - pA.lng) * segmentPct;
      const heading = Math.atan2(pB.lng - pA.lng, pB.lat - pA.lat) * (180 / Math.PI);

      return { lat, lng, heading };
    }

    // Fallback: raw straight-line interpolation if OSRM hasn't loaded yet
    const pointCount = geoCheckpoints.length;
    if (pointCount === 0) return { lat: -34.5889, lng: -58.4306, heading: 0 };
    if (pct <= 0) {
      const pA = geoCheckpoints[0];
      const pB = geoCheckpoints[1];
      const heading = Math.atan2(pB.lng - pA.lng, pB.lat - pA.lat) * (180 / Math.PI);
      return { lat: pA.lat, lng: pA.lng, heading };
    }
    if (pct >= 100) {
      const pA = geoCheckpoints[pointCount - 2];
      const pB = geoCheckpoints[pointCount - 1];
      const heading = Math.atan2(pB.lng - pA.lng, pB.lat - pA.lat) * (180 / Math.PI);
      return { lat: pB.lat, lng: pB.lng, heading };
    }

    const segmentWidth = 100 / (pointCount - 1);
    const index = Math.min(pointCount - 2, Math.floor(pct / segmentWidth));
    const segmentPct = (pct % segmentWidth) / segmentWidth;

    const pA = geoCheckpoints[index];
    const pB = geoCheckpoints[index + 1];

    const lat = pA.lat + (pB.lat - pA.lat) * segmentPct;
    const lng = pA.lng + (pB.lng - pA.lng) * segmentPct;
    const heading = Math.atan2(pB.lng - pA.lng, pB.lat - pA.lat) * (180 / Math.PI);

    return { lat, lng, heading };
  };

  const currentLatLng = getLatLngAtProgress(progress);

  // Email simulator states
  const [showEmailSimulator, setShowEmailSimulator] = useState(false);
  const [activeEmailTab, setActiveEmailTab] = useState<'preview' | 'setup'>('preview');

  // Driver states
  const driver = {
    name: "Ramiro Gómez",
    rating: 4.9,
    reviewsCount: 1420,
    vehicle: "Moto Honda Tornado 250",
    plate: "A123BCD",
    phone: "+5491144445555",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  };

  // Define route points in local map space (SVG viewbox 800 x 500)
  const routePoints = [
    { x: 120, y: 390, label: "Fábrica Nova3D", sub: "Palermo, CABA", status: "finished", info: "Tu producto se imprimió en 3D con filamento PLA+ de alta densidad, se ensambló y fue despachado de nuestra granja de impresión." },
    { x: 260, y: 310, label: "Centro de Clasificación Flex", sub: "CABA Centro", status: "finished", info: "El repartidor Ramiro Gómez retiró la orden y validó los parámetros de control de calidad." },
    { x: 420, y: 250, label: "Av. General Paz Checkpoint", sub: "Límite CABA", status: "transit", info: "El vehículo de reparto se encuentra transitando vías rápidas con tráfico moderado hacia el destino." },
    { x: 580, y: 190, label: "Distribuidora Zona Norte / Sur", sub: "Plataforma de Cercanía", status: "pending", info: "Punto de control previo a la entrega directa." },
    { x: 720, y: 110, label: "Tu Domicilio", sub: locationText, status: "pending", info: "Entrega coordinada y firma digital en destino." }
  ];

  // Calculate current coordinates and heading angle of vehicle on the path based on progress (0 - 100)
  const getCoordinatesAtProgress = (pct: number) => {
    const pointCount = routePoints.length;
    if (pointCount === 0) return { x: 0, y: 0, angle: 0 };
    if (pct <= 0) {
      const pA = routePoints[0];
      const pB = routePoints[1];
      const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);
      return { x: pA.x, y: pA.y, angle };
    }
    if (pct >= 100) {
      const pA = routePoints[pointCount - 2];
      const pB = routePoints[pointCount - 1];
      const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);
      return { x: pB.x, y: pB.y, angle };
    }

    // Find between which two points we are
    const segmentWidth = 100 / (pointCount - 1);
    const index = Math.min(pointCount - 2, Math.floor(pct / segmentWidth));
    const segmentPct = (pct % segmentWidth) / segmentWidth;

    const pA = routePoints[index];
    const pB = routePoints[index + 1];

    if (!pA || !pB) return { x: 0, y: 0, angle: 0 };

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      x: pA.x + dx * segmentPct,
      y: pA.y + dy * segmentPct,
      angle
    };
  };

  const vehiclePos = getCoordinatesAtProgress(progress);

  // Live navigation current street/milestone HUD
  const currentStreetName = useMemo(() => {
    if (progress >= 100) return "Entregado - ¡Gracias por elegir Nova3D!";
    if (progress < 10) return "Preparando orden en la granja de impresión 3D Nova3D";

    if (osrmSteps.length > 0) {
      // Find the step in OSRM that is closest to our driver's current coordinates
      let closestStep = osrmSteps[0];
      let minDistanceSq = Infinity;
      let closestIdx = 0;

      osrmSteps.forEach((step, idx) => {
        const dLat = step.lat - currentLatLng.lat;
        const dLng = step.lng - currentLatLng.lng;
        const distSq = dLat * dLat + dLng * dLng;
        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          closestStep = step;
          closestIdx = idx;
        }
      });

      // Show the current instruction + upcoming street name
      const nextStep = closestIdx + 1 < osrmSteps.length ? osrmSteps[closestIdx + 1] : null;
      let msg = closestStep.instruction || `Transitando por ${closestStep.name}`;
      if (nextStep && nextStep.name && nextStep.name !== closestStep.name) {
        msg += ` ➜ Próxima intersección: ${nextStep.name}`;
      }
      return msg;
    }

    // High-fidelity fallback if OSRM is loading or slow
    if (progress >= 85) return "Llegando a destino - Ingresando a tu cuadra";
    if (progress >= 75) return "Últimas cuadras - Transitando por Av. Maipú / San Isidro";
    if (progress >= 55) return "En viaje - Transitando por Autopista Panamericana (Ruta 9)";
    if (progress >= 35) return "Saliendo de CABA - Transitando por cruce de Av. General Paz";
    if (progress >= 20) return "En viaje - Transitando por Autopista Cantilo / Av. Lugones";
    return "Despachado - Saliendo por Av. del Libertador (Palermo)";
  }, [progress, osrmSteps, currentLatLng]);

  // Determine current active phase based on progress
  const activePhaseIndex = useMemo(() => {
    if (progress >= 100) return 4; // Entregado
    if (progress >= 75) return 3;  // En puerta / Próximo
    if (progress >= 25) return 2;  // En viaje / Reparto
    if (progress >= 10) return 1;  // Despachado
    return 0; // Preparando
  }, [progress]);

  // Handle auto-progress simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return Math.min(100, prev + 0.5 * simulationSpeed);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed]);

  // Derived tracking values
  const distanceRemaining = Math.max(0, parseFloat(((100 - progress) * 0.12).toFixed(1))); // Simulated km
  const etaMinutes = Math.max(0, Math.ceil((100 - progress) * 0.8)); // Simulated mins

  // Static auxiliary road lines in SVG coordinates to look like a high-tech grid map
  const decorativeRoads = [
    { x1: 50, y1: 450, x2: 400, y2: 100 },
    { x1: 100, y1: 450, x2: 750, y2: 150 },
    { x1: 50, y1: 300, x2: 800, y2: 300 },
    { x1: 300, y1: 500, x2: 300, y2: 0 },
    { x1: 550, y1: 500, x2: 550, y2: 0 },
    { x1: 120, y1: 100, x2: 700, y2: 450 },
    { x1: 150, y1: 200, x2: 500, y2: 450 }
  ];

  const handleResetSimulation = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className={cn(
      "max-w-6xl mx-auto px-4 py-8 animate-fade-in font-sans",
      theme === 'dark' ? "text-slate-100" : "text-slate-900"
    )}>
      {/* Header breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200/60 pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToStore}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full border border-gray-200/50 dark:border-slate-700/50 shadow-sm transition-all"
            title="Volver a la tienda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded">
                Seguimiento de Envío Flex
              </span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1 flex items-center gap-2">
              Orden <span className="text-[#3483fa]">#{orderNumber.current}</span>
            </h1>
          </div>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm">
            <span className="text-gray-400 block font-bold uppercase text-[9px]">Código de Seguimiento</span>
            <span className="font-mono font-bold text-gray-700 dark:text-slate-200">{trackingCode.current}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 block font-bold uppercase text-[9px]">Compra Protegida</span>
              <span className="text-emerald-800 dark:text-emerald-300 font-bold">Garantía Mercado Pago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tracking Map (Left 7 cols) & Status Sidebar (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Interactive SVG Map Container */}
        <div className="lg:col-span-8 space-y-4">
          {/* Selector de Tipo de Mapa - ¡Muy Prominente para el Usuario! */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Seleccionar Mapa de Navegación:
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setMapViewMode('real')}
                className={cn(
                  "px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border",
                  mapViewMode === 'real'
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-900/10"
                    : "bg-slate-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <MapIcon className="w-4 h-4 text-emerald-500" />
                🗺️ Mapa Real (Gratis)
              </button>
              <button
                onClick={() => setMapViewMode('svg')}
                className={cn(
                  "px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border",
                  mapViewMode === 'svg'
                    ? "bg-blue-600 border-blue-500 text-white shadow-blue-900/10"
                    : "bg-slate-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                🎨 Mapa Ilustrado
              </button>
              <button
                onClick={() => setMapViewMode('google')}
                className={cn(
                  "px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border",
                  mapViewMode === 'google'
                    ? "bg-amber-500 border-amber-600 text-slate-950 shadow-amber-900/10"
                    : "bg-slate-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <Navigation className="w-4 h-4 text-orange-500 rotate-45" />
                📍 Google Maps
              </button>
            </div>
          </div>

          {/* Map wrapper */}
          <div className="relative bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden select-none" style={{ height: '620px' }}>
            
            {/* Map Header / Live Stats HUD */}
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Truck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Navegación Activa en Tiempo Real</span>
                  <span className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {currentStreetName}
                  </span>
                </div>
              </div>

              {/* ETA / Distance Info blocks */}
              <div className="flex items-center gap-6 divide-x divide-slate-800">
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Distancia Restante</span>
                  <span className="text-lg font-black font-mono text-white">
                    {progress >= 100 ? "0.0" : distanceRemaining} <span className="text-xs text-slate-400">km</span>
                  </span>
                </div>
                <div className="pl-6 text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Tiempo Estimado (ETA)</span>
                  <span className="text-lg font-black font-mono text-orange-400 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-400 inline" /> 
                    {progress >= 100 ? "Llegó" : `~${etaMinutes} min`}
                  </span>
                </div>
              </div>
            </div>

            {/* Central Map Selector & Tracking State */}
            {mapViewMode === 'google' ? (
              hasValidKey ? (
                <APIProvider apiKey={API_KEY} version="weekly">
                  <div className="w-full h-full relative">
                    <Map
                      defaultCenter={currentLatLng}
                      defaultZoom={13}
                      mapId="DEMO_MAP_ID"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                      gestureHandling="cooperative"
                      styles={theme === 'dark' ? mapDarkStyles : mapLightStyles}
                      disableDefaultUI={true}
                    >
                      {/* Map Camera Controller */}
                      <MapController 
                        center={currentLatLng} 
                        followDriver={followDriver} 
                        onMapDrag={() => setFollowDriver(false)} 
                      />

                      {/* Route Polyline Ahead */}
                      <MapPolyline 
                        path={useMemo(() => {
                          if (osrmRoutePoints.length > 0) {
                            return osrmRoutePoints.map(p => ({ lat: p.lat, lng: p.lng }));
                          }
                          return geoCheckpoints.map(c => ({ lat: c.lat, lng: c.lng }));
                        }, [osrmRoutePoints, geoCheckpoints])} 
                        options={{ 
                          strokeColor: theme === 'dark' ? '#3b82f6' : '#2563eb', 
                          strokeOpacity: 0.4, 
                          strokeWeight: 4 
                        }} 
                      />

                      {/* Completed Route Polyline */}
                      <MapPolyline 
                        path={useMemo(() => {
                          const path: google.maps.LatLngLiteral[] = [];
                          if (osrmRoutePoints.length > 0) {
                            const pointCount = osrmRoutePoints.length;
                            const maxIndex = Math.min(pointCount - 1, Math.floor((progress / 100) * (pointCount - 1)));
                            for (let i = 0; i <= maxIndex; i++) {
                              path.push({ lat: osrmRoutePoints[i].lat, lng: osrmRoutePoints[i].lng });
                            }
                          } else {
                            const pointCount = geoCheckpoints.length;
                            const segmentWidth = 100 / (pointCount - 1);
                            const currentIndex = Math.min(pointCount - 2, Math.floor(progress / segmentWidth));
                            for (let i = 0; i <= currentIndex; i++) {
                              path.push({ lat: geoCheckpoints[i].lat, lng: geoCheckpoints[i].lng });
                            }
                          }
                          path.push({ lat: currentLatLng.lat, lng: currentLatLng.lng });
                          return path;
                        }, [osrmRoutePoints, geoCheckpoints, progress, currentLatLng])} 
                        options={{ 
                          strokeColor: '#10b981', 
                          strokeOpacity: 0.9, 
                          strokeWeight: 5 
                        }} 
                      />

                      {/* Checkpoint Pins */}
                      {geoCheckpoints.map((c, index) => {
                        const isCompleted = progress >= (index / (geoCheckpoints.length - 1)) * 100;
                        const isActive = activePhaseIndex === index && progress < 100;
                        return (
                          <AdvancedMarker 
                            key={index} 
                            position={{ lat: c.lat, lng: c.lng }}
                            onClick={() => setSelectedCheckpoint(index)}
                          >
                            <div style={{ width: '40px', height: '40px' }} className="relative flex items-center justify-center cursor-pointer group">
                              {isActive && (
                                <div className="absolute inset-0 bg-blue-500/25 rounded-full animate-ping" />
                              )}
                              <div className={cn(
                                "w-9 h-9 rounded-full shadow-lg border-2 flex items-center justify-center text-sm transition-transform duration-300 group-hover:scale-115",
                                isCompleted
                                  ? "bg-emerald-500 border-emerald-300 text-white shadow-emerald-950/20"
                                  : "bg-slate-800 border-slate-600 text-slate-300"
                              )}>
                                {c.emoji}
                              </div>
                              <div className="absolute -top-8 bg-slate-950 border border-slate-800 text-[9px] font-black px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-white z-50">
                                {c.label}
                              </div>
                            </div>
                          </AdvancedMarker>
                        );
                      })}

                      {/* Delivery Truck Rider Pin */}
                      {progress < 100 && (
                        <AdvancedMarker position={currentLatLng}>
                          <div style={{ width: '48px', height: '48px' }} className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" style={{ transform: 'scale(1.2)' }} />
                            <div 
                              className="w-10 h-10 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-2xl text-white transition-transform"
                              style={{ transform: `rotate(${currentLatLng.heading}deg)` }}
                            >
                              <Truck className="w-5 h-5" style={{ transform: `rotate(${-currentLatLng.heading}deg)` }} />
                            </div>
                          </div>
                        </AdvancedMarker>
                      )}
                    </Map>

                    {/* Floating HUD over map */}
                    <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-2">
                      {!followDriver && (
                        <button
                          onClick={() => setFollowDriver(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xl transition-all border border-blue-400"
                        >
                          <Navigation className="w-3.5 h-3.5 animate-pulse" />
                          Centrar en Repartidor
                        </button>
                      )}
                      
                      <div className="flex gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-2xl">
                        <button
                          onClick={() => setMapViewMode('real')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Mapa Real Gratis
                        </button>
                        <button
                          onClick={() => setMapViewMode('svg')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Ilustración (SVG)
                        </button>
                      </div>
                    </div>
                  </div>
                </APIProvider>
              ) : (
                /* Google Maps API Key Setup Guide Dashboard */
                <div className="w-full h-full flex items-center justify-center bg-slate-950 p-6 text-slate-100">
                  <div className="max-w-md w-full text-center space-y-4 bg-slate-900/90 backdrop-blur border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 mt-12">
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                      <MapIcon className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-base font-black tracking-tight text-white">Google Maps en Tiempo Real</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Seguí tu envío sobre el mapa oficial satelital. Requiere una API Key con facturación activada en Google Cloud.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-3 text-left border border-slate-800/60 space-y-2 text-[11px]">
                      <p className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" /> ¿No querés poner tarjeta?
                      </p>
                      <p className="text-slate-400">
                        ¡No te preocupes! El <strong>Mapa Real Gratis</strong> ya está activo por defecto. Utiliza OpenStreetMap y no requiere ninguna API key ni tarjetas.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        onClick={() => setMapViewMode('real')}
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        Usar Mapa Real Gratis
                      </button>
                      <button
                        onClick={() => setMapViewMode('svg')}
                        className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                      >
                        Ver Ilustración (SVG)
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : mapViewMode === 'real' ? (
              /* Beautiful Real Street Map via Leaflet/OpenStreetMap (API-Key and Credit-Card free) */
              <div className="w-full h-full relative">
                <LeafletMapComponent
                  center={currentLatLng}
                  progress={progress}
                  geoCheckpoints={geoCheckpoints}
                  activePhaseIndex={activePhaseIndex}
                  followDriver={followDriver}
                  onMapDrag={() => setFollowDriver(false)}
                  setSelectedCheckpoint={setSelectedCheckpoint}
                  theme={theme}
                  osrmRoutePoints={osrmRoutePoints}
                />
                
                {/* Float controls on Leaflet */}
                <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-2">
                  {!followDriver && (
                    <button
                      onClick={() => setFollowDriver(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xl transition-all border border-blue-400"
                    >
                      <Navigation className="w-3 h-3 animate-pulse" />
                      Centrar en Repartidor
                    </button>
                  )}
                  
                  <div className="flex gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-2xl">
                    <button
                      onClick={() => setMapViewMode('svg')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-bold px-2 py-1 rounded transition-all"
                    >
                      Ver Ilustración
                    </button>
                    <button
                      onClick={() => setMapViewMode('google')}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded transition-all flex items-center gap-1"
                    >
                      <MapIcon className="w-3 h-3" />
                      Google Maps
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Custom High-Fidelity SVG Map Fallback */
              <div className="w-full h-full relative">
                <svg 
                  viewBox="0 0 800 500" 
                  className="w-full h-full bg-[#0b1329] transition-all duration-300"
                  style={{ 
                    backgroundImage: 'radial-gradient(rgba(51, 65, 85, 0.25) 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                  }}
                >
                  <style>{`
                    @keyframes flow-dash {
                      to {
                        stroke-dashoffset: -40;
                      }
                    }
                    .animated-flow-line {
                      stroke-dasharray: 10 8;
                      animation: flow-dash 1.5s linear infinite;
                    }
                    @keyframes pulse-ring-glow {
                      0% { transform: scale(0.9) opacity: 0.9; }
                      50% { transform: scale(1.15) opacity: 0.4; }
                      100% { transform: scale(1.4) opacity: 0; }
                    }
                    .pulsing-halo-map {
                      animation: pulse-ring-glow 2.5s ease-out infinite;
                    }
                  `}</style>

                  <defs>
                    <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#1a2e5a" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#0f1e40" stopOpacity="0.95" />
                    </linearGradient>
                    
                    <linearGradient id="parkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#047857" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#065f46" stopOpacity="0.10" />
                    </linearGradient>

                    <radialGradient id="vehicleRadar" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </radialGradient>
                    
                    <filter id="shadowGlow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
                    </filter>
                  </defs>

                  {/* A. GEOGRAPHIC BACKGROUND LAYERS */}
                  <path 
                    d="M 320,0 C 440,70 580,120 800,160 L 800,0 Z" 
                    fill="url(#riverGrad)" 
                    stroke="#1d4ed8" 
                    strokeWidth="1.5"
                    opacity="0.85" 
                  />
                  
                  <path d="M 450,25 Q 490,40 530,25" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.3" />
                  <path d="M 600,50 Q 640,65 680,50" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.3" />
                  
                  <text x="640" y="45" fill="#3b82f6" fontSize="9" fontWeight="black" letterSpacing="1.5" opacity="0.4" transform="rotate(11, 640, 45)">RÍO DE LA PLATA</text>

                  <path 
                    d="M 60,350 C 90,320 180,310 200,340 C 210,380 160,420 120,410 C 80,400 50,380 60,350 Z" 
                    fill="url(#parkGrad)" 
                    stroke="#10b981" 
                    strokeWidth="1" 
                    strokeDasharray="4 2"
                    opacity="0.6" 
                  />
                  <text x="125" y="365" fill="#10b981" fontSize="8" fontWeight="bold" letterSpacing="0.5" opacity="0.5">Bosques de Palermo</text>

                  {/* B. SECONDARY STREET GRID */}
                  <g stroke="#1e293b" strokeWidth="1" opacity="0.5">
                    <line x1="0" y1="180" x2="800" y2="180" />
                    <line x1="0" y1="220" x2="800" y2="220" />
                    <line x1="0" y1="280" x2="800" y2="280" />
                    <line x1="0" y1="340" x2="800" y2="340" />
                    
                    <line x1="100" y1="0" x2="100" y2="500" />
                    <line x1="200" y1="0" x2="200" y2="500" />
                    <line x1="320" y1="0" x2="320" y2="500" />
                    <line x1="440" y1="0" x2="440" y2="500" />
                  </g>

                  {/* C. MAIN EXPRESSWAYS */}
                  <g stroke="#1e293b" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                    <path d="M 120 400 L 720 120" fill="none" />
                    <path d="M 50 450 Q 250 350 450 250 T 750 150" fill="none" />
                  </g>
                  <g stroke="#334155" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
                    <path d="M 120 400 L 720 120" fill="none" />
                    <path d="M 50 450 Q 250 350 450 250 T 750 150" fill="none" />
                  </g>

                  {/* D. THE LIVE DELIVERY ROUTE */}
                  <path 
                    d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`} 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    opacity="0.3"
                  />
                  <path 
                    d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`} 
                    fill="none" 
                    stroke="#1e3a8a" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  
                  {/* Completed Route Neon Green Tracker */}
                  <path 
                    d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="animated-flow-line"
                    style={{
                      strokeDasharray: 2000,
                      strokeDashoffset: 2000 - (2000 * progress) / 100
                    }}
                  />

                  {/* Checkpoints */}
                  {routePoints.map((point, index) => {
                    const isCompleted = progress >= (index / (routePoints.length - 1)) * 100;
                    const isActive = activePhaseIndex === index && progress < 100;
                    const landmarkEmojis = ["🏢", "📦", "🛣️", "🏪", "🏠"];
                    const pinColor = isCompleted ? (index === 4 ? "#10b981" : "#059669") : "#334155";
                    const pinBorder = isActive ? "#3b82f6" : (isCompleted ? "#34d399" : "#475569");

                    return (
                      <g 
                        key={index} 
                        className="cursor-pointer group/node" 
                        onClick={() => setSelectedCheckpoint(index)}
                        filter="url(#shadowGlow)"
                      >
                        {isActive && (
                          <circle cx={point.x} cy={point.y} r="25" fill="none" stroke="#3b82f6" strokeWidth="2" className="pulsing-halo-map" style={{ transformOrigin: `${point.x}px ${point.y}px` }} />
                        )}
                        <path
                          d={`M ${point.x} ${point.y + 12} C ${point.x - 14} ${point.y - 2} ${point.x - 12} ${point.y - 18} ${point.x} ${point.y - 18} C ${point.x + 12} ${point.y - 18} ${point.x + 14} ${point.y - 2} ${point.x} ${point.y + 12} Z`}
                          fill={pinColor}
                          stroke={pinBorder}
                          strokeWidth="1.5"
                          style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                        />
                        <circle cx={point.x} cy={point.y - 4} r="9" fill="#0f172a" />
                        <text x={point.x} y={point.y + 0.5} fontSize="10" textAnchor="middle" className="pointer-events-none select-none">{landmarkEmojis[index]}</text>
                      </g>
                    );
                  })}

                  {/* Moving Vehicle */}
                  {progress < 100 && (
                    <g style={{ transform: `translate(${vehiclePos.x}px, ${vehiclePos.y}px) rotate(${vehiclePos.angle}deg)`, transition: 'transform 0.12s linear', transformOrigin: '0px 0px' }} filter="url(#shadowGlow)">
                      <circle cx="0" cy="0" r="28" fill="url(#vehicleRadar)" className="animate-pulse" />
                      <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
                      <g transform="translate(-10, -9) scale(0.95)">
                        <rect x="1" y="2" width="12" height="11" rx="2" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                        <path d="M 13 4 L 17 4 L 20 8 L 20 13 L 13 13 Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                        <polygon points="14,6 16,6 18,9 14,9" fill="#0f172a" />
                        <circle cx="4" cy="14" r="2.2" fill="#020617" stroke="#ffffff" strokeWidth="0.75" />
                        <circle cx="15" cy="14" r="2.2" fill="#020617" stroke="#ffffff" strokeWidth="0.75" />
                      </g>
                    </g>
                  )}
                </svg>

                {/* Floating controls on SVG */}
                <div className="absolute bottom-20 right-4 z-10">
                  <div className="flex gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-2xl">
                    <button
                      onClick={() => setMapViewMode('real')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded transition-all shadow-md cursor-pointer"
                    >
                      Mapa Real Gratis
                    </button>
                    <button
                      onClick={() => setMapViewMode('google')}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded transition-all"
                    >
                      Google Maps
                    </button>
                  </div>
                </div>
              </div>
            )}


              {/* Map Footer Control Panel (Uber / Player controls) */}
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={cn(
                      "p-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer",
                      isPlaying ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "bg-[#3483fa] hover:bg-blue-600 text-white"
                    )}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 stroke-[3]" /> : <Play className="w-3.5 h-3.5 stroke-[3]" />}
                    {isPlaying ? "Pausar Tracker" : "Reanudar Tracker"}
                  </button>

                  <button 
                    onClick={handleResetSimulation}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Reiniciar Simulación de Envío"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scrubber timeline slider */}
                <div className="flex-grow max-w-xs md:max-w-md flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400">Progreso:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress}
                    onChange={(e) => {
                      setProgress(parseFloat(e.target.value));
                      setIsPlaying(false); // Stop auto play when scrubbing
                    }}
                    className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{Math.round(progress)}%</span>
                </div>

                {/* Speed Multipliers */}
                <div className="flex items-center gap-1.5 text-[10px] border border-slate-800 rounded-lg p-0.5">
                  {[1, 2, 5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSimulationSpeed(speed)}
                      className={cn(
                        "px-2 py-1 rounded transition-colors font-mono font-bold cursor-pointer",
                        simulationSpeed === speed ? "bg-slate-800 text-orange-400" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

          {/* Dynamic Checkpoint Detail Block */}
          {selectedCheckpoint !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-md flex gap-4 items-start"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-blue-500 border border-blue-100 dark:border-slate-800 shrink-0 mt-0.5">
                <MapIcon className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                    Punto de Control {selectedCheckpoint + 1}: {routePoints[selectedCheckpoint].label}
                  </h4>
                  <button 
                    onClick={() => setSelectedCheckpoint(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold"
                  >
                    Cerrar Detalle
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{routePoints[selectedCheckpoint].sub}</p>
                <p className="text-xs text-gray-600 dark:text-slate-300 mt-2.5 leading-relaxed bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-800/40">
                  {routePoints[selectedCheckpoint].info}
                </p>
              </div>
            </motion.div>
          )}

          {/* Interactive Live Log Ticker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              Log de Eventos en Tiempo Real (GPS)
            </h3>
            <div className="space-y-3 font-mono text-xs max-h-36 overflow-y-auto divide-y divide-slate-800/60">
              <div className="pt-2.5 first:pt-0 flex justify-between gap-4 text-slate-300">
                <span>[07:31 AM] Fábrica Nova3D: Producto despachado y empaquetado.</span>
                <span className="text-green-400">✓ OK</span>
              </div>
              {progress >= 25 && (
                <div className="pt-2.5 flex justify-between gap-4 text-slate-300">
                  <span>[07:38 AM] GPS Repartidor: Tránsito fluido cruzando Av. General Paz.</span>
                  <span className="text-green-400">✓ OK</span>
                </div>
              )}
              {progress >= 50 && (
                <div className="pt-2.5 flex justify-between gap-4 text-slate-300">
                  <span>[07:44 AM] GPS Repartidor: Entrando en plataforma de distribución local de cercanía.</span>
                  <span className="text-blue-400">● EN TRÁNSITO</span>
                </div>
              )}
              {progress >= 75 && (
                <div className="pt-2.5 flex justify-between gap-4 text-slate-300">
                  <span>[07:51 AM] Telemetría: Ramiro está a menos de 5 cuadras del domicilio.</span>
                  <span className="text-amber-400 animate-pulse">● PRÓXIMO</span>
                </div>
              )}
              {progress >= 100 && (
                <div className="pt-2.5 flex justify-between gap-4 text-slate-300">
                  <span>[07:58 AM] Entregador: Entrega completada y firma digital autorizada.</span>
                  <span className="text-green-400 font-bold">✓ ENTREGADO</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Step-by-Step Milestones & Driver Card (5 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Product Preview Card */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <img 
              src={activeProduct.images?.[0]} 
              alt={activeProduct.name} 
              className="w-16 h-16 rounded-xl object-contain bg-white border border-gray-100 p-1 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-grow">
              <span className="text-[10px] uppercase font-mono font-black text-[#3483fa] tracking-wider block">Producto en Camino</span>
              <h3 className="font-bold text-sm truncate text-gray-900 dark:text-white mt-0.5">{activeProduct.name}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Cant: <span className="font-bold">{quantity} u.</span> | Total: <span className="font-bold text-gray-900 dark:text-white">$ {((activeProduct.price || 0) * quantity).toLocaleString('es-AR')}</span>
              </p>
            </div>
          </div>

          {/* Live Delivery Settings / User Address Changer Card */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/10 text-orange-500 p-1.5 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <h4 className="font-black text-[11px] uppercase tracking-wider text-gray-800 dark:text-gray-100">Dirección de Destino</h4>
              </div>
              <button 
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {isEditingAddress ? 'Cancelar' : 'Cambiar Dirección'}
              </button>
            </div>

            {!isEditingAddress ? (
              <div className="text-xs text-gray-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {profileFullName || tempName || 'Cliente Nova3D'}
                </p>
                <p className="pl-3 text-gray-700 dark:text-slate-300 font-medium">{profileAddress || locationText || 'Palermo, CABA'}</p>
                <p className="pl-3 text-[11px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  CP: {profilePostalCode || postalCode || '1425'} | Tel: {profilePhone || tempPhone || '+54 9 11 5555-1234'}
                </p>
                <div className="pt-2">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Ruta en tiempo real recalculada
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Nombre del Destinatario</label>
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Calle, Altura y Ciudad</label>
                  <input 
                    type="text" 
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="Ej: Av. de Mayo 800, CABA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Cód. Postal</label>
                    <input 
                      type="text" 
                      value={tempPostal}
                      onChange={(e) => setTempPostal(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                      placeholder="1425"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 block">Teléfono</label>
                    <input 
                      type="text" 
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                      placeholder="Ej: +54 9 11 5555-1234"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onUpdateProfile?.({
                      fullName: tempName,
                      address: tempAddress,
                      postalCode: tempPostal,
                      phone: tempPhone
                    });
                    setIsEditingAddress(false);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar y Actualizar Mapa
                </button>
              </div>
            )}
          </div>

          {/* Email Invoice Simulation & Verification Widget */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-900/60 border border-blue-100/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0 shadow-sm">
                <Mail className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Verificación de Comprobante</span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">Factura de Compra Digital</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  El sistema generó y procesó el comprobante electrónico para este pedido. Podés ver el mail simulado directamente en la app.
                </p>
              </div>
            </div>

            <div className="pt-1.5 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setShowEmailSimulator(true);
                  setActiveEmailTab('preview');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" /> Abrir Comprobante / Mail (HTML)
              </button>
              <button 
                onClick={() => {
                  setShowEmailSimulator(true);
                  setActiveEmailTab('setup');
                }}
                className="w-full bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/60 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                ¿Por qué no me llegó por mail real?
              </button>
            </div>
          </div>

          {/* Delivery Phase Vertical Tracker */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 dark:text-white mb-6 uppercase tracking-wider">
              Estado del Envío
            </h3>

            <div className="space-y-6 relative before:absolute before:bottom-2 before:top-2 before:left-3 before:w-[2px] before:bg-gray-100 dark:before:bg-slate-700">
              
              {/* Step 1 */}
              <div className="flex gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center border-4 border-white dark:border-slate-800 shrink-0 z-10 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-tight">Pago Acreditado</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-normal">
                    Mercado Pago confirmó el cobro. Factura enviada por correo electrónico.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 relative">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shrink-0 z-10 shadow-xs",
                  progress >= 10 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-400"
                )}>
                  {progress >= 10 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />}
                </div>
                <div>
                  <h4 className={cn(
                    "font-bold text-xs leading-tight",
                    progress >= 10 ? "text-gray-900 dark:text-white" : "text-gray-400"
                  )}>Preparación y Diseño 3D</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-normal">
                    Granja automatizada completó la impresión y control de calidad.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 relative">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shrink-0 z-10 shadow-xs transition-colors duration-300",
                  progress >= 25 && progress < 100 ? "bg-blue-500 text-white animate-pulse" : progress >= 100 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-400"
                )}>
                  {progress >= 100 ? <Check className="w-3 h-3 stroke-[3]" /> : <Truck className="w-3 h-3" />}
                </div>
                <div>
                  <h4 className={cn(
                    "font-bold text-xs leading-tight flex items-center gap-1.5",
                    progress >= 25 ? "text-gray-900 dark:text-white" : "text-gray-400"
                  )}>En Viaje de Reparto</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-normal">
                    El transportista asignado está yendo hacia tu domicilio. Segui el GPS en vivo.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 relative">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shrink-0 z-10 shadow-xs transition-colors duration-300",
                  progress >= 100 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-400"
                )}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <h4 className={cn(
                    "font-bold text-xs leading-tight",
                    progress >= 100 ? "text-gray-900 dark:text-white" : "text-gray-400"
                  )}>Entregado en Destino</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-normal">
                    Firma digital efectuada en {locationText}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver details Card (Uber-like driver profile) */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Tu Repartidor Asignado
            </h3>

            <div className="flex items-center gap-4">
              <img 
                src={driver.avatar} 
                alt={driver.name} 
                className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{driver.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {driver.rating}
                  </span>
                  <span className="text-[10px] text-gray-400">({driver.reviewsCount} envíos)</span>
                </div>
                <span className="text-[10px] bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black mt-1.5 inline-block uppercase tracking-wider">
                  Repartidor Flex VIP
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-3.5 border border-gray-100 dark:border-slate-800/60 text-xs space-y-1.5">
              <p className="text-gray-500 dark:text-slate-400">
                Vehículo: <span className="font-bold text-gray-900 dark:text-white">{driver.vehicle}</span>
              </p>
              <p className="text-gray-500 dark:text-slate-400">
                Patente registrada: <span className="font-bold text-gray-900 dark:text-white">{driver.plate}</span>
              </p>
            </div>

            {/* Call / WhatsApp actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a 
                href={`tel:${driver.phone}`}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-gray-700 dark:text-slate-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Llamar
              </a>
              <a 
                href={`https://wa.me/5491144445555?text=Hola%20Ramiro,%20estoy%20esperando%20el%20pedido%20de%20Nova3D%20`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 bg-[#25d366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#20ba5a] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chatear
              </a>
            </div>

            <p className="text-[10px] text-gray-400 italic text-center pt-2">
              * Para tu seguridad, el repartidor está validado por las políticas de entrega sin contacto de ML3D.
            </p>
          </div>
        </div>
      </div>

      {/* Email Inbox Sandbox & Setup Guide Modal */}
      <AnimatePresence>
        {showEmailSimulator && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden relative"
            >
              {/* Top Accent Bar */}
              <div className="bg-blue-600 h-1.5 w-full shrink-0" />

              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Simulador de Correo Electrónico</h3>
                    <p className="text-[10px] text-slate-400">Inspeccioná la entrega digital y factura en tiempo real</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowEmailSimulator(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="px-4 bg-slate-950 flex border-b border-slate-800 shrink-0">
                <button 
                  onClick={() => setActiveEmailTab('preview')}
                  className={cn(
                    "px-4 py-3 text-xs font-bold transition-all border-b-2",
                    activeEmailTab === 'preview' 
                      ? "border-blue-500 text-blue-400" 
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  📥 Recibidos (1) — Factura de Compra
                </button>
                <button 
                  onClick={() => setActiveEmailTab('setup')}
                  className={cn(
                    "px-4 py-3 text-xs font-bold transition-all border-b-2",
                    activeEmailTab === 'setup' 
                      ? "border-blue-500 text-blue-400" 
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  ⚙️ ¿Cómo enviar emails reales? (Guía de Configuración)
                </button>
              </div>

              {/* Modal Body / Scroll area */}
              <div className="flex-grow overflow-y-auto p-5 bg-slate-900/40">
                {activeEmailTab === 'preview' ? (
                  <div className="space-y-4">
                    {/* Simulated Email Envelope Header (Gmail Vibe) */}
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 shadow-sm space-y-3 font-sans text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-slate-400 border-b border-slate-800/50 pb-2">
                        <div>
                          <p><span className="font-bold text-slate-300">De:</span> Nova3D <span className="text-slate-500">&lt;onboarding@resend.dev&gt;</span></p>
                          <p className="mt-1"><span className="font-bold text-slate-300">Para:</span> caponettopeppers@gmail.com</p>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                          Entregado (Simulación)
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                          <span>🧾 Tu factura de compra Nova3D - Orden #{orderNumber.current}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Enviado: hoy, hace unos instantes • Vía Resend SMTP Sandbox</p>
                      </div>
                    </div>

                    {/* Email Content Frame - High fidelity scrollable layout replicating Resend beautiful template */}
                    <div className="bg-white text-[#1e293b] rounded-xl p-6 md:p-10 border border-slate-800 shadow-md font-sans overflow-x-auto">
                      <div className="max-w-[600px] mx-auto bg-white">
                        
                        {/* Header Banner */}
                        <div className="bg-[#0f172a] text-white p-8 rounded-t-xl text-center">
                          <h1 className="margin-0 text-2xl font-extrabold tracking-tight uppercase" style={{ margin: 0 }}>
                            NOVA<span className="text-orange-500">3D</span>
                          </h1>
                          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Impresiones en 3D & Diseños a Medida</p>
                          <div className="inline-block bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mt-4 tracking-wider">
                            Pago Aprobado
                          </div>
                        </div>

                        {/* Invoice Body */}
                        <div className="p-6 md:p-8 border-x border-b border-gray-100 rounded-b-xl space-y-6 text-sm">
                          <div>
                            <p className="text-base font-bold text-slate-800">¡Gracias por tu compra!</p>
                            <p className="text-gray-500 mt-1 leading-relaxed">
                              Procesamos tu pago de forma segura mediante Mercado Pago Argentina. Tu pedido ya ingresó a nuestra granja de impresión automatizada.
                            </p>
                          </div>

                          {/* Details box */}
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between border-b border-gray-200/50 pb-2 text-xs">
                              <span className="text-gray-400 font-bold uppercase">Concepto</span>
                              <span className="text-gray-400 font-bold uppercase">Detalle</span>
                            </div>
                            <div className="flex justify-between pt-1 text-xs text-slate-700">
                              <span>Número de Orden:</span>
                              <span className="font-mono font-bold text-slate-900">{orderNumber.current}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Código de Seguimiento:</span>
                              <span className="font-mono font-bold text-blue-600">{trackingCode.current}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Medio de Pago:</span>
                              <span className="font-bold text-blue-600">Mercado Pago (Acreditado)</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Destino:</span>
                              <span className="font-semibold text-slate-900">{locationText}</span>
                            </div>
                          </div>

                          {/* Items table */}
                          <div className="border-b border-gray-100 pb-4">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-gray-200 pb-2 text-gray-400 uppercase font-bold">
                                  <th className="pb-2">Producto</th>
                                  <th className="pb-2 text-center">Cant.</th>
                                  <th className="pb-2 text-right">Monto</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 flex items-center gap-3">
                                    <img 
                                      src={activeProduct.images[0]} 
                                      className="w-10 h-10 object-contain bg-gray-50 rounded border border-gray-200" 
                                      alt="Product Image"
                                    />
                                    <div>
                                      <p className="font-bold text-slate-800">{activeProduct.name}</p>
                                      <p className="text-[10px] text-gray-400">Filamento PLA+ Premium de alta calidad</p>
                                    </div>
                                  </td>
                                  <td className="py-3 text-center font-bold text-slate-700">{quantity}</td>
                                  <td className="py-3 text-right font-bold text-slate-800">$ {(activeProduct.price * quantity).toLocaleString('es-AR')}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Totals */}
                          <div className="space-y-1.5 text-xs text-right max-w-xs ml-auto">
                            <div className="flex justify-between text-gray-500">
                              <span>Subtotal:</span>
                              <span className="font-semibold text-slate-800">$ {(activeProduct.price * quantity).toLocaleString('es-AR')}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Costo de Envío:</span>
                              <span className="font-bold text-emerald-600">¡GRATIS!</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 text-slate-900">
                              <span>Total Abonado:</span>
                              <span className="text-blue-600 text-base font-black">$ {(activeProduct.price * quantity).toLocaleString('es-AR')}</span>
                            </div>
                          </div>

                          {/* Footer details */}
                          <div className="pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 space-y-1">
                            <p>Este correo sirve como comprobante de pago oficial para tu transacción.</p>
                            <p>¿Tenés alguna duda o querés personalizar tu modelo?</p>
                            <p>Escribinos a <a href="mailto:caponettopeppers@gmail.com" className="text-orange-500 hover:underline">soporte@nova3d.com</a> o contactanos por nuestra línea directa.</p>
                            <p className="pt-3 text-[10px] opacity-70">&copy; 2026 Nova3D Argentina. Todos los derechos reservados.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 font-sans">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                      <div>
                        <p className="font-bold">¿Por qué no llegó a mi casilla de email?</p>
                        <p className="mt-1 opacity-90">
                          Para garantizar el envío en tiempo real a casillas de correo externas, el backend de la aplicación utiliza el servicio de entrega <span className="font-bold text-white">Resend</span>. Actualmente, no se ha configurado la clave de API necesaria en las variables de entorno, por lo que el sistema opera en <strong>Modo Sandbox Simulado</strong> de desarrollo.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
                        Registrar una Cuenta Gratuita en Resend
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed pl-7">
                        Ingresá a <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold inline-flex items-center gap-1">resend.com <ExternalLink className="w-3 h-3" /></a> y registrate para obtener una cuenta gratis. Te brindará un límite de envío mensual generoso para pruebas.
                      </p>

                      <h4 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2 pt-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 text-xs flex items-center justify-center font-bold">2</span>
                        Crear una API Key
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed pl-7">
                        Dentro del panel de control de Resend, dirígete a la sección <strong>"API Keys"</strong>, haz clic en <strong>"Create API Key"</strong> y copia el código generado (comienza con <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-pink-400 text-[10px]">re_...</code>).
                      </p>

                      <h4 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2 pt-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 text-xs flex items-center justify-center font-bold">3</span>
                        Agregar la Variable de Entorno
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed pl-7">
                        Abre el menú de <strong>Secrets</strong> o <strong>Configuración de Variables de Entorno</strong> en el panel de AI Studio de este proyecto, agrega una nueva clave llamada <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-blue-400 text-[10px]">RESEND_API_KEY</code> y pega tu código como valor. ¡Reiniciá el servidor de desarrollo y listo!
                      </p>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                        <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" /> Nota sobre el "Sandbox de onboarding" de Resend:
                        </h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed pl-5">
                          Si utilizas el remitente por defecto de Resend (<code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-slate-300">onboarding@resend.dev</code>) sin configurar un dominio propio verificado, Resend **solamente** tiene permitido entregar correos electrónicos a la <strong>misma dirección de email</strong> con la que te registraste en Resend. Si intentas enviar el mail a otra dirección ajena (como tu comprador de prueba), Resend rechazará la entrega de forma segura.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end shrink-0">
                <button 
                  onClick={() => setShowEmailSimulator(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Entendido / Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
