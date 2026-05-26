import { ArrowLeft, Recycle, AlertTriangle, Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface HistoryProps {
  user: UserType;
  onNavigate: (page: string) => void;
}

export function History({ user, onNavigate }: HistoryProps) {
  const allActivities = [
    ...user.pickupHistory.map((p) => ({
      type: 'pickup' as const,
      id: p.id,
      title: `${p.wasteType} Pickup`,
      description: p.address,
      date: p.date,
      timeSlot: p.timeSlot,
      status: p.status,
      points: p.points,
      icon: Recycle,
      color: 'bg-[#DCFCE7] text-[#16A34A]',
      borderColor: 'border-[#16A34A]',
    })),
    ...user.dumpsiteReports.map((r) => ({
      type: 'report' as const,
      id: r.id,
      title: 'Dumpsite Reported',
      description: r.location,
      date: r.date,
      status: r.status,
      severity: r.severity,
      points: 50,
      icon: AlertTriangle,
      color: 'bg-[#FEF3C7] text-gray-800',
      borderColor: 'border-[#FACC15]',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isEmpty = allActivities.length === 0;

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-gray-500 bg-gray-100',
      label: 'Pending',
    },
    assigned: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100',
      label: 'Assigned',
    },
    on_the_way: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-yellow-600 bg-yellow-100',
      label: 'On the Way',
    },
    completed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100',
      label: 'Completed',
    },
    verified: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100',
      label: 'Verified',
    },
    cleaned: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100',
      label: 'Cleaned',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900">My History</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Empty State */}
        {isEmpty ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">No History Yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              Your waste pickup and dumpsite reports will appear here. Start by requesting your
              first pickup or reporting an illegal dumpsite to build your environmental impact
              record!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate('request-pickup')}
                className="px-6 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors"
              >
                Request Pickup
              </button>
              <button
                onClick={() => onNavigate('report-dumpsite')}
                className="px-6 py-3 bg-[#FACC15] text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
              >
                Report Dumpsite
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* History Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-[#16A34A] rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-2xl font-black text-[#16A34A]">{user.pickupHistory.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Pickups Completed</div>
              </div>
              <div className="bg-white border border-[#FACC15] rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-2xl font-black text-gray-800">
                  {user.dumpsiteReports.length}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Reports Submitted</div>
              </div>
              <div className="bg-white border border-[#DC2626] rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-900">
                <div className="text-2xl font-black text-[#DC2626]">
                  {user.pickupHistory.reduce((sum, p) => sum + p.points, 0)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Points Earned</div>
              </div>
            </div>

            {/* Filter Info */}
            <div className="bg-[#DCFCE7] border border-[#16A34A]/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>📜 Total Activities:</strong> {allActivities.length} pickup
                {allActivities.length !== 1 ? 's' : ''} & report
                {user.dumpsiteReports.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {allActivities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-lg flex-shrink-0 ${activity.color}`}
                    >
                      <activity.icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{activity.title}</h3>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.description}
                          </p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {activity.date}
                          {activity.timeSlot && ` · ${activity.timeSlot}`}
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${
                            statusConfig[activity.status]?.color || 'text-gray-600 bg-gray-100'
                          }`}
                        >
                          {statusConfig[activity.status]?.icon}
                          {statusConfig[activity.status]?.label || activity.status}
                        </div>

                        {/* Severity or Points */}
                        {activity.type === 'report' && (activity as any).severity && (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            (activity as any).severity === 'high'
                              ? 'bg-red-100 text-red-700'
                              : (activity as any).severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            Severity: {(activity as any).severity}
                          </div>
                        )}

                        {/* Points Earned */}
                        <div className="ml-auto font-bold text-[#16A34A]">
                          +{activity.points} pts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-8">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Each activity contributes to your environmental impact
                and helps you earn CleanPoints. Track your progress and work towards higher tiers
                for more rewards!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
