'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BsSearch as Search } from 'react-icons/bs';
import Marquee from 'react-fast-marquee';
import { getAllDataSources } from '@/data/data-sources';

const dataSources = getAllDataSources();

interface SupportedDataSourcesProps {
  variant?: 'scroll' | 'grid' | 'marquee';
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function SupportedDataSources({ 
  variant = 'scroll', 
  title = 'Connect to any data source',
  subtitle = 'From databases to spreadsheets, we support all your favorite tools',
  showSearch = false
}: SupportedDataSourcesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDataSources = dataSources
    .filter(source => source.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                  placeholder="Search data sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredDataSources.map((source) => (
              <Link 
                key={source.name} 
                href={`/data-source/${source.slug}`}
                className="flex items-center justify-center hover:opacity-80 hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-gray-900/50 border border-gray-800 rounded-xl group-hover:bg-gray-900/80 group-hover:border-gray-700 transition-all duration-300">
                  <Image 
                    src={source.logo} 
                    alt={source.name} 
                    width={40} 
                    height={40}
                    className="object-contain"
                  />
                </div>
              </Link>
            ))}
          </div>
          
          {showSearch && filteredDataSources.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-gray-400">No data sources found matching "{searchTerm}"</p>
              <p className="text-gray-500 text-sm mt-2">Don't see your data source? <span className="text-white hover:text-gray-300 cursor-pointer">Contact us</span> and we'll add it.</p>
            </div>
          )}
          
          {showSearch && filteredDataSources.length > 0 && searchTerm && (
            <div className="text-center mt-12">
              <p className="text-gray-400">Found {filteredDataSources.length} data source{filteredDataSources.length !== 1 ? 's' : ''}</p>
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
            {dataSources.map((source, index) => (
              <div key={index} className="flex items-center justify-center min-w-[80px] mx-6 hover:opacity-80 transition-opacity duration-300">
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image 
                    src={source.logo} 
                    alt={source.name} 
                    width={64} 
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>
    );
  }

  // Scroll variant (default)
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-xl text-gray-400">{subtitle}</p>
      </div>
      
      {/* Scrollable Database Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-12 min-w-max px-4">
            {dataSources.map((source) => (
              <div key={source.name} className="flex items-center justify-center min-w-[80px] hover:opacity-80 transition-opacity duration-300">
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image 
                    src={source.logo} 
                    alt={source.name} 
                    width={64} 
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-8">
          <p className="text-sm text-gray-500">← Scroll to see more data sources →</p>
        </div>
      </div>
    </section>
  );
}
