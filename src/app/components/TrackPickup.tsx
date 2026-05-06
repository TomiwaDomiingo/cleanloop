import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, User, Clock, Package, AlertCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { User as UserType, addNotification, sendBrowserNotification, requestBrowserNotificationPermission, updatePickupStatus } from '../types';
import { OSMMap } from './OSMMap';

interface TrackPickupProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onUpdateUser?: (user: UserType) => void;
}

// Lagos, Victoria Island vicinity — driver starts ~1.2km away
const DRIVER_INITIAL: [number, number] = [6.4381, 3.4319];

const mockDriver = {
  name: 'Adebayo Olaniyi',
  phone: '+234 812 345 6789',
  vehicle: 'Toyota Hilux – LAG 456 XY',
  rating: 4.8,
  trips: 127,
};

export function TrackPickup({ user, onNavigate, onUpdateUser }: TrackPickupProps) {
  const activePickup = user.pickupHistory.find(
    (p) => p.status === 'pending' || p.status === 'assigned' || p.status === 'on_the_way'
  );

  const [currentStatus, setCurrentStatus] = useState(activePickup?.status ?? 'pending');
  const [driverPos, setDriverPos] = useState<[number, number]>(DRIVER_INITIAL);
  const simulationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movementRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userLocation: [number, number] = activePickup?.lat && activePickup?.lng
    ? [activePickup.lat, activePickup.lng]
    : [6.4281, 3.4219];

  // ── Push notifications + status simulation ──────────────────────────
  useEffect(() => {
    if (!activePickup) return;

    // Request browser notification permission
    requestBrowserNotificationPermission();

    if (currentStatus === 'pending') {
      // After 12s → simulate driver assigned
      simulationRef.current = setTimeout(() => {
        setCurrentStatus('assigned');

        addNotification({
          userId: user.id,
          title: '✅ Driver Assigned!',
          body: `${mockDriver.name} has been assigned to your ${activePickup.wasteType} pickup.`,
          type: 'pickup',
          pickupId: activePickup.id,
        });

        sendBrowserNotification(
          '✅ CLEANLOOP – Driver Assigned',
          `${mockDriver.name} (${mockDriver.vehicle}) will pick up your waste.`
        );

        toast.success('🚛 Driver found! Adebayo Olaniyi has been assigned.');

        if (onUpdateUser && activePickup) {
          updatePickupStatus(user.id, activePickup.id, 'assigned', 'drv_001', mockDriver.name);
        }

        // After 20s more → simulate en route
        simulationRef.current = setTimeout(() => {
          setCurrentStatus('on_the_way');

          addNotification({
            userId: user.id,
            title: '🚛 Driver En Route!',
            body: `${mockDriver.name} is on the way. ETA ~10 minutes.`,
            type: 'pickup',
            pickupId: activePickup.id,
          });

          sendBrowserNotification(
            '🚛 CLEANLOOP – Driver En Route',
            `${mockDriver.name} is heading your way. ETA ~10 minutes!`
          );

          toast.success('🚛 Driver is on the way! ~10 minutes away.');

          if (onUpdateUser && activePickup) {
            updatePickupStatus(user.id, activePickup.id, 'on_the_way', 'drv_001', mockDriver.name);
          }
        }, 20000);
      }, 12000);
    }

    return () => {
      if (simulationRef.current) clearTimeout(simulationRef.current);
    };
  }, [activePickup?.id]);

  // ── Animate driver position toward user location ──────────────────────
  useEffect(() => {
    if (currentStatus !== 'on_the_way') return;

    movementRef.current = setInterval(() => {
      setDriverPos((prev) => {
        const dLat = userLocation[0] - prev[0];
        const dLng = userLocation[1] - prev[1];
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < 0.0003) {
          if (movementRef.current) clearInterval(movementRef.current);
          return userLocation;
        }
        const speed = 0.0001;
        return [prev[0] + (dLat / dist) * speed, prev[1] + (dLng / dist) * speed];
      });
    }, 2000);

    return () => {
      if (movementRef.current) clearInterval(movementRef.current);
    };
  }, [currentStatus]);

  // ── No active pickup state ────────────────────────────────────────────
  if (!activePickup) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-black text-gray-900">Track Pickup</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">No Active Pickup</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            You don't have any active pickup requests right now. Request a pickup to track your
            driver in real time on the map.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('request-pickup')}
              className="px-6 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors"
            >
              Request a Pickup
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Past pickups */}
          {user.pickupHistory.length > 0 && (
            <div className="mt-12 text-left max-w-lg mx-auto">
              <h3 className="font-bold text-gray-900 mb-4">Past Pickups</h3>
              <div className="space-y-3">
                {user.pickupHistory.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.wasteType} Pickup</p>
                      <p className="text-xs text-gray-500">
                        {p.date} · {p.timeSlot}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#16A34A]">+{p.points} pts</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {p.status === 'on_the_way' ? 'on the way' : p.status}
                      </p>
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

  // ── Active pickup tracking view ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900">Track Pickup</h1>
          <div className="ml-auto flex items-center gap-1.5 bg-[#DCFCE7] rounded-full px-3 py-1 text-xs font-bold text-[#16A34A]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            Live
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 pb-10">
        {/* Status Banner */}
        <div className="bg-[#DCFCE7] border border-[#16A34A] rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-gray-500 font-medium">Pickup ID: {activePickup.id}</div>
              <div className="text-xl font-black text-[#16A34A] mt-0.5">
                {currentStatus === 'pending'
                  ? '⏳ Finding Driver…'
                  : currentStatus === 'assigned'
                  ? '✅ Driver Assigned'
                  : '🚛 On the Way!'}
              </div>
            </div>
            <div className="w-12 h-12 bg-[#16A34A] text-white rounded-full flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-4 h-4" />
            <span>
              Scheduled:{' '}
              <strong>
                {activePickup.date} · {activePickup.timeSlot}
              </strong>
            </span>
          </div>
        </div>

        {/* Notification hint (pending state) */}
        {currentStatus === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-semibold">Searching for nearby driver…</p>
              <p className="text-xs text-blue-600 mt-0.5">
                You'll receive a push notification once a driver is assigned. Leave this tab open
                for real-time updates!
              </p>
            </div>
          </div>
        )}

        {/* OSM Live Map */}
        <div className="animate-in fade-in duration-700">
          <OSMMap
            mode="track"
            userLocation={userLocation}
            driverLocation={driverPos}
            height="300px"
          />
        </div>

        {/* Driver Info (shown when assigned) */}
        {currentStatus !== 'pending' && (activePickup.driverName || currentStatus !== 'pending') && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 animate-in fade-in duration-500">
            <h3 className="font-bold text-gray-900 mb-4">Driver Information</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-[#16A34A]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{activePickup.driverName || mockDriver.name}</div>
                <div className="text-sm text-gray-600">{mockDriver.vehicle}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[#FACC15]">★</span>
                  <span className="text-sm font-bold text-gray-900">{mockDriver.rating}</span>
                  <span className="text-sm text-gray-500">({mockDriver.trips} trips)</span>
                </div>
              </div>
            </div>
            <a
              href={`tel:${mockDriver.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Driver
            </a>
          </div>
        )}

        {/* Pickup Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-in fade-in duration-700">
          <h3 className="font-bold text-gray-900 mb-4">Pickup Details</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Waste Type', value: activePickup.wasteType },
              { label: 'Scheduled Date', value: activePickup.date },
              { label: 'Time Slot', value: activePickup.timeSlot },
              { label: 'Location', value: activePickup.address },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-500">{row.label}:</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-500">Points to Earn:</span>
              <span className="font-black text-[#16A34A]">+{activePickup.points} CleanPoints</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="animate-in fade-in duration-1000">
          <h3 className="font-bold text-gray-900 mb-4">Pickup Timeline</h3>
          <div className="space-y-4">
            {[
              { label: 'Pickup Requested', completed: true },
              { label: 'Driver Assigned', completed: currentStatus !== 'pending' },
              { label: 'Driver En Route', completed: currentStatus === 'on_the_way' || (currentStatus as string) === 'completed' },
              { label: 'Pickup Completed', completed: (currentStatus as string) === 'completed' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-500 ${
                    item.completed ? 'bg-[#16A34A] text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {item.completed ? '✓' : idx + 1}
                </div>
                <div>
                  <div
                    className={`font-semibold text-sm transition-colors duration-500 ${
                      item.completed ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-400">{item.completed ? 'Done' : 'Pending'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}