import { Logo } from './Logo';
import { NotificationBell } from './NotificationBell';
import { Recycle, MapPin, AlertTriangle, Wallet, History, User, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface DashboardProps {
  user: UserType;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  const firstName = user.fullName.split(' ')[0];

  const features = [
    {
      icon: Recycle,
      title: 'Request Pickup',
      desc: 'Schedule waste collection',
      color: 'bg-[#DCFCE7] text-[#16A34A]',
      borderColor: 'border-[#16A34A]',
      page: 'request-pickup',
    },
    {
      icon: MapPin,
      title: 'Track Pickup',
      desc: 'See your driver live',
      color: 'bg-[#FEE2E2] text-[#DC2626]',
      borderColor: 'border-[#DC2626]',
      page: 'track-pickup',
    },
    {
      icon: AlertTriangle,
      title: 'Report Dumpsite',
      desc: 'Flag illegal dumping',
      color: 'bg-[#FEF3C7] text-gray-800',
      borderColor: 'border-[#FACC15]',
      page: 'report-dumpsite',
    },
    {
      icon: Wallet,
      title: 'My Wallet',
      desc: `${user.points.toLocaleString()} CleanPoints`,
      color: 'bg-[#DCFCE7] text-[#16A34A]',
      borderColor: 'border-[#16A34A]',
      page: 'wallet',
    },
  ];

  const pickupActivities = user.pickupHistory.map((p) => ({
    type: 'pickup' as const,
    title: `${p.wasteType} Pickup`,
    points: `+${p.points} pts`,
    date: p.date,
    status: p.status,
    id: p.id,
  }));

  const reportActivities = user.dumpsiteReports.map((r) => ({
    type: 'report' as const,
    title: 'Dumpsite Reported',
    points: '+50 pts',
    date: r.date,
    status: r.status,
    id: r.id,
  }));

  const recentActivity = [...pickupActivities, ...reportActivities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const tierBadgeColor =
    user.tier === 'Gold'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
      : user.tier === 'Silver'
      ? 'bg-gray-100 text-gray-700 border-gray-300'
      : 'bg-orange-100 text-orange-700 border-orange-300';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <span className="text-xl font-black text-gray-900">CLEANLOOP</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold border ${tierBadgeColor}`}
            >
              {user.tier} Member
            </span>

            {/* Notification Bell */}
            <NotificationBell userId={user.id} />

            <button
              onClick={() => onNavigate('profile')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="My Profile"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-50 rounded-lg hidden sm:flex"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-[#DC2626]" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-2xl p-6 mb-6 text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl font-black mb-1">Hey {firstName}! 👋</h1>
          <p className="text-green-100 text-sm">
            {recentActivity.length === 0
              ? 'Welcome to CLEANLOOP! Make your first pickup request to start earning.'
              : `You've done ${user.pickupHistory.length} pickup${user.pickupHistory.length !== 1 ? 's' : ''} and earned ${user.points.toLocaleString()} CleanPoints 🎉`}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white border border-[#16A34A] rounded-xl p-4">
            <div className="text-2xl font-black text-[#16A34A]">{user.points.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">CleanPoints</div>
          </div>
          <div className="bg-white border border-[#DC2626] rounded-xl p-4">
            <div className="text-2xl font-black text-[#DC2626]">{user.pickupHistory.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Pickups</div>
          </div>
          <div className="bg-white border border-[#FACC15] rounded-xl p-4">
            <div className="text-2xl font-black text-gray-800">
              {user.wasteRecycled > 0 ? `${user.wasteRecycled}kg` : '0kg'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Recycled</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-6 animate-in fade-in duration-1000">
          <h2 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate(feature.page)}
                className={`${feature.color} ${feature.borderColor} border-2 rounded-xl p-5 text-left hover:shadow-lg transition-all transform hover:scale-105 duration-300`}
              >
                <feature.icon className="w-7 h-7 mb-3" />
                <h3 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active pickup banner */}
        {user.pickupHistory.find((p) => p.status === 'on_the_way' || p.status === 'assigned') && (
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity animate-in fade-in duration-500"
            onClick={() => onNavigate('track-pickup')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🚛</span>
              </div>
              <div>
                <p className="font-bold text-sm">Driver En Route!</p>
                <p className="text-blue-100 text-xs">Tap to track on live map →</p>
              </div>
            </div>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
          </div>
        )}

        {/* Recent Activity */}
        <div className="animate-in fade-in duration-1000">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900">Recent Activity</h2>
            <button
              onClick={() => onNavigate('wallet')}
              className="text-[#16A34A] text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Recycle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No activity yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Request your first pickup to start earning CleanPoints!
              </p>
              <button
                onClick={() => onNavigate('request-pickup')}
                className="mt-4 px-6 py-2 bg-[#16A34A] text-white rounded-lg text-sm font-bold hover:bg-[#15803D] transition-colors"
              >
                Request Pickup
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'pickup' ? 'bg-[#DCFCE7]' : 'bg-[#FEF3C7]'
                      }`}
                    >
                      {activity.type === 'pickup' ? (
                        <Recycle className="w-5 h-5 text-[#16A34A]" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-gray-700" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-500">{activity.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#16A34A] text-sm">{activity.points}</div>
                    <div
                      className={`text-xs capitalize ${
                        activity.status === 'completed' || activity.status === 'verified'
                          ? 'text-[#16A34A]'
                          : activity.status === 'on_the_way'
                          ? 'text-blue-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {activity.status === 'on_the_way' ? 'on the way' : activity.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-20">
        <div className="grid grid-cols-4 gap-1 p-2">
          {[
            { icon: Recycle, label: 'Home', page: 'dashboard' },
            { icon: History, label: 'History', page: 'wallet' },
            { icon: Wallet, label: 'Wallet', page: 'wallet' },
            { icon: User, label: 'Profile', page: 'profile' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(item.page)}
              className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-gray-100"
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
