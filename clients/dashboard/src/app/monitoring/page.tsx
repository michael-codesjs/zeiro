export default function MonitoringPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Monitoring</h1>
          <p className="text-slate-600 mb-6">Real-time database monitoring and alerting system.</p>
          <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full">
            <span className="text-sm font-medium text-slate-700">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
} 