import { Recycle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Recycle className="w-6 h-6 text-[#16A34A]" />
              <span className="text-xl font-bold tracking-wide">CLEANLOOP</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Lagos's leading waste management platform. Together, we're building a cleaner, greener city for all Lagosians.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span className="hover:text-[#16A34A] cursor-pointer transition-colors">About Us</span></li>
              <li><span className="hover:text-[#16A34A] cursor-pointer transition-colors">How It Works</span></li>
              <li><span className="hover:text-[#16A34A] cursor-pointer transition-colors">For Businesses</span></li>
              <li><span className="hover:text-[#16A34A] cursor-pointer transition-colors">Become a Driver</span></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Contact & Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 <span className="hover:text-[#16A34A] cursor-pointer transition-colors">hello@cleanloop.ng</span></li>
              <li>📞 <span className="hover:text-[#16A34A] cursor-pointer transition-colors">+234 800 CLEAN NG</span></li>
              <li><span className="hover:text-[#16A34A] cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-[#16A34A] cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} CLEANLOOP. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Made with</span>
            <span className="text-[#16A34A]">♻️</span>
            <span>for a cleaner Lagos</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#DC2626] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#FACC15] inline-block"></span>
            <span className="ml-1">Lagos State Colors</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
