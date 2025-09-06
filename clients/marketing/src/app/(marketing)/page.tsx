import Link from 'next/link';
import Image from 'next/image';
import SupportedDataSources from '@/components/supported-data-sources';
import { 
  ArrowRight,
  Play,
  TickCircle as Check,
  Data as Database,
  MessageText as Chat,
  Flash as Lightning,
  Chart,
  Star,
  Shield,
  Setting2 as Settings,
  Link as ExternalLink
} from 'iconsax-react';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300 mb-8 border border-gray-700">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Now in public beta</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Make Data As
              <br/>
              Simple As Zero
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your data into insights with natural language queries. No SQL required, no complex setup, just pure intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth/up" className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
              Start for free
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-gray-400 text-sm">Active users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400 text-sm">Queries processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">5k+</div>
              <div className="text-gray-400 text-sm">Dashboards Hosted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to analyze data</h2>
            <p className="text-xl text-gray-400">Powerful features designed for modern data teams</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-600/30 rounded-lg flex items-center justify-center mb-6">
                <Chat size={24} color="#60a5fa" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Natural Language Queries</h3>
              <p className="text-gray-400 leading-relaxed">
                Ask questions in plain English and get instant insights. No SQL knowledge required.
              </p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-600/20 border border-purple-600/30 rounded-lg flex items-center justify-center mb-6">
                <Chart size={24} color="#c084fc" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Visualizations</h3>
              <p className="text-gray-400 leading-relaxed">
                Automatically generate beautiful charts and dashboards that tell your data's story.
              </p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-green-600/20 border border-green-600/30 rounded-lg flex items-center justify-center mb-6">
                <Lightning size={24} color="#4ade80" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Get results in milliseconds with our optimized query engine and intelligent caching.
              </p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-600/20 border border-yellow-600/30 rounded-lg flex items-center justify-center mb-6">
                <Database size={24} color="#facc15" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Universal Connectivity</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect to any database, API, or data source. We support 50+ integrations out of the box.
              </p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-center mb-6">
                <Shield size={24} color="#f87171" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Enterprise Security</h3>
              <p className="text-gray-400 leading-relaxed">
                Bank-level encryption, SOC 2 compliance, and role-based access controls keep your data safe.
              </p>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-600/30 rounded-lg flex items-center justify-center mb-6">
                <Settings size={24} color="#818cf8" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy Setup</h3>
              <p className="text-gray-400 leading-relaxed">
                Get started in minutes, not weeks. Our intuitive interface makes data analysis accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SupportedDataSources 
        variant="scroll" 
        title="Connect to any data source"
        subtitle="From databases to spreadsheets, we support all your favorite data sources"
        filterType="input"
      />

      {/* Social Proof Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by data teams worldwide</h2>
            <p className="text-xl text-gray-400">See what our customers are saying</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "Zeiro transformed how our team approaches data analysis. What used to take hours now takes minutes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JS</span>
                </div>
                <div>
                  <div className="text-white font-medium">Jane Smith</div>
                  <div className="text-gray-400 text-sm">Data Analyst, TechCorp</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "The natural language queries are game-changing. Our non-technical team members can now explore data independently."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">MJ</span>
                </div>
                <div>
                  <div className="text-white font-medium">Mike Johnson</div>
                  <div className="text-gray-400 text-sm">Product Manager, StartupXYZ</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "Incredible performance and ease of use. Zeiro has become an essential tool for our data-driven decisions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SL</span>
                </div>
                <div>
                  <div className="text-white font-medium">Sarah Lee</div>
                  <div className="text-gray-400 text-sm">CTO, DataCorp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to transform your data workflow?
            </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of teams who've already made the switch to intelligent data analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/auth/up" className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Start free trial
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors px-8 py-4 inline-flex items-center gap-2">
              Talk to sales
              <ExternalLink size={16} color="currentColor" variant="Outline" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check size={16} color="currentColor" variant="Outline" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} color="currentColor" variant="Outline" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
