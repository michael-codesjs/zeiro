export default function PerformancePage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance</h1>
          <p className="text-slate-600 mb-6">Database performance monitoring and optimization tools.</p>
          <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full">
            <span className="text-sm font-medium text-slate-700">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
} 