'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BsSearch as Search } from 'react-icons/bs';
import Marquee from 'react-fast-marquee';

interface ExportIntegration {
  name: string;
  image: string;
  category: 'communication' | 'productivity' | 'automation' | 'storage';
}

const exportIntegrations: ExportIntegration[] = [
  { name: 'Microsoft Excel', image: '/images/integrations/excel.png', category: 'productivity' },
  { name: 'Gmail', image: '/images/integrations/gmail.png', category: 'communication' },
  { name: 'HubSpot', image: '/images/integrations/hubspot.png', category: 'productivity' },
  { name: 'Salesforce', image: '/images/integrations/salesforce.png', category: 'productivity' },
  { name: 'Slack', image: '/images/integrations/slack.png', category: 'communication' },
  { name: 'Microsoft Teams', image: '/images/integrations/teams.png', category: 'communication' },
  { name: 'WhatsApp', image: '/images/integrations/whatsapp.png', category: 'communication' },
];

interface SupportedExportsProps {
  variant?: 'scroll' | 'grid' | 'marquee';
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function SupportedExports({ 
  variant = 'grid', 
  title = 'Export to your favorite tools',
  subtitle = 'Send insights and reports to the tools your team already uses',
  showSearch = false
}: SupportedExportsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredExports = exportIntegrations
    .filter(integration => integration.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (variant === 'grid') {
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-xl text-gray-400 mb-8">{subtitle}</p>
            
            {showSearch && (
              <div className="max-w-md mx-auto relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredExports.map((integration) => (
              <div key={integration.name} className="flex items-center justify-center hover:opacity-80 transition-opacity duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Image 
                      src={integration.image} 
                      alt={integration.name} 
                      width={64} 
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-medium text-sm">{integration.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          {showSearch && filteredExports.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-gray-400">No integrations found matching "{searchTerm}"</p>
              <p className="text-gray-500 text-sm mt-2">Need a custom integration? <span className="text-white hover:text-gray-300 cursor-pointer">Contact us</span> and we'll build it.</p>
            </div>
          )}
          
          {showSearch && filteredExports.length > 0 && searchTerm && (
            <div className="text-center mt-12">
              <p className="text-gray-400">Found {filteredExports.length} integration{filteredExports.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Marquee variant
  if (variant === 'marquee') {
    return (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-xl text-gray-400">{subtitle}</p>
        </div>
        
        {/* Marquee Container */}
        <div className="max-w-6xl mx-auto">
          <Marquee speed={50} gradient={false} pauseOnHover={true}>
            {exportIntegrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-center min-w-[140px] mx-6 hover:opacity-80 transition-opacity duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Image 
                      src={integration.image} 
                      alt={integration.name} 
                      width={64} 
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-medium">{integration.name}</span>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>
    );
  }

  // Scroll variant
  return (
    <section className=" px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-xl text-gray-400">{subtitle}</p>
      </div>
      
      {/* Scrollable Integration Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-12 min-w-max px-4">
            {exportIntegrations.map((integration) => (
              <div key={integration.name} className="flex items-center justify-center min-w-[140px] hover:opacity-80 transition-opacity duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Image 
                      src={integration.image} 
                      alt={integration.name} 
                      width={64} 
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-medium">{integration.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-8">
          <p className="text-sm text-gray-500">← Scroll to see more integrations →</p>
        </div>
      </div>
    </section>
  );
}
