export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/40 backdrop-blur-md mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Moon Glow Craft</h3>
            <p className="text-gray-400">Handcrafted masterpieces designed to illuminate your world. Locally made with love in India.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-yellow-400 transition-colors">Shop All</a></li>
              <li><a href="/dashboard" className="hover:text-yellow-400 transition-colors">Track Your Order</a></li>
              <li><a href="/dashboard" className="hover:text-yellow-400 transition-colors">Customer Account</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <p className="text-gray-400">support@moonglowcraft.in</p>
            <p className="text-gray-400 mt-2">Available Mon-Fri, 9am - 6pm IST</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Moon Glow Craft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
