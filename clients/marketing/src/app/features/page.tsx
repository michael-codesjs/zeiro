'use client';

import Link from 'next/link';
import Image from 'next/image';
import SupportedDataSources from '@/components/supported-data-sources';
import FloatingElements from '@/components/floating-elements';
import { motion } from 'framer-motion';
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
    <div>
      {/* Hero Section */}
      <section className="pt-32 pb-2 px-6 relative overflow-hidden">
        <FloatingElements variant="default" colors={['blue', 'purple', 'emerald', 'amber']} />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} color="currentColor" variant="Outline" />
              <span>Back to home</span>
            </Link>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Features that make
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              data simple
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to transform complex data into clear insights. 
            Built for teams who want results, not complexity.
          </motion.p>
        </div>
      </section>

      {/* Core Features */}
      <section className="pb-12 px-6 -mt-10 relative">
        <FloatingElements variant="sparse" colors={['indigo', 'rose', 'teal']} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16">
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Natural Language Processing */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* Smart Visualizations */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* Lightning Performance */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* Universal Connectivity */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-10 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      <SupportedDataSources 
        variant="grid" 
        title="Universal data connectivity"
        subtitle="Connect seamlessly to all your favorite databases and data sources"
        showSearch={true}
      />

      {/* Advanced Features */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="minimal" colors={['cyan', 'violet']} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Advanced Features</h2>
            <p className="text-xl text-gray-400">For teams that need more power and control</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Enterprise Security */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* API & Integrations */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* Real-time Monitoring */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* Collaboration Tools */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* Data Export */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>

            {/* Custom Themes */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="minimal" colors={['emerald', 'amber']} />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by data teams worldwide</h2>
            <p className="text-xl text-gray-400 mb-12">Join thousands of teams already using Zeiro</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-gray-400">Active users</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400">Queries processed</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">5k+</div>
              <div className="text-gray-400">Dashboards created</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="sparse" colors={['blue', 'purple', 'pink']} />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to experience the future of data analysis?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-400 mb-10"
          >
            Start your free trial today and see why teams love Zeiro.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/up" className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 font-semibold inline-flex items-center gap-2">
              Start free trial
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300 px-8 py-4">
              Schedule a demo
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
