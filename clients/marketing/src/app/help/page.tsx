import Link from 'next/link';
import { SearchNormal1, Book1, MessageText, VideoPlay, DocumentText, People, Flash, ShieldSecurity } from 'iconsax-react';

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How can we{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                help you?
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Find answers, get support, and learn how to make the most of Zeiro's powerful 
              data analysis platform.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <SearchNormal1 size={20} color="#9ca3af" variant="Outline" className="absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, or guides..."
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-900 transition-all"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/contact" className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageText size={24} color="#60a5fa" variant="Outline" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
                <p className="text-gray-400 text-sm">Get personalized help from our team</p>
              </Link>

              <Link href="/status" className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Flash size={24} color="#4ade80" variant="Outline" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">System Status</h3>
                <p className="text-gray-400 text-sm">Check service availability</p>
              </Link>

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-900/50 hover:border-gray-700 transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <VideoPlay size={24} color="#c084fc" variant="Outline" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Video Tutorials</h3>
                <p className="text-gray-400 text-sm">Watch step-by-step guides</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Browse by category</h2>
            <p className="text-gray-400">Find the help you need organized by topic</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Getting Started */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Book1 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Getting Started</h3>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Quick start guide
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Setting up your first connection
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Understanding the dashboard
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Your first query
                </li>
              </ul>
            </div>

            {/* Data Sources */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <DocumentText size={24} color="#4ade80" variant="Outline" />
                </div>
                <h3 className="text-xl font-semibold text-white">Data Sources</h3>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Connecting to databases
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  API integrations
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  File uploads
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Troubleshooting connections
                </li>
              </ul>
            </div>

            {/* Queries & Analysis */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <SearchNormal1 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Queries & Analysis</h3>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Natural language queries
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Advanced filtering
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Creating visualizations
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Saving and sharing results
                </li>
              </ul>
            </div>

            {/* Integrations */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <Flash size={24} color="#fb923c" variant="Outline" />
                </div>
                <h3 className="text-xl font-semibold text-white">Integrations</h3>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Setting up Slack notifications
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Email report automation
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Webhook configurations
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Third-party app connections
                </li>
              </ul>
            </div>

            {/* Account & Billing */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                  <People size={24} color="#facc15" variant="Outline" />
                </div>
                <h3 className="text-xl font-semibold text-white">Account & Billing</h3>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  Managing your account
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  Billing and subscriptions
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  Team management
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  Usage and limits
                </li>
              </ul>
            </div>

            {/* Security & Privacy */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                  <ShieldSecurity size={24} color="#f87171" variant="Outline" />
                </div>
                <h3 className="text-xl font-semibold text-white">Security & Privacy</h3>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  Data security practices
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  Privacy policy
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  Compliance certifications
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  Access controls
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Popular articles</h2>
            <p className="text-gray-400">The most helpful resources from our community</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    How to connect your first database in under 5 minutes
                  </h3>
                  <p className="text-gray-400 text-sm">Step-by-step guide to connecting PostgreSQL, MySQL, and other popular databases</p>
                </div>
                <div className="text-xs text-gray-500 ml-4">5 min read</div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    Writing effective natural language queries
                  </h3>
                  <p className="text-gray-400 text-sm">Tips and best practices for getting the most accurate results from your queries</p>
                </div>
                <div className="text-xs text-gray-500 ml-4">8 min read</div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    Setting up automated Slack notifications
                  </h3>
                  <p className="text-gray-400 text-sm">Configure alerts and reports to be sent directly to your team's Slack channels</p>
                </div>
                <div className="text-xs text-gray-500 ml-4">6 min read</div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/50 hover:border-gray-700 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    Understanding Zeiro's security and privacy features
                  </h3>
                  <p className="text-gray-400 text-sm">Learn about our enterprise-grade security measures and data protection policies</p>
                </div>
                <div className="text-xs text-gray-500 ml-4">12 min read</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium">
                Contact Support
              </Link>
              <button className="border border-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}