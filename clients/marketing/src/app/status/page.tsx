import { TickCircle, Warning2, CloseCircle, Clock, Activity, Monitor, Data, Flash } from 'iconsax-react';

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              System{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Status
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Real-time monitoring of all Zeiro services. Stay informed about performance, 
              incidents, and scheduled maintenance.
            </p>

            {/* Overall Status Card */}
            <div className="inline-flex items-center gap-3 bg-green-600/10 border border-green-600/30 rounded-xl px-6 py-4">
              <TickCircle size={24} color="#4ade80" variant="Outline" />
              <div>
                <span className="text-lg font-semibold text-green-400">All Systems Operational</span>
                <div className="text-sm text-muted-foreground">Last updated: 2 minutes ago</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity size={24} color="#4ade80" variant="Outline" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">99.9%</div>
              <div className="text-muted-foreground mb-1">Uptime</div>
              <div className="text-xs text-green-400">+0.1% from last week</div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock size={24} color="#60a5fa" variant="Outline" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">1.2s</div>
              <div className="text-muted-foreground mb-1">Avg Response Time</div>
              <div className="text-xs text-blue-400">-0.3s from last week</div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TickCircle size={24} color="#c084fc" variant="Outline" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">99.5%</div>
              <div className="text-muted-foreground mb-1">Success Rate</div>
              <div className="text-xs text-purple-400">Stable</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Service Status</h2>
            <p className="text-muted-foreground">Current operational status of all Zeiro services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API Service */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Monitor size={24} color="#60a5fa" variant="Outline" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">API Service</h3>
                    <p className="text-sm text-muted-foreground">Core API endpoints</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TickCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-green-400 font-medium text-sm">Operational</span>
                </div>
              </div>
            </div>

            {/* Database Connections */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <Data size={24} color="#4ade80" variant="Outline" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Database Connections</h3>
                    <p className="text-sm text-muted-foreground">Data source connectivity</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TickCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-green-400 font-medium text-sm">Operational</span>
                </div>
              </div>
            </div>

            {/* Query Engine */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <Activity size={24} color="#c084fc" variant="Outline" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Query Engine</h3>
                    <p className="text-sm text-muted-foreground">Natural language processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TickCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-green-400 font-medium text-sm">Operational</span>
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <Flash size={24} color="#fb923c" variant="Outline" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Integrations</h3>
                    <p className="text-sm text-muted-foreground">Slack, email notifications</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TickCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-green-400 font-medium text-sm">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Health */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">System Health</h2>
            <p className="text-muted-foreground">All systems are running smoothly</p>
          </div>

          <div className="bg-green-600/5 border border-green-600/20 rounded-xl p-8 text-center">
            <TickCircle size={64} color="#4ade80" variant="Outline" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">No Issues Detected</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              All Zeiro services are operating normally. Our monitoring systems show excellent performance across all components.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <TickCircle size={16} color="currentColor" variant="Outline" />
                <span>API Healthy</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <TickCircle size={16} color="currentColor" variant="Outline" />
                <span>Database Connected</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <TickCircle size={16} color="currentColor" variant="Outline" />
                <span>Integrations Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Stay informed</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Subscribe to status updates and get notified about incidents and maintenance windows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-foreground px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}