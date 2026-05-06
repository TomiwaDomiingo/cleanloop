import { useState } from 'react';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Award, LogOut,
  Edit2, Save, X, ChevronRight, HelpCircle, Settings
} from 'lucide-react';
import { Logo } from './Logo';
import { toast } from 'sonner';
import { User as UserType, computeTier, pointsToNextTier } from '../types';

interface ProfileProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onUpdateUser: (user: UserType) => void;
  onLogout: () => void;
}

export function Profile({ user, onNavigate, onUpdateUser, onLogout }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
  });
  const [saving, setSaving] = useState(false);

  const tierInfo = pointsToNextTier(user.points);

  const tierBadge = {
    Gold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Silver: 'bg-gray-100 text-gray-700 border-gray-300',
    Bronze: 'bg-orange-100 text-orange-700 border-orange-300',
  }[user.tier];

  const handleSave = async () => {
    if (!editData.fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const updatedUser: UserType = {
      ...user,
      fullName: editData.fullName.trim(),
      phone: editData.phone.trim(),
      address: editData.address.trim(),
      tier: computeTier(user.points),
    };

    onUpdateUser(updatedUser);
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditData({ fullName: user.fullName, phone: user.phone, address: user.address });
    setEditing(false);
  };

  const achievements = [
    { emoji: '🎯', title: 'First Pickup', desc: 'Completed first pickup', unlocked: user.pickupHistory.length >= 1 },
    { emoji: '♻️', title: 'Eco Warrior', desc: '5+ pickups done', unlocked: user.pickupHistory.length >= 5 },
    { emoji: '🌟', title: 'Community Hero', desc: 'Reported 1+ dumpsites', unlocked: user.dumpsiteReports.length >= 1 },
    { emoji: '🔥', title: 'Power User', desc: '10+ pickups done', unlocked: user.pickupHistory.length >= 10 },
    { emoji: '💰', title: 'Point Collector', desc: 'Earned 1,000+ pts', unlocked: user.points >= 1000 },
    { emoji: '🏆', title: 'Green Champion', desc: 'Reached Silver tier', unlocked: user.tier === 'Silver' || user.tier === 'Gold' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-black text-gray-900">My Profile</h1>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-16">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-2xl p-6 mb-5 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Logo size={52} />
            </div>
          </div>
          <h2 className="text-2xl font-black mb-1">{user.fullName}</h2>
          <p className="text-green-200 text-sm mb-3">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tierBadge}`}>
              <Award className="w-3 h-3 inline mr-1" />
              {user.tier} Member
            </span>
          </div>
          <p className="text-green-200 text-xs">Member since {user.memberSince}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 animate-in fade-in duration-700">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-[#16A34A]">{user.pickupHistory.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Pickups</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-[#DC2626]">{user.points.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">Points</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-gray-800">{user.dumpsiteReports.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Reports</div>
          </div>
        </div>

        {/* Tier Progress */}
        {tierInfo.next && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-gray-700">{user.tier} Tier</span>
              <span className="text-gray-500">{tierInfo.needed.toLocaleString()} pts to {tierInfo.next}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#16A34A] rounded-full"
                style={{
                  width: `${Math.min(100,
                    user.tier === 'Bronze'
                      ? (user.points / 1000) * 100
                      : ((user.points - 1000) / 2000) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 animate-in fade-in duration-1000">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Contact Information</h3>
            {editing && (
              <div className="flex gap-2">
                <button onClick={handleCancelEdit} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-sm font-bold hover:bg-[#15803D] disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Full Name</div>
                {editing ? (
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) => setEditData((d) => ({ ...d, fullName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="font-semibold text-gray-900 text-sm">{user.fullName}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="font-semibold text-gray-900 text-sm">{user.email}</div>
                {editing && <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                {editing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="font-semibold text-gray-900 text-sm">
                    {user.phone || <span className="text-gray-400 italic">Not set</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Default Pickup Address</div>
                {editing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData((d) => ({ ...d, address: e.target.value }))}
                    placeholder="e.g. 45 Ikorodu Road, Lagos Island"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="font-semibold text-gray-900 text-sm">
                    {user.address || <span className="text-gray-400 italic">Not set</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 animate-in fade-in duration-1000">
          <h3 className="font-bold text-gray-900 mb-4">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-3 text-center border ${
                  a.unlocked
                    ? 'bg-gradient-to-br from-[#DCFCE7] to-white border-[#16A34A]/30'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{a.unlocked ? a.emoji : '🔒'}</div>
                <div className={`text-xs font-bold mb-0.5 ${a.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                  {a.title}
                </div>
                <div className="text-xs text-gray-500">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 animate-in fade-in duration-1000">
          <button
            onClick={() => onNavigate('wallet')}
            className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Settings & Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 bg-[#FEE2E2] border border-[#DC2626]/30 text-[#DC2626] rounded-xl font-bold hover:bg-[#FECACA] transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
