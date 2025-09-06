import Link from 'next/link';
import { Sms, MessageText, Call, Location, Clock, Send2, ArrowRight } from 'iconsax-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Split Layout */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Let's start a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  conversation
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Whether you have questions, need support, or want to explore how Zeiro can transform your data workflow, 
                we're here to help you succeed.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">&lt; 2h</div>
                  <div className="text-sm text-gray-400">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">99%</div>
                  <div className="text-sm text-gray-400">Satisfaction</div>
                </div>
              </div>

              {/* Contact Methods - Horizontal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a href="mailto:support@zeiro.com" className="flex items-center gap-3 p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Sms size={20} color="#60a5fa" variant="Outline" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Email</div>
                    <div className="text-xs text-gray-400">support@zeiro.com</div>
                  </div>
                </a>

                <button className="flex items-center gap-3 p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <MessageText size={20} color="#4ade80" variant="Outline" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Chat</div>
                    <div className="text-xs text-gray-400">Start conversation</div>
                  </div>
                </button>

                <a href="tel:+1-555-ZEIRO-1" className="flex items-center gap-3 p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Call size={20} color="#c084fc" variant="Outline" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Call</div>
                    <div className="text-xs text-gray-400">+1 (555) ZEIRO-1</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Send us a message</h2>
                <p className="text-gray-400">We'll respond within 2 hours during business hours</p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all"
                  placeholder="Work email"
                />

                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all"
                  placeholder="Company"
                />

                <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all">
                  <option value="">How can we help?</option>
                  <option>General Question</option>
                  <option>Technical Support</option>
                  <option>Sales Inquiry</option>
                  <option>Partnership</option>
                  <option>Feature Request</option>
                </select>

                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all resize-none"
                  placeholder="Tell us more about your needs..."
                ></textarea>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 group"
                >
                  Send Message
                  <ArrowRight size={16} color="currentColor" variant="Outline" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Office Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Visit our office</h3>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Location size={16} color="#60a5fa" variant="Outline" />
                </div>
                <div>
                  <div className="font-medium text-white mb-1">San Francisco HQ</div>
                  <div className="text-sm text-gray-400">
                    123 Data Street<br />
                    San Francisco, CA 94105
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock size={16} color="#4ade80" variant="Outline" />
                </div>
                <div>
                  <div className="font-medium text-white mb-1">Business Hours</div>
                  <div className="text-sm text-gray-400">
                    Mon-Fri: 9AM - 6PM PST<br />
                    Sat: 10AM - 4PM PST
                  </div>
                </div>
              </div>
            </div>

            {/* Support Resources */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Self-service</h3>
              <div className="space-y-3">
                <Link href="/help" className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800 rounded-lg hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                  <span className="text-white">Help Center</span>
                  <ArrowRight size={16} color="currentColor" variant="Outline" />
                </Link>
                <Link href="/status" className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800 rounded-lg hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                  <span className="text-white">System Status</span>
                  <ArrowRight size={16} color="currentColor" variant="Outline" />
                </Link>
                <Link href="/pricing" className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800 rounded-lg hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                  <span className="text-white">Pricing</span>
                  <ArrowRight size={16} color="currentColor" variant="Outline" />
                </Link>
              </div>
            </div>

            {/* Enterprise */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Enterprise</h3>
              <div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl">
                <div className="text-white font-medium mb-2">Need enterprise support?</div>
                <div className="text-sm text-gray-400 mb-4">
                  Get dedicated support, custom integrations, and priority assistance.
                </div>
                <Link href="/contact" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                  Contact Sales
                  <ArrowRight size={12} color="currentColor" variant="Outline" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}