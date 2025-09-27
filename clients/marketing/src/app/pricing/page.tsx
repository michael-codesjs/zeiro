'use client';

import Link from 'next/link';
import FloatingElements from '@/components/floating-elements';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  TickCircle as Check,
  CloseCircle as X,
  Star,
  Flash as Lightning,
  Shield,
  People,
  Unlimited as Infinity
} from 'iconsax-react';

export default function PricingPage() {
  return (
    <>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <FloatingElements variant="default" colors={['blue', 'green', 'purple', 'orange']} />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
            Simple pricing for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
              every team
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Start free and scale as you grow. No hidden fees, no surprises.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-4 py-2"
          >
            <Lightning size={16} color="#facc15" variant="Outline" />
            <span>14-day free trial • No credit card required</span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6 relative">
        <FloatingElements variant="sparse" colors={['emerald', 'blue', 'violet']} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Starter Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-card border border-border rounded-2xl p-8 hover:bg-accent/50 hover:border-border transition-all duration-300"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                <p className="text-muted-foreground mb-6">Perfect for individuals and small teams getting started</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Forever free</p>
              </div>
              
              <Link href="/auth/up" className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary-hover transition-colors font-medium text-center block mb-8">
                Get started free
              </Link>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Up to 3 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">5 data sources</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">10 dashboards</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Basic visualizations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Email support</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Custom integrations</span>
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
              className="bg-card border-2 border-primary/30 rounded-2xl p-8 hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 relative shadow-sm"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star size={12} color="currentColor" variant="Outline" />
                  Most Popular
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                <p className="text-muted-foreground mb-6">For growing teams that need more power and flexibility</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Per user, billed monthly</p>
              </div>
              
              <Link href="/auth/up" className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-medium text-center block mb-8">
                Start free trial
              </Link>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Up to 25 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Unlimited data sources</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Unlimited dashboards</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Advanced visualizations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">API access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Custom themes</span>
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
              className="bg-card border border-border rounded-2xl p-8 hover:bg-accent/50 hover:border-border transition-all duration-300"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Ultra</h3>
                <p className="text-muted-foreground mb-6">For power users who need maximum performance and advanced features</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Per user, billed monthly</p>
              </div>
              
              <Link href="/auth/up" className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary-hover transition-colors font-medium text-center block mb-8">
                Start free trial
              </Link>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Up to 100 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Everything in Pro</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Advanced AI insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">White-label options</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Premium support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Advanced security features</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Custom dashboard themes</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Priority feature requests</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Custom Plans */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Need a custom plan?</h2>
            <p className="text-xl text-muted-foreground">Enterprise solutions tailored to your organization's needs</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Enterprise Plan</h3>
                <p className="text-muted-foreground mb-6">Custom pricing based on your needs</p>
                <div className="text-4xl font-bold text-foreground mb-2">Let's talk</div>
                <p className="text-sm text-muted-foreground">Volume discounts available</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Everything in Ultra plan</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Unlimited team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">SSO & SAML integration</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">On-premise deployment</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Custom integrations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">Dedicated customer success</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={20} color="#22c55e" variant="Outline" />
                  <span className="text-muted-foreground">99.9% SLA guarantee</span>
                </div>
              </div>
              
              <Link href="#" className="w-full bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center block">
                Contact enterprise sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="minimal" colors={['teal', 'orange']} />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Frequently asked questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about our pricing</p>
          </motion.div>
          
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3">Can I change plans anytime?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3">What happens after my free trial?</h3>
              <p className="text-muted-foreground leading-relaxed">
                After your 14-day free trial, you can choose to continue with a paid plan or downgrade to our free Starter plan. No credit card required for the trial.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3">Do you offer discounts for annual billing?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes, we offer a 20% discount when you pay annually. Contact our sales team for more information about annual plans.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3">Is my data secure?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Absolutely. We use enterprise-grade encryption, SOC 2 compliance, and follow industry best practices to keep your data secure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <FloatingElements variant="sparse" colors={['blue', 'green', 'purple']} />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-foreground mb-6"
          >
            Ready to get started?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground mb-10"
          >
            Join thousands of teams already using Zeiro to make data simple.
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
            <Link href="#" className="text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-300 px-8 py-4">
              Contact sales
            </Link>
          </motion.div>
        </div>
      </section>

    </>
  );
}
