export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-600">HomeHelp</h1>
          <nav className="flex gap-6 text-sm text-gray-600">
            <a href="#modes" className="hover:text-emerald-600">Services</a>
            <a href="#waitlist" className="hover:text-emerald-600">Join Waitlist</a>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Home services & drivers —<br />whenever you need them
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Book verified home help for cleaning, cooking, and chores, or hire a
          driver for your own car. Instant or scheduled, hourly billing, no
          subscription required.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="#waitlist"
            className="bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700"
          >
            Join the Waitlist
          </a>
          <a
            href="#modes"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium hover:border-gray-400"
          >
            Learn More
          </a>
        </div>
      </section>

      <section id="modes" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Two modes, one app</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="text-3xl mb-4">🧹</div>
              <h4 className="text-xl font-semibold mb-2">Home Help</h4>
              <p className="text-gray-600 mb-4">
                Background-verified domestic workers for cleaning, kitchen work,
                laundry, ironing, and more. Instant ~10 min arrival or schedule
                ahead.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ 1–4 hour sessions</li>
                <li>✓ Hourly billing</li>
                <li>✓ Female verified workers</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="text-3xl mb-4">🚗</div>
              <h4 className="text-xl font-semibold mb-2">Driver Mode</h4>
              <p className="text-gray-600 mb-4">
                A verified driver for <em>your own car</em>. Daily commute,
                airport runs, outstation trips, late nights, senior errands.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ 4-hour minimum for outstation</li>
                <li>✓ Aadhaar + license verified</li>
                <li>✓ Instant or scheduled</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Get early access</h3>
          <p className="text-gray-600 mb-8">
            We are launching soon. Join the waitlist and be the first to know.
          </p>
          <form
            className="flex gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700 text-sm"
            >
              Notify me
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
      </footer>
    </div>
  );
}
