export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">HomeHelp Admin</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Active Bookings</p>
            <p className="text-3xl font-bold mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Available Workers</p>
            <p className="text-3xl font-bold mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Revenue (Today)</p>
            <p className="text-3xl font-bold mt-1">₹0</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <p className="text-gray-500 text-sm">No bookings yet.</p>
        </div>
      </main>
    </div>
  );
}
