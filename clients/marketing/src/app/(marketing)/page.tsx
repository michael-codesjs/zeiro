'use client';

import Link from 'next/link';
import Image from 'next/image';
import SupportedDataSources from '@/components/supported-data-sources';
import SupportedExports from '@/components/supported-exports';
import FloatingElements from '@/components/floating-elements';
import { motion } from 'framer-motion';
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
import { buttonVariants } from '@/components/Button';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
        
        <FloatingElements variant="default" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300 mb-8 border border-gray-700"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Now in public beta</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Make Data As
              <br/>
              Simple As Zero
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your data into insights with natural language queries. No SQL required, no complex setup, just pure intelligence.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/auth/up" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Start for free
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-gray-400 text-sm">Active users</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400 text-sm">Queries processed</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">5k+</div>
              <div className="text-gray-400 text-sm">Dashboards Hosted</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <FloatingElements variant="sparse" colors={['indigo', 'pink', 'teal']} />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to analyze data</h2>
            <p className="text-xl text-gray-400">Powerful features designed for modern data teams</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 bg-blue-600/20 border border-blue-600/30 rounded-lg flex items-center justify-center mb-6"
              >
                <Chat size={24} color="#60a5fa" variant="Outline" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Natural Language Queries</h3>
              <p className="text-gray-400 leading-relaxed">
                Ask questions in plain English and get instant insights. No SQL knowledge required.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 bg-purple-600/20 border border-purple-600/30 rounded-lg flex items-center justify-center mb-6"
              >
                <Chart size={24} color="#c084fc" variant="Outline" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Visualizations</h3>
              <p className="text-gray-400 leading-relaxed">
                Automatically generate beautiful charts and dashboards that tell your data's story.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 bg-green-600/20 border border-green-600/30 rounded-lg flex items-center justify-center mb-6"
              >
                <Lightning size={24} color="#4ade80" variant="Outline" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Get results in milliseconds with our optimized query engine and intelligent caching.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 bg-yellow-600/20 border border-yellow-600/30 rounded-lg flex items-center justify-center mb-6"
              >
                <Database size={24} color="#facc15" variant="Outline" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Universal Connectivity</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect to any database, API, or data source. We support 50+ integrations out of the box.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-center mb-6"
              >
                <Shield size={24} color="#f87171" variant="Outline" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Enterprise Security</h3>
              <p className="text-gray-400 leading-relaxed">
                Bank-level encryption, SOC 2 compliance, and role-based access controls keep your data safe.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 bg-indigo-600/20 border border-indigo-600/30 rounded-lg flex items-center justify-center mb-6"
              >
                <Settings size={24} color="#818cf8" variant="Outline" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy Setup</h3>
              <p className="text-gray-400 leading-relaxed">
                Get started in minutes, not weeks. Our intuitive interface makes data analysis accessible to everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <SupportedDataSources 
        variant="marquee" 
        title="Connect to any data source"
        subtitle="From databases to spreadsheets, we support all your favorite data sources"
      />

      {/* Integrations Section */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="minimal" colors={['cyan', 'orange']} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center "
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Export insights everywhere
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Connect your data sources, analyze with AI, then seamlessly export your insights to the tools your team already uses.
            </p>
          </motion.div>


          {/* Integration Options */}
          <SupportedExports 
            variant="marquee" 
            title=""
            subtitle=""
            showSearch={false}
          />

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">
              Need a custom integration? We support webhooks and have a powerful API.
            </p>
            <Link 
              href="/integrations" 
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View all integrations
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-6 relative">
        {/* Floating Background Objects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute bottom-32 left-1/4 w-20 h-20 bg-green-500/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              x: [0, -15, 0]
            }}
            transition={{ 
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 right-1/3 w-12 h-12 bg-yellow-500/10 rounded-full blur-xl"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by data teams worldwide</h2>
            <p className="text-xl text-gray-400">See what our customers are saying</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/70 hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "Zeiro transformed how our team approaches data analysis. What used to take hours now takes minutes."
              </p>
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-semibold text-sm">JS</span>
                </motion.div>
                <div>
                  <div className="text-white font-medium">Jane Smith</div>
                  <div className="text-gray-400 text-sm">Data Analyst, TechCorp</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/70 hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "The natural language queries are game-changing. Our non-technical team members can now explore data independently."
              </p>
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-semibold text-sm">MJ</span>
                </motion.div>
                <div>
                  <div className="text-white font-medium">Mike Johnson</div>
                  <div className="text-gray-400 text-sm">Product Manager, StartupXYZ</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:bg-gray-900/70 hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "Incredible performance and ease of use. Zeiro has become an essential tool for our data-driven decisions."
              </p>
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-semibold text-sm">SL</span>
                </motion.div>
                <div>
                  <div className="text-white font-medium">Sarah Lee</div>
                  <div className="text-gray-400 text-sm">CTO, DataCorp</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="sparse" colors={['emerald', 'blue', 'violet']} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple pricing for every team</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">Start free and scale as you grow. No hidden fees, no surprises.</p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-900/50 border border-gray-800 rounded-full px-4 py-2"
            >
              <Lightning size={16} color="#facc15" variant="Outline" />
              <span>14-day free trial • No credit card required</span>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Starter Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-gray-400 mb-6">Perfect for individuals and small teams getting started</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Forever free</p>
              </div>
              
              <Link href="/auth/up" className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center block mb-8">
                Get started free
              </Link>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Up to 3 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">5 data sources</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">10 dashboards</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Basic visualizations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Email support</span>
                </div>
              </div>
            </motion.div>

            {/* Pro Plan - Most Popular */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border-2 border-white/20 rounded-2xl p-8 hover:bg-gray-900/80 hover:border-white/30 transition-all duration-300 relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star size={12} color="currentColor" variant="Outline" />
                  Most Popular
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-gray-400 mb-6">For growing teams that need more power and flexibility</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Per user, billed monthly</p>
              </div>
              
              <Link href="/auth/up" className="w-full bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center block mb-8">
                Start free trial
              </Link>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Up to 25 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Unlimited data sources</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Unlimited dashboards</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Advanced visualizations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">API access</span>
                </div>
              </div>
            </motion.div>

            {/* Ultra Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:bg-gray-900/80 hover:border-gray-700 transition-all duration-300"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Ultra</h3>
                <p className="text-gray-400 mb-6">For power users who need maximum performance and advanced features</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">$99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Per user, billed monthly</p>
              </div>
              
              <Link href="/auth/up" className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center block mb-8">
                Start free trial
              </Link>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Up to 100 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Everything in Pro</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Advanced AI insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">White-label options</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Premium support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#4ade80" variant="Outline" />
                  <span className="text-gray-300">Advanced security features</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-400 mb-4">
              Need a custom enterprise plan with unlimited team members and on-premise deployment?
            </p>
            <Link 
              href="/pricing" 
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View enterprise options
              <ArrowRight size={16} color="currentColor" variant="Outline" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="sparse" colors={['violet', 'emerald', 'rose']} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-white mb-6"
          >
            Ready to transform your data workflow?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of teams who've already made the switch to intelligent data analysis.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <Link href="/auth/up" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Start free trial
            </Link>
            <Link href="#" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              Talk to sales
              <ExternalLink size={16} color="currentColor" variant="Outline" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-8 text-sm text-gray-500"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Check size={16} color="currentColor" variant="Outline" />
              <span>Free 14-day trial</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Check size={16} color="currentColor" variant="Outline" />
              <span>No credit card required</span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
