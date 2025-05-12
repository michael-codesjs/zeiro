import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen text-gray-800 bg-gradient-to-b from-amber-50 to-white overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-transparent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-2xl">zeiro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-gray-600 hover:text-yellow-600 transition font-medium">Features</a>
            <a href="#" className="text-sm text-gray-600 hover:text-yellow-600 transition font-medium">Pricing</a>
            <a href="#" className="text-sm text-gray-600 hover:text-yellow-600 transition font-medium">Documentation</a>
            <a href="#" className="text-sm text-gray-600 hover:text-yellow-600 transition font-medium">Blog</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-gray-700 hover:text-yellow-600 font-medium">Sign In</a>
            <a href="/signup" className="text-sm bg-yellow-400 text-white px-5 py-2.5 rounded-md hover:bg-yellow-500 transition duration-300 font-medium shadow-lg shadow-yellow-400/20">
              Start From Zero
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Zero Symbols Background */}
          <div className="absolute w-full h-full">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className="absolute text-[200px] font-bold text-yellow-100"
                style={{
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: 0.3,
                  transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() + 0.5})`,
                }}
              >
                0
              </div>
            ))}
          </div>

          {/* Geometric Shapes */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-20"></div>
          <div className="absolute bottom-40 right-20 w-32 h-32 bg-amber-400 rounded-full opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-yellow-500 rounded-md opacity-20 transform rotate-45"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 text-center md:text-left">
              <div className="inline-flex items-center bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-300 text-yellow-700 text-sm font-medium mb-6">
                <span className="animate-pulse mr-2">⚡</span>
                <span>Zero to Database Mastery</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                <span className="block mb-2">Make Data</span>
                <span className="relative">
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-transparent bg-clip-text">Simple As Zero</span>
                  <svg className="absolute -bottom-2 left-0 w-full opacity-30" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9C157.667 3 315.667 3 355 9" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto md:mx-0">
                <span className="font-semibold text-yellow-600">Zero coding. Zero complexity. Zero learning curve.</span> Query your data with natural language and transform your database experience instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="/signup" className="group bg-yellow-400 text-white px-8 py-4 rounded-lg hover:bg-yellow-500 transition duration-300 font-bold text-lg shadow-xl shadow-yellow-400/20 relative overflow-hidden inline-flex items-center justify-center">
                  <span className="relative z-10">Start Your Zero Journey</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </a>
                
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-yellow-300 rounded-lg hover:bg-yellow-50 transition text-yellow-600 shadow-md font-medium">
                  <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  See Zero in Action
                </button>
              </div>

              <div className="mt-12 flex items-center gap-4 justify-center md:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200"></div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-yellow-600">1,000+</span> developers already using Zeiro
                </p>
              </div>
            </div>

            <div className="md:col-span-6 mt-8 md:mt-0">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-lg transform rotate-12 opacity-50"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full opacity-40"></div>
                
                {/* Main product display */}
                <div className="relative bg-white backdrop-filter backdrop-blur-sm bg-opacity-70 border border-yellow-100 rounded-2xl overflow-hidden shadow-2xl shadow-yellow-900/10 transform transition-transform hover:scale-[1.01] hover:shadow-yellow-900/20">
                  {/* Browser chrome */}
                  <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                      <div className="font-mono text-xs text-gray-500 px-2 py-1 rounded bg-gray-100">zeiro.app</div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">ecommerce_data</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                          Connected • 15 tables • Zero wait time
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 backdrop-blur-sm bg-yellow-50/50 rounded-lg border border-yellow-200 p-4 font-mono text-sm relative overflow-hidden">
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold text-yellow-600">Z</span>
                        </div>
                        <span className="text-yellow-700 font-medium">Zeiro AI Assistant</span>
                      </div>
                      <div className="mb-4 text-gray-700">How can I help you with your data today?</div>
                      <div className="relative">
                        <input 
                          type="text" 
                          value="Show me customers who spent more than $1000 last month with their contact info"
                          readOnly
                          className="w-full border border-yellow-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-gray-700"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414-1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-yellow-200 rounded-full opacity-30"></div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-900 text-sm font-medium">Your Results (0.3s)</div>
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                            </svg>
                            Export
                          </button>
                          <button className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            View SQL
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto bg-white border border-gray-100 rounded-lg shadow-sm">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-yellow-50 text-left text-yellow-800 border-b border-yellow-100">
                              <th className="py-3 px-4 font-semibold">Name</th>
                              <th className="py-3 px-4 font-semibold">Email</th>
                              <th className="py-3 px-4 font-semibold">Phone</th>
                              <th className="py-3 px-4 font-semibold">Spent</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr className="border-b border-gray-100 hover:bg-yellow-50/50">
                              <td className="py-3 px-4 font-medium">Sarah Chen</td>
                              <td className="py-3 px-4">s.chen@example.com</td>
                              <td className="py-3 px-4">(555) 123-4567</td>
                              <td className="py-3 px-4 text-yellow-600 font-bold">$1,426.00</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-yellow-50/50">
                              <td className="py-3 px-4 font-medium">Michael Rodriguez</td>
                              <td className="py-3 px-4">m.rod@example.com</td>
                              <td className="py-3 px-4">(555) 987-6543</td>
                              <td className="py-3 px-4 text-yellow-600 font-bold">$1,218.75</td>
                            </tr>
                            <tr className="hover:bg-yellow-50/50">
                              <td className="py-3 px-4 font-medium">Aisha Johnson</td>
                              <td className="py-3 px-4">a.johnson@example.com</td>
                              <td className="py-3 px-4">(555) 345-6789</td>
                              <td className="py-3 px-4 text-yellow-600 font-bold">$1,105.50</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 pt-32 pb-24 relative">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-64 w-full bg-yellow-400/10 -skew-y-6 transform -translate-y-24"></div>
          <div className="absolute right-0 top-1/4 h-64 w-64 bg-yellow-300 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute left-0 bottom-0 h-64 w-64 bg-amber-500 rounded-full blur-3xl opacity-10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 rounded-full text-yellow-800 text-sm font-medium mb-4">
              <span className="text-lg">⭐</span>
              <span>Why choose Zeiro?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Zero Barriers Between You <br />and Your <span className="relative inline-block">
                <span className="relative z-10 text-yellow-600">Data</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-yellow-200 -z-10"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our zero-complexity approach makes database interactions effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-yellow-100 border border-yellow-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-200/40">
              <div className="relative mb-8">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-100 rounded-full"></div>
                <div className="relative z-10 h-14 w-14 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Zero Technical Knowledge
              </h3>
              <p className="text-gray-600 mb-6">
                Ask questions in plain English and watch as complex data operations materialize with absolutely zero technical knowledge required.
              </p>
              <div className="pt-4 border-t border-yellow-100">
                <a href="#" className="flex items-center gap-2 text-yellow-600 font-medium group">
                  <span>Learn more</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-yellow-100 border border-yellow-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-200/40 md:translate-y-8">
              <div className="relative mb-8">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-100 rounded-full"></div>
                <div className="relative z-10 h-14 w-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Zero Visualization Effort
              </h3>
              <p className="text-gray-600 mb-6">
                Automatically generates the perfect visualization for your data, eliminating hours of manual chart creation.
              </p>
              <div className="pt-4 border-t border-yellow-100">
                <a href="#" className="flex items-center gap-2 text-amber-600 font-medium group">
                  <span>Learn more</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-yellow-100 border border-yellow-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-200/40">
              <div className="relative mb-8">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-orange-100 rounded-full"></div>
                <div className="relative z-10 h-14 w-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Zero Performance Lag
              </h3>
              <p className="text-gray-600 mb-6">
                Advanced optimization engines ensure that even complex queries run with zero noticeable delay, no matter the database size.
              </p>
              <div className="pt-4 border-t border-yellow-100">
                <a href="#" className="flex items-center gap-2 text-orange-600 font-medium group">
                  <span>Learn more</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Feature Highlight Section */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5">
              <span className="inline-block px-4 py-1 rounded-full bg-yellow-200 text-yellow-800 text-sm font-medium mb-4">Powerful Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get Started with Zero Learning Curve
              </h2>
              <p className="text-gray-600 mb-8">
                Our platform is designed to be intuitive from day one. You'll be creating complex queries and visualizations within minutes, not weeks.
              </p>
              
              <ul className="space-y-4">
                {[
                  { 
                    name: "Natural language queries", 
                    description: "Ask questions in plain English and get instant answers" 
                  },
                  { 
                    name: "Automatic documentation", 
                    description: "Documentation that writes and updates itself"
                  },
                  { 
                    name: "Real-time collaboration", 
                    description: "Work together seamlessly, across any device"
                  },
                  { 
                    name: "Advanced security", 
                    description: "Enterprise-grade protection built right in"
                  }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 flex-shrink-0 flex items-center justify-center text-yellow-600 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <button className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium shadow-lg shadow-yellow-300/30">
                <span>Explore all features</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="md:col-span-7 relative">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-yellow-400 rounded-full opacity-10"></div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-yellow-400 rounded-full opacity-10"></div>
              
              <div className="relative bg-white rounded-2xl p-8 shadow-2xl shadow-yellow-200/30 border border-yellow-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-yellow-100">
                    <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Automatic Documentation</h3>
                    <p className="text-gray-600 text-sm">
                      We auto-generate complete database documentation so your team stays on the same page.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-yellow-100 md:translate-y-8">
                    <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Filters</h3>
                    <p className="text-gray-600 text-sm">
                      Create complex data filters with simple language and get exactly the data you need.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-yellow-100">
                    <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3M6 20.25l.75-1.3m7.5-12.99l.75-1.3" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Optimization</h3>
                    <p className="text-gray-600 text-sm">
                      Zeiro automatically optimizes your queries for lightning-fast performance.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-yellow-100 md:translate-y-8">
                    <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-device Support</h3>
                    <p className="text-gray-600 text-sm">
                      Access your database from any device, anywhere. Work seamlessly across your ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute w-full h-full bg-amber-50"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-300 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-400 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full h-24 bg-yellow-400/10 -skew-y-3"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-1.5 rounded-full text-yellow-800 text-sm font-medium mb-4">
              <span className="text-lg">⭐</span>
              <span>Trusted by thousands</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Teams <span className="text-yellow-600">Love Zeiro</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join teams across departments who've transformed their data experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Testimonial 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-yellow-200 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10 transform scale-[0.85] group-hover:scale-100 transition-transform duration-300"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-6">
                  <div className="flex gap-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                  "Zeiro has completely transformed how our team works with databases. The AI features save us hours every day."
                </p>
                
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-600 text-xl mr-4">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Jane Doe</h4>
                    <p className="text-gray-600 text-sm">Product Manager @ Tech Co</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group relative md:translate-y-8">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-yellow-200 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10 transform scale-[0.85] group-hover:scale-100 transition-transform duration-300"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-6">
                  <div className="flex gap-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                  "The natural language query feature is a game-changer. It's like having a SQL expert on your team 24/7."
                </p>
                
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-600 text-xl mr-4">
                    JS
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">John Smith</h4>
                    <p className="text-gray-600 text-sm">IT Manager @ Startup Inc</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-yellow-200 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10 transform scale-[0.85] group-hover:scale-100 transition-transform duration-300"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-6">
                  <div className="flex gap-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                  "We've reduced our database management costs by 40% since switching to Zeiro. The ROI is incredible."
                </p>
                
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600 text-xl mr-4">
                    AL
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Alex Lee</h4>
                    <p className="text-gray-600 text-sm">Business Analyst @ Enterprise Co</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {[
              { number: "150+", label: "Enterprise clients" },
              { number: "15M+", label: "Queries processed" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-white rounded-xl shadow-lg border border-yellow-100">
                <div className="text-4xl font-bold text-yellow-500 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 -z-10"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-yellow-400 opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-amber-500 opacity-5 blur-3xl"></div>
        
        {/* Zero symbols */}
        <div className="absolute w-full h-full overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute text-[300px] font-bold text-yellow-500/10"
              style={{
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                transform: `rotate(${Math.random() * 30}deg) scale(${Math.random() * 0.5 + 0.5})`,
              }}
            >
              0
            </div>
          ))}
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="relative">
            {/* Yellow highlight accent */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-400 rounded-lg rotate-12"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full opacity-30 blur-2xl"></div>
            
            {/* Main content container */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-yellow-100">
              <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
                {/* Left side - yellow gradient */}
                <div className="lg:col-span-2 bg-gradient-to-br from-yellow-400 to-amber-500 p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-600 opacity-20 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                  
                  <div className="relative z-10">
                    <div className="text-white inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-white/30">
                      <span>Join thousands of data teams</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Transform Your Data Experience <span className="text-yellow-200">Today</span>
                    </h2>
                    
                    <p className="text-white/80 text-lg mb-10 max-w-md">
                      Join thousands of developers who are working smarter, not harder, with Zeiro's zero-complexity approach.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a href="/signup" className="bg-white text-yellow-600 font-bold py-4 px-8 rounded-xl hover:bg-yellow-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 border border-white/80 group w-full sm:w-auto inline-flex items-center justify-center">
                        <span className="flex items-center justify-center gap-2">
                          Get Started Free
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </a>
                    </div>
                    
                    <div className="mt-12 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-amber-300"></div>
                        ))}
                      </div>
                      <p className="text-sm text-white">
                        <span className="font-bold">1,000+</span> developers joined this month
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Right side - demo */}
                <div className="lg:col-span-3 p-12 lg:p-16 flex items-center justify-center bg-gray-50">
                  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Browser chrome */}
                    <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="px-3 py-1 rounded bg-white text-xs text-gray-500 border border-gray-200 font-mono">zeiro.app</div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">Z</div>
                        <div>
                          <div className="font-semibold text-gray-900">Zeiro AI Assistant</div>
                          <div className="text-xs text-gray-500">Connected to your database</div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-sm text-gray-700 mb-2">Ask Zeiro anything:</div>
                        <div className="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-100 text-gray-900">
                            Show revenue from last quarter grouped by product category
                          </div>
                          <div className="text-xs text-gray-500 px-4 py-2 flex items-center justify-between">
                            <span>Processing query...</span>
                            <span className="text-yellow-500">0.2s</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-gradient-to-r from-yellow-100 to-amber-100 animate-pulse border border-amber-200 flex items-center justify-center">
                          <div className="text-amber-500 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Generating chart</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="text-xs px-3 py-1.5 bg-gray-100 rounded border border-gray-200 text-gray-700 flex-1 hover:bg-gray-200 transition-colors">Export Results</button>
                          <button className="text-xs px-3 py-1.5 bg-yellow-100 rounded border border-yellow-200 text-yellow-700 flex-1 hover:bg-yellow-200 transition-colors">View SQL</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database Support Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-amber-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-300 rounded-full blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 rounded-full text-yellow-800 text-sm font-medium mb-4">
              <span className="text-lg">🔌</span>
              <span>Universal Compatibility</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Connect to <span className="text-yellow-600">Any Database</span> You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Zeiro works seamlessly with all major database platforms, giving you a zero-learning curve experience across your data ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-12">
            {/* Database Items */}
            {[
              { name: "PostgreSQL", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" },
              { name: "MySQL", logo: "https://upload.wikimedia.org/wikipedia/en/d/dd/MySQL_logo.svg" },
              { name: "Microsoft SQL", logo: "https://upload.wikimedia.org/wikipedia/de/8/8c/Microsoft_SQL_Server_Logo.svg" },
              { name: "SQLite", logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/SQLite370.svg" },
              { name: "DynamoDB", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/DynamoDB.png" },
              { name: "MariaDB", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/MariaDB_colour_logo.svg" },
              { name: "Oracle", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Oracle_Logo.svg" },
              { name: "MongoDB", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" },
              { name: "Neo4j", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Neo4j-logo_color.png" },
              { name: "Elasticsearch", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Elasticsearch_logo.svg" },
              { name: "Redis", logo: "https://seeklogo.com/images/R/redis-logo-E403D4DD6A-seeklogo.com.png" },
              { name: "Cassandra", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Cassandra_logo.svg" },
            ].map((db, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-xl border border-gray-100 flex items-center justify-center mb-4 transition-transform hover:scale-105 p-3">
                  <img 
                    src={db.logo} 
                    alt={`${db.name} logo`} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* "And more" section */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">And many other databases, data warehouses, and cloud providers</p>
            <a href="#" className="inline-flex items-center gap-2 text-yellow-600 font-medium hover:text-yellow-700 transition-colors">
              <span>View all supported databases</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-32 relative overflow-hidden bg-amber-100">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-amber-100 -z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400 rounded-full filter blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-200 rounded-full text-yellow-800 text-sm font-medium mb-4">
              <span className="text-lg">💰</span>
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Zero Complexity <span className="text-yellow-600">Pricing</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Start for free. Scale as you grow. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-yellow-200/30 hover:border-yellow-200 relative group">
              <div className="h-2 bg-gray-300 w-full group-hover:bg-gray-400 transition-colors"></div>
              <div className="p-8">
                <h3 className="text-gray-900 font-bold text-2xl mb-2">Starter</h3>
                <p className="text-gray-700 mb-6">For solo developers getting started</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-gray-900 text-5xl font-bold">$0</span>
                  <span className="text-gray-700 mb-1.5 text-xl">/month</span>
                </div>
                <button className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-800 hover:border-yellow-300 hover:bg-yellow-50 transition font-medium mb-8">
                  Get Started Free
                </button>
                <ul className="space-y-4">
                  {[
                    "1 database connection",
                    "Basic AI query assistance",
                    "Schema visualization",
                    "100 AI queries/month"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-3xl border-2 border-yellow-400 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-300/30 relative group transform scale-105 md:-translate-y-4 z-10">
              <div className="h-2 bg-gradient-to-r from-yellow-500 to-amber-600 w-full"></div>
              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                MOST POPULAR
              </div>
              <div className="p-8">
                <h3 className="text-gray-900 font-bold text-2xl mb-2">Professional</h3>
                <p className="text-gray-700 mb-6">For professional developers & teams</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-gray-900 text-5xl font-bold">$29</span>
                  <span className="text-gray-700 mb-1.5 text-xl">/month</span>
                </div>
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-lg hover:shadow-yellow-400/30 transition font-medium mb-8">
                  Start 14-Day Free Trial
                </button>
                <ul className="space-y-4">
                  {[
                    "5 database connections",
                    "Advanced AI query assistance",
                    "Complete schema documentation",
                    "1,000 AI queries/month",
                    "Query history & version control",
                    "Priority support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-yellow-200/30 hover:border-yellow-200 relative group">
              <div className="h-2 bg-gray-300 w-full group-hover:bg-gray-400 transition-colors"></div>
              <div className="p-8">
                <h3 className="text-gray-900 font-bold text-2xl mb-2">Enterprise</h3>
                <p className="text-gray-700 mb-6">For organizations with complex needs</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-gray-900 text-5xl font-bold">Custom</span>
                </div>
                <button className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-800 hover:border-yellow-300 hover:bg-yellow-50 transition font-medium mb-8">
                  Contact Sales
                </button>
                <ul className="space-y-4">
                  {[
                    "Unlimited database connections",
                    "Advanced security features",
                    "SSO & team management",
                    "Unlimited AI queries",
                    "Dedicated account manager",
                    "Custom integrations",
                    "On-premise deployment option"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 bg-yellow-100 rounded-3xl p-8 md:p-12 border-2 border-yellow-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Need something specific?</h3>
                <p className="text-gray-700">Our team can create a custom plan tailored to your needs.</p>
              </div>
              <button className="whitespace-nowrap px-8 py-4 bg-white rounded-xl shadow-lg border-2 border-yellow-300 text-yellow-700 font-medium hover:bg-yellow-500 hover:text-white transition-colors">
                Get a Custom Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-20 px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-yellow-300 rounded-full filter blur-3xl opacity-10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-bold text-white text-2xl">zeiro</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-md">
                Zeiro is an AI-powered database client that makes working with data simple, intuitive, and incredibly powerful.
              </p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Product</h4>
              <ul className="space-y-4">
                {["Features", "Pricing", "Documentation", "Changelog", "Integrations"].map((item, i) => (
                  <li key={i}><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Careers", "Blog", "Contact", "Press"].map((item, i) => (
                  <li key={i}><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Subscribe</h4>
              <p className="text-gray-400 mb-6">Get the latest updates and news directly to your inbox.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-3 text-gray-400 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-3 rounded-r-lg hover:shadow-md hover:shadow-yellow-500/30 text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Zeiro. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-yellow-400 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-yellow-400 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-yellow-400 text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
