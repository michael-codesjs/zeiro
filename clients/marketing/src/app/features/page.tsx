import Link from 'next/link';
import Image from 'next/image';
import SupportedDataSources from '@/components/supported-data-sources';
import { 
  ArrowLeft,
  ArrowRight,
  MessageText as Chat,
  Chart,
  Flash as Lightning,
  Data as Database,
  Shield,
  Settings,
  Code,
  Eye,
  People,
  CloudConnection as CloudDownload,
  TrendUp as GraphUp,
  Edit2 as Brush,
  TickCircle as CheckCircle,
  Star
} from 'iconsax-react';

export default function FeaturesPage() {
  return (
    <>

      {/* Hero Section */}
      <section className="pt-32 pb-2 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} color="currentColor" variant="Outline" />
              <span>Back to home</span>
            </Link>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Features that make
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              data simple
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Everything you need to transform complex data into clear insights. 
            Built for teams who want results, not complexity.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="pb-12 px-6 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Natural Language Processing */}
            <div className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Chat size={32} color="white" variant="Outline" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Natural Language Processing</h3>
                  <p className="text-gray-400">Ask questions like you're talking to a colleague</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Convert plain English to complex SQL queries automatically</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Understand context and intent behind your questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Support for multiple languages and dialects</span>
                </div>
              </div>
            </div>

            {/* Smart Visualizations */}
            <div className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Chart size={32} color="white" variant="Outline" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Smart Visualizations</h3>
                  <p className="text-gray-400">Beautiful charts that tell your data's story</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">AI-powered chart recommendations based on your data</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Interactive dashboards with real-time updates</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Export to any format: PNG, PDF, SVG, or embed code</span>
                </div>
              </div>
            </div>

            {/* Lightning Performance */}
            <div className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lightning size={32} color="white" variant="Outline" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Lightning Performance</h3>
                  <p className="text-gray-400">Results in milliseconds, not minutes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Optimized query engine with intelligent caching</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Handle millions of rows without breaking a sweat</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Real-time streaming for live data updates</span>
                </div>
              </div>
            </div>

            {/* Universal Connectivity */}
            <div className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database size={32} color="white" variant="Outline" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Universal Connectivity</h3>
                  <p className="text-gray-400">Connect to any data source, anywhere</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">50+ native connectors for popular databases</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">REST API and webhook support for custom integrations</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Cloud and on-premise deployment options</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SupportedDataSources 
        variant="grid" 
        title="Universal data connectivity"
        subtitle="Connect seamlessly to all your favorite databases and data sources"
        showSearch={true}
        filterType="input"
      />

      {/* Advanced Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Advanced Features</h2>
            <p className="text-xl text-gray-400">For teams that need more power and control</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Enterprise Security */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <Shield size={24} color="white" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Enterprise Security</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Enterprise-grade encryption, SOC 2 compliance, and role-based access controls.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• End-to-end encryption</li>
                <li>• Single sign-on (SSO)</li>
                <li>• Audit logs</li>
              </ul>
            </div>

            {/* API & Integrations */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <Code size={24} color="white" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">API & Integrations</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Powerful APIs and pre-built integrations for seamless workflow integration.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• RESTful API</li>
                <li>• Webhook support</li>
                <li>• SDK libraries</li>
              </ul>
            </div>

            {/* Real-time Monitoring */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <Eye size={24} color="white" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-time Monitoring</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Monitor your data pipelines and get alerts when something needs attention.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Live data streaming</li>
                <li>• Custom alerts</li>
                <li>• Performance metrics</li>
              </ul>
            </div>

            {/* Collaboration Tools */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <People size={24} color="white" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Collaboration Tools</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Share insights, comment on dashboards, and work together seamlessly.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Team workspaces</li>
                <li>• Shared dashboards</li>
                <li>• Comments & annotations</li>
              </ul>
            </div>

            {/* Data Export */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <CloudDownload size={24} color="white" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Export</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Export your data and visualizations in any format you need.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• CSV, JSON, Excel</li>
                <li>• PDF reports</li>
                <li>• Scheduled exports</li>
              </ul>
            </div>

            {/* Custom Themes */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <Brush size={24} color="white" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Custom Themes</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Brand your dashboards with custom colors, fonts, and styling.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Brand customization</li>
                <li>• White-label options</li>
                <li>• Custom CSS</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Trusted by data teams worldwide</h2>
          <p className="text-xl text-gray-400 mb-12">Join thousands of teams already using Zeiro</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-gray-400">Active users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400">Queries processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">5k+</div>
              <div className="text-gray-400">Dashboards created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to experience the future of data analysis?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Start your free trial today and see why teams love Zeiro.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/up" className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-flex items-center gap-2">
              Start free trial
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors px-8 py-4">
              Schedule a demo
            </Link>
          </div>
        </div>
      </section>


    </>
  );
}
