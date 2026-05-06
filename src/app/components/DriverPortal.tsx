import { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { OSMMap } from './OSMMap';
import {
  ArrowLeft, Phone, Star, MapPin, Package, CheckCircle,
  Clock, Truck, LogOut, Eye, Navigation, ChevronRight,
  Wifi, WifiOff, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Driver,
  GlobalPickup,
  loginDriver,
  setDriverSession,
  getDriverSession,
  clearDriverSession,
  saveDriver,
  getAllPickups,
  updatePickupStatus,
} from '../types';

interface DriverPortalProps {
  onNavigate: (page: string) => void;
}

type DriverPage = 'login' | 'dashboard' | 'pickup-detail';

// Lagos coordinates for driver movement simulation
const DRIVER_START: [number, number] = [6.4381, 3.4319]; // ~1.2km from VI

export function DriverPortal({ onNavigate }: DriverPortalProps) {
  const [page, setPage] = useState<DriverPage>('login');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [activePickup, setActivePickup] = useState<GlobalPickup | null>(null);
  const [driverPos, setDriverPos] = useState<[number, number]>(DRIVER_START);

  // Restore driver session
  useEffect(() => {
    const session = getDriverSession();
    if (session) {
      setDriver(session);
      setPage('dashboard');
    }
  }, []);

  // Animate driver position toward active pickup (simulate movement)
  useEffect(() => {
    if (!activePickup?.lat || !activePickup?.lng) return;
    const target: [number, number] = [activePickup.lat, activePickup.lng];
    const interval = setInterval(() => {
      setDriverPos((prev) => {
        const dLat = target[0] - prev[0];
        const dLng = target[1] - prev[1];
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < 0.0002) {
          clearInterval(interval);
          return prev;
        }
        const speed = 0.00015;
        return [prev[0] + (dLat / dist) * speed, prev[1] + (dLng / dist) * speed];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [activePickup]);

  const handleLogin = (email: string, password: string): string | null => {
    const found = loginDriver(email, password);
    if (!found) return 'Invalid driver credentials. Check your email and password.';
    setDriver(found);
    setDriverSession(found);
    setPage('dashboard');
    return null;
  };

  const handleLogout = () => {
    clearDriverSession();
    setDriver(null);
    setPage('login');
  };

  const handleToggleOnline = () => {
    if (!driver) return;
    const updated: Driver = { ...driver, isOnline: !driver.isOnline };
    saveDriver(updated);
    setDriverSession(updated);
    setDriver(updated);
    toast.success(updated.isOnline ? '🟢 You are now Online' : '🔴 You are now Offline');
  };

  const handleAcceptPickup = (pickup: GlobalPickup) => {
    if (!driver) return;
    updatePickupStatus(pickup.userId, pickup.id, 'assigned', driver.id, driver.name);
    toast.success(`Pickup PK-${pickup.id.slice(-6)} accepted!`);
    setActivePickup({ ...pickup, status: 'assigned', driverAssigned: driver.id, driverName: driver.name });
    setPage('pickup-detail');
  };

  const handleStartPickup = () => {
    if (!driver || !activePickup) return;
    updatePickupStatus(activePickup.userId, activePickup.id, 'on_the_way', driver.id, driver.name);
    setActivePickup((p) => p ? { ...p, status: 'on_the_way' } : p);
    toast.success('🚛 Status updated: En Route to customer!');
  };

  const handleCompletePickup = () => {
    if (!driver || !activePickup) return;
    updatePickupStatus(activePickup.userId, activePickup.id, 'completed', driver.id, driver.name);
    const updated: Driver = { ...driver, trips: driver.trips + 1, totalEarnings: driver.totalEarnings + 2500 };
    saveDriver(updated);
    setDriverSession(updated);
    setDriver(updated);
    setActivePickup(null);
    setDriverPos(DRIVER_START);
    setPage('dashboard');
    toast.success('✅ Pickup completed! ₦2,500 added to your earnings.');
  };

  if (page === 'login') {
    return <DriverLoginForm onLogin={handleLogin} onBack={() => onNavigate('welcome')} />;
  }

  if (page === 'pickup-detail' && activePickup && driver) {
    return (
      <DriverPickupDetail
        pickup={activePickup}
        driver={driver}
        driverPos={driverPos}
        onBack={() => setPage('dashboard')}
        onStart={handleStartPickup}
        onComplete={handleCompletePickup}
      />
    );
  }

  if (driver) {
    return (
      <DriverDashboard
        driver={driver}
        onLogout={handleLogout}
        onToggleOnline={handleToggleOnline}
        onAcceptPickup={handleAcceptPickup}
        onViewPickup={(p) => { setActivePickup(p); setPage('pickup-detail'); }}
        onNavigate={onNavigate}
      />
    );
  }

  return null;
}

// ─── Login form ────────────────────────────────────────────────────────────

function DriverLoginForm({
  onLogin,
  onBack,
}: {
  onLogin: (email: string, password: string) => string | null;
  onBack: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const err = onLogin(email.trim(), password);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  const fillDemo = (idx: number) => {
    const demos = [
      { email: 'driver1@cleanloop.ng', password: 'driver123' },
      { email: 'driver2@cleanloop.ng', password: 'driver123' },
      { email: 'driver3@cleanloop.ng', password: 'driver123' },
    ];
    setEmail(demos[idx].email);
    setPassword(demos[idx].password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-black text-gray-900">CLEANLOOP Driver</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-[#16A34A] text-white rounded-2xl p-6 text-center mb-6">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <h1 className="text-2xl font-black mb-1">Driver Portal</h1>
            <p className="text-green-100 text-sm">Sign in to access your pickups</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-[#DC2626] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                placeholder="driver@cleanloop.ng"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
              ) : (
                'Sign in as Driver'
              )}
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-xs font-bold text-gray-700 mb-3">🧪 Demo Driver Accounts:</p>
            {[
              { name: 'Adebayo Olaniyi', area: 'Victoria Island' },
              { name: 'Emeka Osei', area: 'Ikeja' },
              { name: 'Fatima Aliyu', area: 'Lekki' },
            ].map((d, i) => (
              <button
                key={i}
                onClick={() => fillDemo(i)}
                className="w-full text-left text-xs py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-between"
              >
                <span>
                  <span className="font-semibold text-gray-900">{d.name}</span>
                  <span className="text-gray-500"> – {d.area}</span>
                </span>
                <span className="text-[#16A34A] font-semibold">Use →</span>
              </button>
            ))}
            <p className="text-[10px] text-gray-400 mt-2">Password for all: <code className="bg-white px-1 rounded">driver123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Driver Dashboard ──────────────────────────────────────────────────────

function DriverDashboard({
  driver,
  onLogout,
  onToggleOnline,
  onAcceptPickup,
  onViewPickup,
  onNavigate,
}: {
  driver: Driver;
  onLogout: () => void;
  onToggleOnline: () => void;
  onAcceptPickup: (p: GlobalPickup) => void;
  onViewPickup: (p: GlobalPickup) => void;
  onNavigate: (page: string) => void;
}) {
  const allPickups = getAllPickups();
  const pendingPickups = allPickups.filter(
    (p) => p.status === 'pending' && !p.driverAssigned
  );
  const myPickups = allPickups.filter(
    (p) => p.driverAssigned === driver.id
  );
  const activePickup = myPickups.find(
    (p) => p.status === 'assigned' || p.status === 'on_the_way'
  );

  const statusBadge = (status: GlobalPickup['status']) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      on_the_way: 'bg-[#DCFCE7] text-[#16A34A]',
      completed: 'bg-gray-100 text-gray-500',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <p className="font-black text-gray-900 text-sm">Driver Portal</p>
              <p className="text-xs text-gray-500">{driver.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                driver.isOnline
                  ? 'bg-[#DCFCE7] text-[#16A34A] border border-green-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              {driver.isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {driver.isOnline ? 'Online' : 'Offline'}
            </button>
            <button onClick={onLogout} className="p-2 hover:bg-red-50 rounded-lg">
              <LogOut className="w-4 h-4 text-[#DC2626]" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Trips', value: driver.trips, color: 'text-[#16A34A]' },
            { label: 'Rating', value: `${driver.rating}★`, color: 'text-[#FACC15]' },
            { label: 'Earnings', value: `₦${(driver.totalEarnings / 1000).toFixed(0)}k`, color: 'text-[#DC2626]' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active Pickup */}
        {activePickup && (
          <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-bold text-sm">Active Pickup</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold bg-white/20`}>
                {activePickup.status === 'on_the_way' ? '🚛 En Route' : '✅ Assigned'}
              </span>
            </div>
            <p className="font-bold">{activePickup.userName}</p>
            <p className="text-green-100 text-sm mt-1">{activePickup.address}</p>
            <p className="text-green-200 text-xs mt-0.5">{activePickup.wasteType} · {activePickup.timeSlot}</p>
            <button
              onClick={() => onViewPickup(activePickup)}
              className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" /> View Details & Map
            </button>
          </div>
        )}

        {/* Available Pickups */}
        {driver.isOnline ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-gray-900">Available Pickups ({pendingPickups.length})</h2>
            </div>

            {pendingPickups.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-400 text-sm">No pending pickups right now</p>
                <p className="text-xs text-gray-400 mt-1">New requests will appear here automatically</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPickups.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{p.wasteType} Pickup</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.userName} · {p.userPhone}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      {p.address}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {p.date} · {p.timeSlot}
                    </div>
                    <button
                      onClick={() => onAcceptPickup(p)}
                      className="w-full py-2 bg-[#16A34A] text-white rounded-xl text-sm font-bold hover:bg-[#15803D] transition-colors"
                    >
                      Accept Pickup → ₦2,500
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 text-center">
            <WifiOff className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="font-bold text-gray-600">You're Offline</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Toggle online above to start receiving pickup requests
            </p>
            <button
              onClick={onToggleOnline}
              className="px-6 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors text-sm"
            >
              Go Online
            </button>
          </div>
        )}

        {/* My completed pickups */}
        {myPickups.filter((p) => p.status === 'completed').length > 0 && (
          <div>
            <h2 className="font-black text-gray-900 mb-3">
              Completed Today ({myPickups.filter((p) => p.status === 'completed').length})
            </h2>
            <div className="space-y-2">
              {myPickups
                .filter((p) => p.status === 'completed')
                .slice(0, 3)
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.wasteType} · {p.userName}</p>
                      <p className="text-xs text-gray-500">{p.address}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#16A34A]">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">Done</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pickup Detail View ────────────────────────────────────────────────────

function DriverPickupDetail({
  pickup,
  driver,
  driverPos,
  onBack,
  onStart,
  onComplete,
}: {
  pickup: GlobalPickup;
  driver: Driver;
  driverPos: [number, number];
  onBack: () => void;
  onStart: () => void;
  onComplete: () => void;
}) {
  const userLoc: [number, number] = pickup.lat && pickup.lng
    ? [pickup.lat, pickup.lng]
    : [6.4281, 3.4219];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-black text-gray-900">Pickup Details</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Status banner */}
        <div
          className={`rounded-xl p-4 flex items-center gap-3 ${
            pickup.status === 'on_the_way'
              ? 'bg-[#DCFCE7] border border-[#16A34A]'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            pickup.status === 'on_the_way' ? 'bg-[#16A34A]' : 'bg-blue-500'
          } text-white`}>
            {pickup.status === 'on_the_way' ? '🚛' : '✅'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">
              {pickup.status === 'on_the_way' ? 'En Route to Customer' : 'Pickup Assigned to You'}
            </p>
            <p className="text-xs text-gray-600">ID: {pickup.id}</p>
          </div>
        </div>

        {/* Map */}
        <OSMMap
          mode="track"
          userLocation={userLoc}
          driverLocation={driverPos}
          height="260px"
        />

        {/* Customer info */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Customer</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#DCFCE7] rounded-full flex items-center justify-center font-bold text-[#16A34A]">
              {pickup.userName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{pickup.userName}</p>
              <p className="text-xs text-gray-500">{pickup.userPhone}</p>
            </div>
          </div>
          <a
            href={`tel:${pickup.userPhone}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#16A34A] text-white rounded-xl text-sm font-bold hover:bg-[#15803D] transition-colors"
          >
            <Phone className="w-4 h-4" /> Call Customer
          </a>
        </div>

        {/* Pickup details */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Pickup Info</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Waste Type', value: pickup.wasteType },
              { label: 'Date', value: pickup.date },
              { label: 'Time Slot', value: pickup.timeSlot },
              { label: 'Address', value: pickup.address },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-500">{row.label}:</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {pickup.status === 'assigned' && (
            <button
              onClick={onStart}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" /> Start Driving → Mark En Route
            </button>
          )}
          {pickup.status === 'on_the_way' && (
            <button
              onClick={onComplete}
              className="w-full py-4 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Mark Pickup as Completed ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
