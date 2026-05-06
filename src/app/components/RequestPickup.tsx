import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Camera, Check } from 'lucide-react';
import { toast } from 'sonner';
import { User, computeTier } from '../types';
import { OSMMap } from './OSMMap';

interface RequestPickupProps {
  user: User;
  onNavigate: (page: string) => void;
  onUpdateUser: (user: User) => void;
}

export function RequestPickup({ user, onNavigate, onUpdateUser }: RequestPickupProps) {
  const [step, setStep] = useState(1);
  const [wasteType, setWasteType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState(user.address || '');
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [photo, setPhoto] = useState(false);

  const wasteTypes = [
    { id: 'general', name: 'General Waste', icon: '🗑️', color: 'bg-gray-50 border-gray-200', points: 100 },
    { id: 'recyclables', name: 'Recyclables', icon: '♻️', color: 'bg-[#DCFCE7] border-green-200', points: 150 },
    { id: 'organic', name: 'Organic', icon: '🌿', color: 'bg-[#FEF3C7] border-yellow-200', points: 100 },
    { id: 'hazardous', name: 'Hazardous', icon: '⚠️', color: 'bg-[#FEE2E2] border-red-200', points: 120 },
  ];

  const timeSlots = [
    '06:00 AM – 08:00 AM',
    '08:00 AM – 10:00 AM',
    '10:00 AM – 12:00 PM',
    '12:00 PM – 02:00 PM',
    '02:00 PM – 04:00 PM',
    '04:00 PM – 06:00 PM',
    '06:00 PM – 07:00 PM',
  ];

  const getDateOptions = () => {
    const dates: { label: string; value: string }[] = [];
    const d = new Date();
    while (dates.length < 5) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) {
        dates.push({
          label: d.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' }),
          value: d.toISOString().split('T')[0],
        });
      }
    }
    return dates;
  };

  const dateOptions = getDateOptions();
  const selectedWasteType = wasteTypes.find((t) => t.id === wasteType);
  const earnablePoints = selectedWasteType?.points ?? 100;

  const handlePinDrop = (lat: number, lng: number, resolvedAddress: string) => {
    setPinLat(lat);
    setPinLng(lng);
    // Only update the address input if it's empty or was set by a previous pin
    if (!address || address.startsWith('Pin:')) {
      setAddress(resolvedAddress);
    }
  };

  const handleSubmit = () => {
    const now = new Date();
    const dateStr = selectedDate
      ? new Date(selectedDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
      : now.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

    const newPickup = {
      id: `PK-${Date.now()}`,
      wasteType: selectedWasteType?.name ?? 'General Waste',
      timeSlot: selectedTime,
      address,
      lat: pinLat ?? undefined,
      lng: pinLng ?? undefined,
      status: 'pending' as const,
      date: dateStr,
      points: earnablePoints,
    };

    const newTransaction = {
      id: Date.now(),
      type: 'earned' as const,
      title: `${newPickup.wasteType} Pickup`,
      points: earnablePoints,
      date: dateStr,
    };

    const updatedUser: User = {
      ...user,
      points: user.points + earnablePoints,
      wasteRecycled: user.wasteRecycled + 3.5,
      tier: computeTier(user.points + earnablePoints),
      pickupHistory: [newPickup, ...user.pickupHistory],
      transactions: [newTransaction, ...user.transactions],
    };

    onUpdateUser(updatedUser);
    toast.success(`Pickup requested! You'll earn +${earnablePoints} CleanPoints on completion.`);
    setTimeout(() => onNavigate('track-pickup'), 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900">Request Pickup</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Waste Type', 'Date & Time', 'Location', 'Confirm'].map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      step > s
                        ? 'bg-[#16A34A] text-white'
                        : step === s
                        ? 'bg-[#16A34A] text-white ring-4 ring-green-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-xs mt-1 hidden sm:block ${
                      step >= s ? 'text-[#16A34A] font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-1 rounded ${step > s ? 'bg-[#16A34A]' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Waste Type */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Select Waste Type</h2>
            <p className="text-gray-500 mb-6 text-sm">Choose the type of waste to be collected</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {wasteTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setWasteType(type.id)}
                  className={`${type.color} border-2 ${
                    wasteType === type.id ? 'border-[#16A34A] ring-2 ring-green-100' : ''
                  } rounded-xl p-5 text-left hover:shadow-md transition-all`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm">{type.name}</h3>
                  <p className="text-xs text-[#16A34A] font-semibold mt-1">+{type.points} pts</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!wasteType}
              className="w-full py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Choose Date & Time</h2>
            <p className="text-gray-500 mb-6 text-sm">When should we collect your waste?</p>
            <p className="text-sm font-semibold text-gray-700 mb-2">Pick-up Date</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {dateOptions.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`p-3 border-2 rounded-xl text-sm font-medium transition-all ${
                    selectedDate === d.value
                      ? 'border-[#16A34A] bg-[#DCFCE7] text-[#16A34A] font-bold'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Pick-up Time Slot</p>
            <div className="space-y-2 mb-6">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`w-full p-3 border-2 rounded-xl text-left flex items-center gap-3 transition-all ${
                    selectedTime === slot
                      ? 'border-[#16A34A] bg-[#DCFCE7]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{slot}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Pickup Location</h2>
            <p className="text-gray-500 mb-4 text-sm">
              Type your address or tap the map to drop a pin
            </p>

            {/* Address text input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Street Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                  placeholder="e.g. 45 Ikorodu Road, Lagos Island"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Include your full address with area and LGA for faster assignment.
              </p>
            </div>

            {/* OSM Interactive Map */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Pin Your Location on Map
                </label>
                {pinLat && (
                  <span className="text-xs text-[#16A34A] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Pin dropped
                  </span>
                )}
              </div>
              <OSMMap
                mode="pin"
                onPinDrop={handlePinDrop}
                initialPin={pinLat && pinLng ? [pinLat, pinLng] : undefined}
                height="280px"
                placeholder="Tap anywhere to set pickup location"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!address.trim()}
                className="flex-1 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Photo & Confirm */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Photo & Confirm</h2>
            <p className="text-gray-500 mb-6 text-sm">Add a photo and review your request</p>
            <button
              type="button"
              onClick={() => setPhoto(!photo)}
              className={`w-full border-2 border-dashed ${
                photo ? 'border-[#16A34A] bg-[#DCFCE7]' : 'border-gray-300 hover:border-gray-400'
              } rounded-xl p-10 mb-6 text-center transition-colors`}
            >
              <Camera className={`w-10 h-10 mx-auto mb-3 ${photo ? 'text-[#16A34A]' : 'text-gray-400'}`} />
              <p className="font-bold text-gray-800 text-sm">
                {photo ? (
                  <span className="flex items-center justify-center gap-2 text-[#16A34A]">
                    <Check className="w-4 h-4" /> Photo added ✓
                  </span>
                ) : (
                  'Tap to upload or take a photo (optional)'
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
            </button>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">📋 Pickup Summary</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Waste Type', value: selectedWasteType?.name },
                  {
                    label: 'Date',
                    value: selectedDate
                      ? new Date(selectedDate).toLocaleDateString('en-NG', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—',
                  },
                  { label: 'Time Slot', value: selectedTime },
                  { label: 'Location', value: address },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-gray-500">{row.label}:</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                      {row.value}
                    </span>
                  </div>
                ))}
                {pinLat && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">GPS Pin:</span>
                    <span className="font-semibold text-[#16A34A] text-right text-xs">
                      {pinLat.toFixed(5)}, {pinLng?.toFixed(5)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-500">Points to Earn:</span>
                  <span className="font-black text-[#16A34A]">+{earnablePoints} CleanPoints</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors"
              >
                Confirm Pickup ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
