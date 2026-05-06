import { useState, useEffect } from 'react';
import { Logo } from './Logo';
import {
  ArrowLeft, Users, Package, AlertTriangle, Truck, LogOut,
  CheckCircle, Clock, BarChart2, Shield, Eye, ChevronDown,
  RefreshCw, X, AlertCircle, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  loginAdmin,
  setAdminSession,
  clearAdminSession,
  getAdminSession,
  getAllPickups,
  getAllDumpsiteReports,
  getStoredUsers,
  getStoredDrivers,
  updatePickupStatus,
  updateDumpsiteStatus,
  saveDriver,
  GlobalPickup,
  DumpsiteReport,
  Driver,
  User,
} from '../types';

interface AdminPortalProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'overview' | 'pickups' | 'reports' | 'drivers' | 'users';

export function AdminPortal({ onNavigate }: AdminPortalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(getAdminSession());
  }, []);

  const handleLogin = (email: string, password: string): string | null => {
    if (!loginAdmin(email, password)) {
      return 'Invalid admin credentials.';
    }
    setAdminSession();
    setIsLoggedIn(true);
    return null;
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} onBack={() => onNavigate('welcome')} />;
  }

  return <AdminDashboardView onLogout={handleLogout} onNavigate={onNavigate} />;
}

// ─── Admin Login ───────────────────────────────────────────────────────────

