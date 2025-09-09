'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  TickCircle as Check,
  Star,
  Shield,
  Flash as Lightning,
  Data as Database,
  Link as ExternalLink,
  MessageText as Chat,
  Clock,
  People,
  Setting,
  Code,
  DocumentText,
  Eye,
  Lock,
  Refresh,
  Export,
  Send
} from 'iconsax-react';
import { getIntegration } from '@/data/integrations';
import { notFound } from 'next/navigation';

export default function IntegrationPage() {
  const params = useParams();
  const slug = params.slug as string;
  const integration = getIntegration(slug);

  if (!integration) {
    notFound();
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < count ? "#ffffff" : "#374151"}
        variant={i < count ? "Bold" : "Outline"}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <div className="pt-20 pb-6 px-6 border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <Link href="/integrations" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={14} color="currentColor" variant="Outline" />
            <span>Back to integrations</span>
          </Link>
        </div>
      </div>

      {/* Hero Card */}
      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-800/20 rounded-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_50%)] rounded-3xl"></div>
            
            <div className="relative bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Logo & Info */}
                <div className="lg:col-span-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gray-800/50 border border-gray-700/50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Image
                        src={integration.logo}
                        alt={integration.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">{integration.name}</h1>
                        <div className="flex items-center gap-1">
                          {renderStars(integration.popularity)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 text-gray-300 text-xs rounded-full">
                          {integration.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 text-gray-300 text-xs rounded-full">
                          {integration.pricing}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-base leading-relaxed mb-6">
                        {integration.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          href="/auth/up"
                          className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium inline-flex items-center gap-2 justify-center"
                        >
                          Connect Now
                          <ArrowRight size={14} color="currentColor" variant="Outline" />
                        </Link>
                        <Link
                          href={integration.documentation}
                          target="_blank"
                          className="border border-gray-700/50 text-white px-6 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 font-medium inline-flex items-center gap-2 justify-center"
                        >
                          <DocumentText size={14} color="currentColor" variant="Outline" />
                          Documentation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Stats */}
                <div className="lg:col-span-4">
                  <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-4">Export Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock size={14} color="#9ca3af" variant="Outline" />
                          <span className="text-sm text-gray-400">Setup Time</span>
                        </div>
                        <span className="text-sm font-medium text-white">1 minute</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Export size={14} color="#9ca3af" variant="Outline" />
                          <span className="text-sm text-gray-400">Export Type</span>
                        </div>
                        <span className="text-sm font-medium text-white">{integration.exportType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Refresh size={14} color="#9ca3af" variant="Outline" />
                          <span className="text-sm text-gray-400">Frequency</span>
                        </div>
                        <span className="text-sm font-medium text-white">{integration.frequency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Export Process */}
            <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Export Process</h2>
              <div className="space-y-4">
                {integration.exportSteps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-black font-bold text-xs">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1">{step.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Live Demo */}
            <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-sm font-medium text-white">Export Preview</h2>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Send size={10} color="black" variant="Bold" />
                  </div>
                  <span className="text-white text-xs font-medium">Zeiro Export</span>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-white text-xs">Exporting Q1 sales report to {integration.name}</p>
                </div>
                
                <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-3">
                  <p className="text-gray-300 text-xs mb-2">Export successful:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Records exported</span>
                      <span className="text-white">1,247</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Format</span>
                      <span className="text-white">{integration.format}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Status</span>
                      <span className="text-green-400">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 border border-gray-700/50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to export to {integration.name}?
            </h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Start sending your Zeiro insights to {integration.name} automatically in under 1 minute.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/auth/up"
                className="bg-white text-black px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold inline-flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight size={14} color="currentColor" variant="Outline" />
              </Link>
              <Link
                href="/integrations"
                className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
              >
                <Eye size={14} color="currentColor" variant="Outline" />
                View all integrations
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Check size={12} color="currentColor" variant="Outline" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={12} color="currentColor" variant="Outline" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
