import { useState } from 'react';
import { ArrowLeft, Camera, MapPin, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { User, computeTier } from '../types';
import { OSMMap } from './OSMMap';

interface ReportDumpsiteProps {
  user: User;
  onNavigate: (page: string) => void;
  onUpdateUser: (user: User) => void;
}

type Severity = 'Low' | 'Medium' | 'High';

export function ReportDumpsite({ user, onNavigate, onUpdateUser }: ReportDumpsiteProps) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [photo, setPhoto] = useState(false);
  const [severity, setSeverity] = useState<Severity>('Low');

  const handlePinDrop = (lat: number, lng: number, resolvedAddress: string) => {
    setPinLat(lat);
    setPinLng(lng);
    if (!location || location.startsWith('Pin:')) {
      setLocation(resolvedAddress);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      toast.error('Please add a photo of the dumpsite.');
      return;
    }
    if (!location.trim()) {
      toast.error('Please enter the dumpsite location.');
      return;
    }
    if (description.length < 10) {
      toast.error('Description must be at least 10 characters.');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

    const newReport = {
      id: `RPT-${Date.now()}`,
      location: location.trim(),
      description: description.trim(),
      severity,
      status: 'pending' as const,
      date: dateStr,
      lat: pinLat ?? undefined,
      lng: pinLng ?? undefined,
    };

    const REPORT_POINTS = 50;

    const newTransaction = {
      id: Date.now(),
      type: 'earned' as const,
      title: 'Dumpsite Report (Pending Verification)',
      points: REPORT_POINTS,
      date: dateStr,
    };

    const updatedUser: User = {
      ...user,
      points: user.points + REPORT_POINTS,
      tier: computeTier(user.points + REPORT_POINTS),
      dumpsiteReports: [newReport, ...user.dumpsiteReports],
      transactions: [newTransaction, ...user.transactions],
    };

    onUpdateUser(updatedUser);
    toast.success("Report submitted! You've earned +50 CleanPoints (pending verification).");
    setTimeout(() => onNavigate('dashboard'), 1800);
  };

  const severityOptions: { level: Severity; color: string; activeColor: string; desc: string }[] = [
    { level: 'Low', color: 'border-gray-200 bg-gray-50', activeColor: 'border-[#FACC15] bg-[#FEF3C7]', desc: 'Small amount' },
    { level: 'Medium', color: 'border-gray-200 bg-gray-50', activeColor: 'border-orange-400 bg-orange-50', desc: 'Moderate pile' },
    { level: 'High', color: 'border-gray-200 bg-gray-50', activeColor: 'border-[#DC2626] bg-[#FEE2E2]', desc: 'Large / hazardous' },
  ];

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900">Report Illegal Dumpsite</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-[#FEF3C7] border border-[#FACC15] rounded-xl p-5 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AlertTriangle className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Help Keep Lagos Clean</h3>
            <p className="text-sm text-gray-700">
              Report illegal waste dumpsites. Once verified by our team, you'll earn{' '}
              <strong>+50 CleanPoints</strong> and help clean up Lagos!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Photo <span className="text-[#DC2626]">*</span>
            </label>
            <button
              type="button"
              onClick={() => setPhoto(!photo)}
              className={`w-full border-2 border-dashed ${
                photo ? 'border-[#16A34A] bg-[#DCFCE7]' : 'border-gray-300 hover:border-gray-400'
              } rounded-xl p-10 text-center transition-colors`}
            >
              <Camera className={`w-10 h-10 mx-auto mb-3 ${photo ? 'text-[#16A34A]' : 'text-gray-400'}`} />
              <p className="font-semibold text-gray-800 text-sm">
                {photo ? (
                  <span className="flex items-center justify-center gap-2 text-[#16A34A]">
                    Photo uploaded <Check className="w-4 h-4" />
                  </span>
                ) : (
                  'Tap to take or upload a photo'
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Clear photo of the dumpsite (JPG, PNG up to 5MB)</p>
            </button>
          </div>

          {/* Location — text + map pin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dumpsite Location <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative mb-3">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                placeholder="Enter street address or nearby landmark"
                required
              />
            </div>

            {/* OSM Interactive Map */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600">
                  📍 Tap the map to pin the exact dumpsite location
                </p>
                {pinLat && (
                  <span className="text-xs text-[#16A34A] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Pin set
                  </span>
                )}
              </div>
              <OSMMap
                mode="pin"
                onPinDrop={handlePinDrop}
                initialPin={pinLat && pinLng ? [pinLat, pinLng] : undefined}
                height="260px"
              />
              {pinLat && (
                <p className="text-xs text-gray-400 mt-1.5">
                  📌 Coordinates: {pinLat.toFixed(5)}, {pinLng?.toFixed(5)}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none resize-none"
              rows={4}
              placeholder="Describe what you see… (e.g. 'Large pile of mixed plastics and organic waste blocking the drainage channel')"
              required
              minLength={10}
            />
            <div className="flex items-center justify-between mt-1">
              <p className={`text-xs ${description.length >= 10 ? 'text-[#16A34A]' : 'text-gray-400'}`}>
                {description.length >= 10 ? '✓ Good description' : `${10 - description.length} more characters needed`}
              </p>
              <p className="text-xs text-gray-400">{description.length} chars</p>
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level</label>
            <div className="grid grid-cols-3 gap-3">
              {severityOptions.map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setSeverity(item.level)}
                  className={`border-2 rounded-xl p-3 text-center transition-all ${
                    severity === item.level ? item.activeColor : item.color
                  }`}
                >
                  <div className="font-bold text-gray-900 text-sm">{item.level}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!photo || !location.trim() || description.length < 10}
            className="w-full py-4 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Submit Report → Earn +50 pts
          </button>
        </form>

        {/* What Happens Next */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4">What Happens Next?</h3>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Report Review', desc: 'Our team reviews your report within 24 hours.' },
              { step: 2, title: 'Cleanup Dispatch', desc: 'A cleanup crew is assigned to the location.' },
              { step: 3, title: 'Points Credited', desc: '+50 CleanPoints added once verified.' },
              { step: 4, title: 'Status Updates', desc: 'Track cleanup progress in your activity feed.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-[#16A34A] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
