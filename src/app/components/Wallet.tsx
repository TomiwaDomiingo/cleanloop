import { useState } from 'react';
import { ArrowLeft, Coins, TrendingUp, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';
import { User, computeTier, pointsToNextTier } from '../types';

interface WalletProps {
  user: User;
  onNavigate: (page: string) => void;
  onUpdateUser: (user: User) => void;
}

const REWARDS = [
  { name: '₦500 Mobile Airtime', points: 1000, emoji: '📱' },
  { name: '₦1,000 Shopping Voucher', points: 2000, emoji: '🛍️' },
  { name: '₦2,000 Fuel Voucher', points: 4000, emoji: '⛽' },
];

export function Wallet({ user, onNavigate, onUpdateUser }: WalletProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const tierInfo = pointsToNextTier(user.points);
  const nairaValue = Math.floor((user.points / 1000) * 500);

  const handleRedeem = async (reward: (typeof REWARDS)[0]) => {
    if (user.points < reward.points) return;
    setRedeeming(reward.name);
    await new Promise((r) => setTimeout(r, 800));

    const dateStr = new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });

    const newTransaction = {
      id: Date.now(),
      type: 'redeemed' as const,
      title: `Redeemed: ${reward.name}`,
      points: -reward.points,
      date: dateStr,
    };

    const newPoints = user.points - reward.points;
    const updatedUser: User = {
      ...user,
      points: newPoints,
      tier: computeTier(newPoints),
      transactions: [newTransaction, ...user.transactions],
    };

    onUpdateUser(updatedUser);
    setRedeeming(null);
    toast.success(`${reward.emoji} ${reward.name} redeemed! Check your phone for delivery details.`);
  };

  const tierBgColor =
    user.tier === 'Gold'
      ? 'from-yellow-400 to-yellow-600'
      : user.tier === 'Silver'
      ? 'from-gray-400 to-gray-600'
      : 'from-orange-400 to-orange-600';

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900">My Wallet</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">CleanPoints Balance</span>
            </div>
            <div className="text-4xl font-black mb-1">{user.points.toLocaleString()}</div>
            <div className="text-sm opacity-90">≈ ₦{nairaValue.toLocaleString()} redeemable value</div>
          </div>

          <div className={`bg-gradient-to-br ${tierBgColor} text-white rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Member Tier</span>
            </div>
            <div className="text-4xl font-black mb-1">{user.tier}</div>
            <div className="text-sm opacity-90">
              {tierInfo.next
                ? `${tierInfo.needed.toLocaleString()} pts to ${tierInfo.next}`
                : '🏆 Maximum tier reached!'}
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        {tierInfo.next && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">{user.tier}</span>
              <span className="font-semibold text-gray-500">{tierInfo.next}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#16A34A] rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    user.tier === 'Bronze'
                      ? (user.points / 1000) * 100
                      : ((user.points - 1000) / (3000 - 1000)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {tierInfo.needed.toLocaleString()} more pts needed
            </p>
          </div>
        )}

        {/* How Points Work */}
        <div className="bg-[#DCFCE7] border border-[#16A34A]/30 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">💡 How CleanPoints Work</h3>
          <div className="space-y-1.5 text-sm text-gray-700">
            <p>• <strong>General / Organic Waste Pickup:</strong> +100 pts per collection</p>
            <p>• <strong>Recyclables Pickup:</strong> +150 pts (plastics, paper, metals)</p>
            <p>• <strong>Verified Dumpsite Report:</strong> +50 pts per approved report</p>
            <p className="pt-2 border-t border-[#16A34A]/20 mt-2">
              💰 <strong>Redemption Rate:</strong> 1,000 pts = ₦500 (50% cash rate)
            </p>
          </div>
        </div>

        {/* Rewards */}
        <div className="mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Redeem Rewards</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {REWARDS.map((reward) => {
              const canRedeem = user.points >= reward.points;
              const isLoading = redeeming === reward.name;
              return (
                <div
                  key={reward.name}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">{reward.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{reward.name}</h3>
                  <div className="text-xs text-gray-500 mb-3">
                    {reward.points.toLocaleString()} points
                  </div>
                  {!canRedeem && (
                    <div className="text-xs text-gray-400 mb-2">
                      Need {(reward.points - user.points).toLocaleString()} more pts
                    </div>
                  )}
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem || isLoading}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                      canRedeem
                        ? 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing…
                      </span>
                    ) : canRedeem ? (
                      'Redeem Now'
                    ) : (
                      'Not Enough Pts'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-4">Transaction History</h2>

          {user.transactions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Coins className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete a pickup or report a dumpsite to earn your first points!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.transactions.map((txn) => {
                const isEarned = txn.type === 'earned';
                return (
                  <div
                    key={txn.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isEarned ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'
                        }`}
                      >
                        {isEarned ? (
                          <ArrowUpRight className="w-5 h-5 text-[#16A34A]" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-[#DC2626]" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{txn.title}</div>
                        <div className="text-xs text-gray-500">{txn.date}</div>
                      </div>
                    </div>
                    <div
                      className={`font-black text-sm ${isEarned ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}
                    >
                      {isEarned ? '+' : ''}{txn.points} pts
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
