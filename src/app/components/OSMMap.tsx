/**
 * OSMMap – OpenStreetMap-powered map component using Leaflet.
 *
 * Modes:
 *  - 'track'  : Shows user pin (red) + animated driver pin (green) moving toward user
 *  - 'pin'    : Interactive – click to drop a pin; calls onPinDrop with (lat, lng, address)
 */

import { useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation } from 'lucide-react';

// Lagos, Victoria Island default center
const LAGOS_CENTER: [number, number] = [6.4281, 3.4219];

interface TrackModeProps {
  mode: 'track';
  userLocation?: [number, number];
  driverLocation?: [number, number];
  height?: string;
}

interface PinModeProps {
  mode: 'pin';
  initialPin?: [number, number];
  onPinDrop?: (lat: number, lng: number, address: string) => void;
  height?: string;
  placeholder?: string;
}

type OSMMapProps = TrackModeProps | PinModeProps;

function reverseGeocode(lat: number, lng: number): Promise<string> {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
    .then((r) => r.json())
    .then((data) => data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    .catch(() => `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
}

function createDivIcon(
  color: string,
  emoji: string,
  pulse = false
): string {
  return `
    <div style="
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      width:38px;
      height:38px;
    ">
      ${pulse ? `<div style="
        position:absolute;
        width:38px;height:38px;
        border-radius:50%;
        background:${color}33;
        animation:mapPulse 1.5s infinite;
      "></div>` : ''}
      <div style="
        position:relative;
        z-index:1;
        width:28px;height:28px;
        border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:13px;
      ">${emoji}</div>
    </div>
  `;
}

export function OSMMap(props: OSMMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const pinMarkerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const height = props.height || '320px';

  // ── Shared: initialize map ────────────────────────────────────
  const initMap = useCallback(async () => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import leaflet (handles both CJS/ESM interop)
    const leafletModule = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    const L: typeof import('leaflet') = (leafletModule as any).default ?? leafletModule;
    LRef.current = L;

    // Inject pulse keyframe once
    if (!document.getElementById('map-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'map-pulse-style';
      style.textContent = `
        @keyframes mapPulse {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const center =
      props.mode === 'track'
        ? (props.userLocation ?? LAGOS_CENTER)
        : (props.mode === 'pin' && props.initialPin)
        ? props.initialPin
        : LAGOS_CENTER;

    const map = L.map(containerRef.current, {
      center,
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // ── TRACK MODE ──────────────────────────────────────────────
    if (props.mode === 'track') {
      const userLatLng = props.userLocation ?? LAGOS_CENTER;
      const driverLatLng = props.driverLocation ?? [
        userLatLng[0] + 0.008,
        userLatLng[1] + 0.006,
      ];

      const userIcon = L.divIcon({
        className: '',
        html: createDivIcon('#DC2626', '🏠', false),
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const driverIcon = L.divIcon({
        className: '',
        html: createDivIcon('#16A34A', '🚛', true),
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      userMarkerRef.current = L.marker(userLatLng, { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Your Location</b><br/>Pickup address');

      driverMarkerRef.current = L.marker(driverLatLng, { icon: driverIcon })
        .addTo(map)
        .bindPopup('<b>🚛 Driver</b><br/>Adebayo Olaniyi');

      // Dashed line between driver and user
      L.polyline([driverLatLng, userLatLng], {
        color: '#16A34A',
        weight: 2,
        dashArray: '6,8',
        opacity: 0.6,
      }).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds([userLatLng, driverLatLng]).pad(0.15);
      map.fitBounds(bounds);
    }

    // ── PIN MODE ───────────────────────────────────────────────
    if (props.mode === 'pin') {
      const pinIcon = L.divIcon({
        className: '',
        html: createDivIcon('#16A34A', '📍', false),
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      if (props.initialPin) {
        pinMarkerRef.current = L.marker(props.initialPin, { icon: pinIcon }).addTo(map);
      }

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        if (pinMarkerRef.current) {
          pinMarkerRef.current.setLatLng([lat, lng]);
        } else {
          pinMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        }
        const address = await reverseGeocode(lat, lng);
        if (props.mode === 'pin' && props.onPinDrop) {
          props.onPinDrop(lat, lng, address);
        }
      });
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        driverMarkerRef.current = null;
        pinMarkerRef.current = null;
      }
    };
  }, []);

  // ── Update driver marker position (track mode) ──────────────
  useEffect(() => {
    if (props.mode !== 'track' || !driverMarkerRef.current) return;
    const loc = props.driverLocation;
    if (loc) {
      driverMarkerRef.current.setLatLng(loc);
    }
  }, [props.mode === 'track' ? (props as TrackModeProps).driverLocation : undefined]);

  // ── "Use my location" helper ─────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapRef.current.setView([lat, lng], 16);

        const L = LRef.current;
        if (!L) return;

        if (props.mode === 'pin') {
          const pinIcon = L.divIcon({
            className: '',
            html: createDivIcon('#16A34A', '📍', false),
            iconSize: [38, 38],
            iconAnchor: [19, 38],
          });
          if (pinMarkerRef.current) {
            pinMarkerRef.current.setLatLng([lat, lng]);
          } else {
            pinMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapRef.current);
          }
          const address = await reverseGeocode(lat, lng);
          if (props.onPinDrop) props.onPinDrop(lat, lng, address);
        }
      },
      () => {}
    );
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Map container */}
      <div ref={containerRef} style={{ height, width: '100%' }} />

      {/* Overlay badges */}
      {props.mode === 'track' && (
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-[1000]">
          <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow text-xs font-semibold text-[#DC2626] border border-red-100">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" />
            Your location
          </div>
          <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow text-xs font-semibold text-[#16A34A] border border-green-100">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block animate-pulse" />
            Driver en route
          </div>
        </div>
      )}

      {props.mode === 'pin' && (
        <>
          <button
            onClick={handleUseMyLocation}
            className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white text-[#16A34A] border border-green-200 rounded-full px-3 py-2 text-xs font-bold shadow hover:bg-green-50 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Use GPS
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 text-xs text-gray-600 shadow border border-gray-100 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
            Tap the map to drop a pin
          </div>
        </>
      )}

      {/* OSM attribution override styling */}
      <style>{`
        .leaflet-control-attribution { font-size: 10px !important; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
}