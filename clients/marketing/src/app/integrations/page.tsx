import Link from 'next/link';
import SupportedExports from '@/components/supported-exports';
import { 
  ArrowLeft,
  ArrowRight,
  TickCircle as Check,
  Code,
  CloudConnection as CloudDownload,
  Setting2 as Settings
} from 'iconsax-react';

export default function IntegrationsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} color="currentColor" variant="Outline" />
              <span>Back to home</span>
            </Link>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Connect to everything
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Send your data insights to the tools your team already uses. From Slack notifications 
            to automated reports, Zeiro integrates with your entire workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/up" className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Start connecting
            </Link>
            <Link href="/features" className="text-gray-300 hover:text-white transition-colors px-8 py-4 inline-flex items-center gap-2">
              View all features
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Output Integrations Only */}
      <SupportedExports 
        variant="grid" 
        title="Send insights everywhere"
        subtitle="Push reports, alerts, and data to your favorite tools and platforms"
        showSearch={true}
      />

      {/* Integration Types */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Send insights everywhere</h2>
            <p className="text-xl text-gray-400">Push your data analysis results to the tools your team already uses</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-green-600/20 border border-green-600/30 rounded-lg flex items-center justify-center mb-6">
                <CloudDownload size={24} color="#4ade80" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Communication Tools</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Send reports and alerts to Slack, Teams, Gmail, and more. Keep your team informed automatically.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Automated notifications</li>
                <li>• Scheduled reports</li>
                <li>• Custom formatting</li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-600/20 border border-purple-600/30 rounded-lg flex items-center justify-center mb-6">
                <Settings size={24} color="#c084fc" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Automation & Storage</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Export to cloud storage, trigger workflows with Zapier, or send data via webhooks.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Cloud storage export</li>
                <li>• Workflow automation</li>
                <li>• Custom webhooks</li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-600/30 rounded-lg flex items-center justify-center mb-6">
                <Code size={24} color="#60a5fa" variant="Outline" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Productivity Platforms</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Export insights to Notion, Airtable, Google Sheets, and other productivity tools.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Live data exports</li>
                <li>• Collaborative sharing</li>
                <li>• Custom formatting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why teams choose Zeiro</h2>
            <p className="text-xl text-gray-400">Enterprise-grade connectivity with developer-friendly simplicity</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check size={16} color="white" variant="Outline" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure by default</h3>
                <p className="text-gray-400">All connections use encrypted channels with support for VPNs, SSH tunnels, and IP whitelisting.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check size={16} color="white" variant="Outline" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Lightning fast</h3>
                <p className="text-gray-400">Optimized queries and intelligent caching ensure your data loads in milliseconds, not minutes.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check size={16} color="white" variant="Outline" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No maintenance</h3>
                <p className="text-gray-400">We handle updates, monitoring, and scaling so you can focus on insights, not infrastructure.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check size={16} color="white" variant="Outline" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Team collaboration</h3>
                <p className="text-gray-400">Share connections, queries, and dashboards with your team while maintaining proper access controls.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to connect your data?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Start your free trial and connect to your first data source in under 5 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/up" className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-flex items-center gap-2">
              Start free trial
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors px-8 py-4">
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