function AdminLogin({
  onLogin,
  onBack,
}: {
  onLogin: (email: string, password: string) => string | null;
  onBack: () => void;
}) {
  const [email, setEmail] = useState('admin@cleanloop.ng');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const err = onLogin(email.trim(), password);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="border-b border-gray-800">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-black text-white text-sm">CLEANLOOP Admin</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 text-center mb-6">
            <div className="w-14 h-14 bg-[#16A34A] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Admin Portal</h1>
            <p className="text-gray-400 text-sm">CLEANLOOP Operations Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none placeholder-gray-500"
                placeholder="admin@cleanloop.ng"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
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
                'Enter Admin Dashboard'
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-xl">
            <p className="text-xs text-gray-400 text-center">
              Demo credentials pre-filled above.<br />
              <span className="text-gray-500">Email: admin@cleanloop.ng · Password: Admin@123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard View ──────────────────────────────────────────────────

function AdminDashboardView({
  onLogout,
  onNavigate,
}: {
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const allPickups = getAllPickups();
  const allReports = getAllDumpsiteReports();
  const allUsers = getStoredUsers();
  const allDrivers = getStoredDrivers();

  const stats = {
    users: allUsers.length,
    pickups: allPickups.length,
    pendingPickups: allPickups.filter((p) => p.status === 'pending').length,
    activePickups: allPickups.filter((p) => p.status === 'assigned' || p.status === 'on_the_way').length,
    completedPickups: allPickups.filter((p) => p.status === 'completed').length,
    reports: allReports.length,
    pendingReports: allReports.filter((r) => r.status === 'pending').length,
    verifiedReports: allReports.filter((r) => r.status === 'verified').length,
    drivers: allDrivers.length,
    onlineDrivers: allDrivers.filter((d) => d.isOnline).length,
    totalPoints: allUsers.reduce((s, u) => s + u.points, 0),
  };

  const chartData = [
    { name: 'Pending', value: stats.pendingPickups, fill: '#FACC15' },
    { name: 'Active', value: stats.activePickups, fill: '#16A34A' },
    { name: 'Completed', value: stats.completedPickups, fill: '#6B7280' },
    { name: 'Reports', value: stats.reports, fill: '#DC2626' },
  ];

  const refresh = () => {
    setLastRefresh(Date.now());
    toast.success('Data refreshed');
  };

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'pickups', label: `Pickups (${allPickups.length})`, icon: Package },
    { id: 'reports', label: `Reports (${allReports.length})`, icon: AlertTriangle },
    { id: 'drivers', label: `Drivers (${allDrivers.length})`, icon: Truck },
    { id: 'users', label: `Users (${allUsers.length})`, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <div>
              <p className="font-black text-sm">CLEANLOOP Admin</p>
              <p className="text-gray-400 text-xs">Operations Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 hover:bg-gray-700 rounded-lg"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => onNavigate('welcome')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to App
            </button>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-900/40 rounded-lg"
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-50 text-gray-900'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.users, color: 'border-blue-200 text-blue-600', bg: 'bg-blue-50', icon: Users },
                { label: 'Total Pickups', value: stats.pickups, color: 'border-[#16A34A]/30 text-[#16A34A]', bg: 'bg-green-50', icon: Package },
                { label: 'Pending Pickups', value: stats.pendingPickups, color: 'border-yellow-300 text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
                { label: 'Dumpsite Reports', value: stats.reports, color: 'border-red-200 text-[#DC2626]', bg: 'bg-red-50', icon: AlertTriangle },
                { label: 'Active Drivers', value: `${stats.onlineDrivers}/${stats.drivers}`, color: 'border-[#16A34A]/30 text-[#16A34A]', bg: 'bg-green-50', icon: Truck },
                { label: 'Completed Pickups', value: stats.completedPickups, color: 'border-gray-200 text-gray-600', bg: 'bg-gray-50', icon: CheckCircle },
                { label: 'Pending Reports', value: stats.pendingReports, color: 'border-orange-200 text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
                { label: 'Total CleanPoints', value: stats.totalPoints.toLocaleString(), color: 'border-[#FACC15]/50 text-yellow-600', bg: 'bg-yellow-50', icon: BarChart2 },
              ].map((s) => (
                <div key={s.label} className={`bg-white border ${s.color.split(' ')[0]} rounded-xl p-4`}>
                  <div className={`${s.bg} w-9 h-9 rounded-lg flex items-center justify-center mb-2`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.color.split(' ')[1]}`} />
                  </div>
                  <div className={`text-2xl font-black ${s.color.split(' ')[1]}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-black text-gray-900 mb-5">Activity Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent pickups quick view */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900">Recent Pickups</h3>
                <button
                  onClick={() => setActiveTab('pickups')}
                  className="text-[#16A34A] text-xs font-bold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {allPickups.slice(0, 5).map((p) => (
                  <PickupRow key={p.id} pickup={p} drivers={allDrivers} compact />
                ))}
                {allPickups.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No pickups yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PICKUPS ── */}
        {activeTab === 'pickups' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900">All Pickups</h2>
              <div className="flex gap-2 text-xs">
                {['All', 'Pending', 'Active', 'Completed'].map((f) => (
                  <button
                    key={f}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 font-semibold text-gray-600 transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {allPickups.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-semibold">No pickups yet</p>
                </div>
              )}
              {allPickups.map((p) => (
                <PickupRow key={`${p.id}-${p.userId}`} pickup={p} drivers={allDrivers} />
              ))}
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activeTab === 'reports' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="font-black text-gray-900 mb-4">Dumpsite Reports</h2>
            <div className="space-y-3">
              {allReports.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                  <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-semibold">No reports yet</p>
                </div>
              )}
              {allReports.map((r) => (
                <DumpsiteReportRow key={`${r.id}-${r.userId}`} report={r} />
              ))}
            </div>
          </div>
        )}

        {/* ── DRIVERS ── */}
        {activeTab === 'drivers' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="font-black text-gray-900 mb-4">Driver Management</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allDrivers.map((d) => (
                <DriverCard key={d.id} driver={d} pickups={allPickups} />
              ))}
              {allDrivers.length === 0 && (
                <div className="col-span-3 bg-white border border-gray-200 rounded-xl p-10 text-center">
                  <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-semibold">No drivers registered</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="font-black text-gray-900 mb-4">Registered Users</h2>
            <div className="space-y-3">
              {allUsers.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-semibold">No users yet</p>
                </div>
              )}
              {allUsers.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-row components ────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  on_the_way: 'bg-[#DCFCE7] text-[#16A34A] border-green-200',
  completed: 'bg-gray-100 text-gray-500 border-gray-200',
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  cleaned: 'bg-[#DCFCE7] text-[#16A34A] border-green-200',
};

function PickupRow({
  pickup,
  drivers,
  compact,
}: {
  pickup: GlobalPickup;
  drivers: Driver[];
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(pickup.driverAssigned || '');

  const handleAssign = () => {
    if (!selectedDriver) {
      toast.error('Select a driver first');
      return;
    }
    const driver = drivers.find((d) => d.id === selectedDriver);
    if (!driver) return;
    updatePickupStatus(pickup.userId, pickup.id, 'assigned', driver.id, driver.name);
    toast.success(`Pickup assigned to ${driver.name}`);
    pickup.status = 'assigned';
    pickup.driverAssigned = driver.id;
    pickup.driverName = driver.name;
  };

  const statusLabel = pickup.status === 'on_the_way' ? 'On The Way' : pickup.status;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${compact ? '' : ''}`}
        onClick={() => !compact && setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{pickup.id}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${STATUS_COLORS[pickup.status] || 'bg-gray-100 text-gray-500'}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {pickup.userName} · {pickup.wasteType} · {pickup.date}
          </p>
          {pickup.driverName && (
            <p className="text-xs text-[#16A34A] mt-0.5">Driver: {pickup.driverName}</p>
          )}
        </div>
        {!compact && (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3 animate-in fade-in duration-200">
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {[
              ['Address', pickup.address],
              ['Time Slot', pickup.timeSlot],
              ['Phone', pickup.userPhone],
              ['Points', `${pickup.points} pts`],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-gray-400">{k}: </span>
                <span className="font-semibold text-gray-700">{v}</span>
              </div>
            ))}
          </div>

          {/* Assign driver */}
          {pickup.status === 'pending' && (
            <div className="flex gap-2">
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#16A34A] outline-none"
              >
                <option value="">Assign Driver…</option>
                {drivers.filter((d) => d.isOnline).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.area})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                className="px-3 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803D] transition-colors"
              >
                Assign
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DumpsiteReportRow({
  report,
}: {
  report: DumpsiteReport & { userId: string; userName: string };
}) {
  const [expanded, setExpanded] = useState(false);

  const handleUpdateStatus = (status: DumpsiteReport['status']) => {
    updateDumpsiteStatus(report.userId, report.id, status);
    report.status = status;
    toast.success(`Report marked as ${status}`);
  };

  const severityColor =
    report.severity === 'High'
      ? 'text-[#DC2626] bg-red-50'
      : report.severity === 'Medium'
      ? 'text-orange-600 bg-orange-50'
      : 'text-yellow-600 bg-yellow-50';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{report.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-600'}`}>
              {report.status}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${severityColor}`}>
              {report.severity}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {report.userName} · {report.location} · {report.date}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3 animate-in fade-in duration-200">
          <p className="text-xs text-gray-600 leading-relaxed">{report.description}</p>
          {report.status !== 'cleaned' && (
            <div className="flex gap-2">
              {report.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus('verified')}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Verify Report
                </button>
              )}
              {(report.status === 'verified' || report.status === 'pending') && (
                <button
                  onClick={() => handleUpdateStatus('cleaned')}
                  className="flex-1 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803D] transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Cleaned
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DriverCard({
  driver,
  pickups,
}: {
  driver: Driver;
  pickups: GlobalPickup[];
}) {
  const driverPickups = pickups.filter((p) => p.driverAssigned === driver.id);
  const completed = driverPickups.filter((p) => p.status === 'completed').length;

  const handleToggle = () => {
    const updated = { ...driver, isOnline: !driver.isOnline };
    saveDriver(updated);
    toast.success(`${driver.name} marked ${updated.isOnline ? 'Online' : 'Offline'}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">{driver.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{driver.area}</p>
        </div>
        <button
          onClick={handleToggle}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
            driver.isOnline
              ? 'bg-[#DCFCE7] text-[#16A34A] border-green-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}
        >
          {driver.isOnline ? '● Online' : '○ Offline'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">{driver.vehicle}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Trips', value: driver.trips },
          { label: 'Rating', value: `${driver.rating}★` },
          { label: 'Done', value: completed },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-2">
            <div className="font-black text-gray-900 text-sm">{s.value}</div>
            <div className="text-[10px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-3">
        <span className="text-gray-500">Phone: <span className="text-gray-700 font-semibold">{driver.phone}</span></span>
        <span className="text-[#16A34A] font-bold">₦{(driver.totalEarnings / 1000).toFixed(0)}k earned</span>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-9 h-9 bg-[#DCFCE7] rounded-full flex items-center justify-center font-bold text-[#16A34A] text-sm flex-shrink-0">
          {user.fullName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 text-sm">{user.fullName}</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              user.tier === 'Gold'
                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                : user.tier === 'Silver'
                ? 'bg-gray-100 text-gray-600 border-gray-200'
                : 'bg-orange-100 text-orange-600 border-orange-200'
            }`}>
              {user.tier}
            </span>
          </div>
          <p className="text-xs text-gray-500">{user.email} · {user.points.toLocaleString()} pts</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: 'Pickups', value: user.pickupHistory.length },
              { label: 'Reports', value: user.dumpsiteReports.length },
              { label: 'Points', value: user.points.toLocaleString() },
              { label: 'Recycled', value: `${user.wasteRecycled}kg` },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg p-2 border border-gray-100">
                <div className="font-black text-gray-900 text-sm">{s.value}</div>
                <div className="text-[10px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Phone: {user.phone || 'N/A'} · Address: {user.address || 'N/A'}</p>
          <p className="text-xs text-gray-400">Member since {user.memberSince}</p>
        </div>
      )}
    </div>
  );
}