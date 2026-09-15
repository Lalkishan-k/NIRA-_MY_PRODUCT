// Source: Google Maps Platform Code Assist
import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  Phone, 
  Car, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Building2, 
  Sparkles,
  Info,
  Key
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Production facility coordinates in Kozhikode, Kerala (11.1599° N, 75.8993° E)
const FACILITY_COORDS = {
  lat: 11.1599,
  lng: 75.8993,
  name: 'NIRA Agro-Processing Heritage Unit & Direct Mill Store',
  addressLine1: 'NIRA Agro-Processing Heritage Unit',
  addressLine2: 'NH 66 Airport Bypass Corridor',
  city: 'Kozhikode (Calicut)',
  district: 'Kozhikode District',
  state: 'Kerala',
  pincode: '673633',
  landmark: 'Kozhikode, Kerala (11.1599° N, 75.8993° E) • Near NH 66 Corridor'
};

export const StoreLocator: React.FC = () => {
  const { settings, addToast } = useStore();
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Read Google Maps API key from Vite environment
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  // Construct Google Maps Platform Maps Static API URL
  // Adhering to solution_id=gmp_mcp_codeassist_v1_aistudio requirement
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${FACILITY_COORDS.lat},${FACILITY_COORDS.lng}&zoom=${zoomLevel}&size=800x420&scale=2&maptype=${mapType}&markers=color:0x065f46%7Clabel:N%7C${FACILITY_COORDS.lat},${FACILITY_COORDS.lng}&solution_id=gmp_mcp_codeassist_v1_aistudio${apiKey ? `&key=${apiKey}` : ''}`;

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${FACILITY_COORDS.lat},${FACILITY_COORDS.lng}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${FACILITY_COORDS.lat},${FACILITY_COORDS.lng}`;

  // OpenStreetMap embed URL with dynamic bounding box matching zoomLevel
  const delta = 0.025 * Math.pow(0.65, zoomLevel - 14);
  const minLng = (FACILITY_COORDS.lng - delta).toFixed(4);
  const minLat = (FACILITY_COORDS.lat - delta * 0.6).toFixed(4);
  const maxLng = (FACILITY_COORDS.lng + delta).toFixed(4);
  const maxLat = (FACILITY_COORDS.lat + delta * 0.6).toFixed(4);
  const openStreetMapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${FACILITY_COORDS.lat}%2C${FACILITY_COORDS.lng}`;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${FACILITY_COORDS.lat}, ${FACILITY_COORDS.lng}`);
    setCopiedCoords(true);
    addToast('GPS coordinates copied to clipboard!', 'info');
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const handlePlanVisitWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello NIRA Team, I am planning to visit your Kerala production facility & direct farm store in Kozhikode, Kerala (11.1599° N, 75.8993° E). Could you please confirm visiting hours?`
    );
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <section id="store-locator" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="border-t border-stone-200 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Store & Mill Locator</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Our Kerala Production Facility & Farm Store
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Situated in the agricultural heartland of Kozhikode (Calicut), Kerala. Visit our open copra sun-drying yards, watch gravity settling in real-time, and buy freshly pressed coconut oil straight from the mill.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
            <button
              onClick={copyCoordinates}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 transition-colors"
              title="Copy GPS coordinates"
            >
              {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCoords ? 'Copied' : 'GPS Coords'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map + Facility Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Top: Static Map Display */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
          
          {/* Map Toolbar */}
          <div className="px-5 py-3.5 bg-stone-50/90 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Location: Kozhikode, Kerala
              </span>
              <span className="text-stone-400 font-mono text-[11px]">
                ({FACILITY_COORDS.lat}° N, {FACILITY_COORDS.lng}° E)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Map Type Switcher (only applicable when Google Maps Static API is active) */}
              {apiKey && (
                <div className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setMapType('roadmap')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      mapType === 'roadmap'
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapType('hybrid')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      mapType === 'hybrid'
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(12, prev - 1))}
                  disabled={zoomLevel <= 12}
                  className="p-1 hover:bg-stone-100 rounded text-stone-700 disabled:opacity-30"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 py-0.5 text-[11px] font-mono text-stone-600 self-center">
                  z{zoomLevel}
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(17, prev + 1))}
                  disabled={zoomLevel >= 17}
                  className="p-1 hover:bg-stone-100 rounded text-stone-700 disabled:opacity-30"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* External Direct Link */}
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-600 hover:text-emerald-800 transition-colors"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Map Canvas / Interactive Map Container */}
          <div className="relative w-full aspect-[16/9] min-h-[360px] max-h-[480px] bg-stone-100 overflow-hidden flex items-center justify-center">
            
            {/* If Google Maps API key is configured, use Google Maps Static API; otherwise use 100% free OpenStreetMap embed with zero API key or credit card needed */}
            {apiKey && !imgError ? (
              <img
                src={staticMapUrl}
                alt="NIRA Kerala Production Facility Static Map with Marker"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <iframe
                title="NIRA Kerala Production Facility Map"
                className="w-full h-full border-0"
                src={openStreetMapEmbedUrl}
                loading="lazy"
              />
            )}

            {/* Static marker badge indicator */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm text-[11px] font-medium text-stone-800 flex items-center gap-2 z-10 pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
              <span><b>NIRA Mill & Farm Store</b> (Kozhikode, Kerala)</span>
            </div>

            {/* Quick Action Overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Directions in Google Maps
              </a>
            </div>
          </div>

          {/* Map Footer & Quick Navigation */}
          <div className="px-5 py-2.5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-800" />
              <span className="text-stone-700 font-medium">Kozhikode, Kerala • 11.1599° N, 75.8993° E</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800 font-semibold text-emerald-700 flex items-center gap-1 transition-colors"
              >
                Get Turn-by-Turn Directions <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                Open in Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Facility Information & Visitor Guide */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Main Address Card */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-800 text-white shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                  {FACILITY_COORDS.name}
                </h3>
                <span className="text-[11px] text-emerald-800 font-semibold block">
                  Kerala Certified Expeller Facility
                </span>
              </div>
            </div>

            <div className="text-xs text-stone-600 space-y-2 pt-2 border-t border-stone-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">{FACILITY_COORDS.addressLine1}</p>
                  <p>{FACILITY_COORDS.addressLine2}</p>
                  <p>{FACILITY_COORDS.city}, {FACILITY_COORDS.state} — {FACILITY_COORDS.pincode}</p>
                  <p className="text-stone-400 text-[11px] mt-1">{FACILITY_COORDS.landmark}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="text-stone-800">
                  <span className="font-semibold">{settings.supportPhone}</span>
                  <span className="text-stone-400 text-[11px] ml-1.5">(Mill Desk)</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-900">Visiting & Retail Timings:</p>
                  <p className="text-[11px]">Mon – Sat: 8:30 AM – 6:30 PM IST</p>
                  <p className="text-[11px]">Sunday: 10:00 AM – 2:00 PM (Retail counter)</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePlanVisitWhatsApp}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Schedule a Mill Visit / Tour</span>
              </button>
            </div>
          </div>

          {/* Direct Farm-Gate Visitor Perks */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Visitor Experience at the Mill
            </h4>
            <ul className="text-xs text-stone-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold shrink-0">✓</span>
                <span><b>Fresh Oil on Tap:</b> Bring your own containers or purchase fresh sealed glass jars straight from the expeller settling tank.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold shrink-0">✓</span>
                <span><b>Copra Inspection:</b> See naturally sun-dried sulphur-free copra arriving from Malabar farming cooperatives.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold shrink-0">✓</span>
                <span><b>Tender Coconut Refreshment:</b> Complimentary fresh tender coconut water served to all visiting patrons.</span>
              </li>
            </ul>
          </div>

          {/* Accessibility & Transit Guide */}
          <div className="bg-emerald-50/70 rounded-3xl p-5 border border-emerald-200/80 space-y-2.5 text-xs text-stone-700">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-800" />
              Transit & How to Reach Us
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <p>• <b>Calicut International Airport (CCJ):</b> ~12 km (~20 mins via Airport Bypass)</p>
              <p>• <b>Calicut Railway Station (CLT):</b> ~15 km (~30 mins via NH 66)</p>
              <p>• <b>NH 66 Corridor / Junction:</b> ~2 km convenient highway connectivity</p>
              <p>• <b>Parking:</b> Dedicated free visitor and customer parking on premises</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
