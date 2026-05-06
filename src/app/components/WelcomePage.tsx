import { Logo } from './Logo';
import { Footer } from './Footer';
import { Leaf, Recycle, MapPin, Wallet, ArrowRight, Zap, Truck, Shield } from 'lucide-react';
import { loadDemoMode, User } from '../types';

const TRUCK_BG = '/truck-bg.jpg';

interface WelcomePageProps {
  onNavigate: (page: string) => void;
  onDemoLogin?: (user: User) => void;
}

export function WelcomePage({ onNavigate, onDemoLogin }: WelcomePageProps) {
  const handleDemo = () => {
    loadDemoMode((user) => {
      if (onDemoLogin) {
        onDemoLogin(user);
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section with Blurred Truck Background */}
      <section className="relative overflow-hidden">
        {/* Background image - blurred */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${TRUCK_BG})`,
            filter: 'blur(4px) brightness(0.35)',
            transform: 'scale(1.05)',
          }}
        />
        {/* Subtle Lagos color overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-black/20 to-red-900/30" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-in fade-in duration-500">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <Logo size={72} />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-6xl font-black text-white mb-3 tracking-wide animate-in fade-in duration-500">
            CLEANLOOP
          </h1>
          <div className="flex items-center gap-2 mb-6 animate-in fade-in duration-700">
            <span className="h-px w-12 bg-[#16A34A]" />
            <span className="text-[#16A34A] text-sm font-semibold tracking-widest uppercase">
              Lagos Waste Management
            </span>
            <span className="h-px w-12 bg-[#16A34A]" />
          </div>

          <p className="text-lg text-gray-200 max-w-xl mx-auto mb-10 leading-relaxed animate-in fade-in duration-700">
            Schedule pickups, report illegal dumpsites, and earn{' '}
            <span className="text-[#FACC15] font-semibold">CleanPoints</span> rewards — all in one
            app. Building a cleaner Lagos, together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in duration-1000">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-4 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-all shadow-lg flex items-center justify-center gap-2 hover:gap-3"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-white/15 backdrop-blur-sm text-white border-2 border-white/40 rounded-xl font-bold hover:bg-white/25 transition-all"
            >
              Sign In to My Account
            </button>
            <button
              onClick={handleDemo}
              className="w-full sm:w-auto px-8 py-4 bg-[#FACC15] text-gray-900 border-2 border-[#FACC15] rounded-xl font-bold hover:bg-yellow-300 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Try Demo
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4 animate-in fade-in duration-1000">
            Demo loads a sample account with real data — no sign-up required
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-gray-900 py-6">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { num: '12,000+', label: 'Pickups Done', color: 'text-[#16A34A]' },
            { num: '450+', label: 'Verified Drivers', color: 'text-[#FACC15]' },
            { num: '8.5T', label: 'Waste Recycled', color: 'text-[#DC2626]' },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.num}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Everything you need for <span className="text-[#16A34A]">smarter</span> waste
              management
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              CLEANLOOP makes it easy to dispose of waste responsibly while earning real rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Recycle,
                title: 'Easy Pickups',
                desc: 'Schedule waste collection at your convenience — same day or advance booking.',
                color: 'bg-green-50 text-[#16A34A]',
                border: 'border-green-100',
              },
              {
                icon: MapPin,
                title: 'Live Tracking',
                desc: 'Real-time OSM map tracking of your pickup driver from assignment to arrival.',
                color: 'bg-red-50 text-[#DC2626]',
                border: 'border-red-100',
              },
              {
                icon: Leaf,
                title: 'Report Dumpsites',
                desc: 'Help clean up Lagos by pinpointing illegal waste dumps on the map.',
                color: 'bg-yellow-50 text-[#FACC15]',
                border: 'border-yellow-100',
              },
              {
                icon: Wallet,
                title: 'Earn Rewards',
                desc: 'Collect CleanPoints for every action and redeem for cash, airtime & more.',
                color: 'bg-green-50 text-[#16A34A]',
                border: 'border-green-100',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`bg-white border ${feature.border} rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 duration-300`}
              >
                <div
                  className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Points Work */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            Earn Real <span className="text-[#FACC15]">₦ Naira</span> for recycling
          </h2>
          <p className="text-gray-600 mb-10">
            Our CleanPoints system is backed by real recycling economics. Every kilogram of waste
            responsibly disposed earns you points you can spend.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              { emoji: '♻️', action: 'Recyclables Pickup', pts: '+150 pts', note: 'Plastics, paper, metals' },
              { emoji: '🗑️', action: 'General/Organic Waste', pts: '+100 pts', note: 'Regular household waste' },
              { emoji: '🚨', action: 'Report a Dumpsite', pts: '+50 pts', note: 'After verification by team' },
              { emoji: '💰', action: 'Redemption Rate', pts: '1,000 pts = ₦500', note: 'Airtime, vouchers & more' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-gray-200 flex items-start gap-4"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{item.action}</div>
                  <div className="text-[#16A34A] font-semibold text-sm">{item.pts}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-[#16A34A]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">
            Ready to make Lagos cleaner?
          </h2>
          <p className="text-green-100 mb-8">
            Join thousands of Lagosians already earning rewards while cleaning up their communities.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="px-10 py-4 bg-white text-[#16A34A] rounded-xl font-black hover:bg-gray-50 transition-colors shadow-lg text-lg"
          >
            Create Free Account →
          </button>
          <p className="text-green-200 text-sm mt-4">
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="underline font-semibold hover:text-white transition-colors"
            >
              Sign in here
            </button>
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleDemo}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors"
            >
              <Zap className="w-4 h-4" /> Try Demo
            </button>
          </div>
        </div>
      </section>

      {/* Portal Links (Driver & Admin) */}
      {/*<section className="py-8 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500 text-xs text-center mb-4 uppercase tracking-wider font-semibold">
            Other Portals
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('driver-portal')}
              className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-[#16A34A] hover:bg-gray-750 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-[#16A34A] rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm group-hover:text-[#16A34A] transition-colors">
                  Driver Portal
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  For CLEANLOOP pickup drivers
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('admin-portal')}
              className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-[#DC2626] hover:bg-gray-750 transition-all group text-left"
            >
              <div className="w-10 h-10 bg-[#DC2626] rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm group-hover:text-[#DC2626] transition-colors">
                  Admin Dashboard
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Operations management & analytics
                </p>
              </div>
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-800 rounded-xl border border-gray-700 text-xs text-gray-500 text-center">
            Driver login: <code className="text-gray-300">driver1@cleanloop.ng</code> / <code className="text-gray-300">driver123</code>
            &nbsp;·&nbsp;
            Admin login: <code className="text-gray-300">admin@cleanloop.ng</code> / <code className="text-gray-300">Admin@123</code>
          </div>
        </div>
      </section>*/}
      <Footer />
    </div>
  );
}
