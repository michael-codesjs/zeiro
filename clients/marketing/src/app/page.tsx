import Link from 'next/link';
import Image from 'next/image';
import { 
  BsPlayFill as SaxPlay,
  BsArrowRight as SaxArrowRight,
  BsCheckLg as SaxTick,
  BsDatabase as SaxData,
  BsChatDots as SaxMessage,
  BsLightning as SaxFlash,
  BsBarChart as SaxChart,
  BsStarFill as SaxStar,
  BsDownload as SaxExport,
  BsCode as SaxCode,
  BsGear as SaxSetting,
  BsShield as SaxShield,
  BsDisplay as SaxMonitor,
  BsArrowClockwise as SaxGlobalRefresh,
  BsArrowClockwise as SaxRefresh
} from 'react-icons/bs';

export default function Home() {
  return (
    <div className="min-h-screen text-gray-800 bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-transparent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-2xl">zeiro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition font-medium">Features</Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition font-medium">Pricing</Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition font-medium">Documentation</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/in" className="text-sm text-gray-700 hover:text-indigo-600 font-medium">Sign In</Link>
            <Link href="/auth/up" className="text-sm bg-indigo-500 text-white px-5 py-2.5 rounded-md hover:bg-indigo-600 transition duration-300 font-medium shadow-lg shadow-indigo-400/20">
              Start From Zero
            </Link>
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
                className="absolute text-[200px] font-bold text-indigo-100"
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
          <div className="absolute top-20 left-10 w-24 h-24 bg-indigo-300 rounded-full opacity-20"></div>
          <div className="absolute bottom-40 right-20 w-32 h-32 bg-purple-400 rounded-full opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-indigo-500 rounded-md opacity-20 transform rotate-45"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 text-center md:text-left">
              <div className="inline-flex items-center bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-300 text-indigo-700 text-sm font-medium mb-6">
                <span className="animate-pulse mr-2"><SaxFlash className="w-4 h-4" /></span>
                <span>Zero to Database Mastery</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                <span className="block mb-2">Make Data</span>
                <span className="relative">
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-600 text-transparent bg-clip-text">Simple As Zero</span>
                  <svg className="absolute -bottom-2 left-0 w-full opacity-30" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9C157.667 3 315.667 3 355 9" stroke="#6366F1" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto md:mx-0">
                <span className="font-semibold text-indigo-600">Zero coding. Zero complexity. Zero learning curve.</span> Query your data with natural language and transform your database experience instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="/auth/up" className="group bg-indigo-500 text-white px-8 py-4 rounded-lg hover:bg-indigo-600 transition duration-300 font-bold text-lg shadow-xl shadow-indigo-400/20 relative overflow-hidden inline-flex items-center justify-center">
                  <span className="relative z-10">Start Your Zero Journey</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </a>
                
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-50 transition text-indigo-600 shadow-md font-medium">
                  <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <SaxPlay className="w-4 h-4 text-indigo-600" />
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
                  <span className="font-bold text-indigo-600">1,000+</span> developers already using Zeiro
                </p>
              </div>
            </div>

            <div className="md:col-span-6 mt-8 md:mt-0">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-500 rounded-lg transform rotate-12 opacity-50"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-40"></div>
                
                {/* Main product display */}
                <div className="relative bg-white backdrop-filter backdrop-blur-sm bg-opacity-70 border border-indigo-100 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/10 transform transition-transform hover:scale-[1.01] hover:shadow-indigo-900/20">
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
                      <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                        <SaxData className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">ecommerce_data</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                          Connected • 15 tables • Zero wait time
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 backdrop-blur-sm bg-indigo-50/50 rounded-lg border border-indigo-200 p-4 font-mono text-sm relative overflow-hidden">
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold text-indigo-600">Z</span>
                        </div>
                        <span className="text-indigo-700 font-medium">Zeiro AI Assistant</span>
                      </div>
                      <div className="mb-4 text-gray-700">How can I help you with your data today?</div>
                      <div className="relative">
                        <input 
                          type="text" 
                          value="Show me customers who spent more than $1000 last month with their contact info"
                          readOnly
                          className="w-full border border-indigo-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500">
                          <SaxArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-200 rounded-full opacity-30"></div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-900 text-sm font-medium">Your Results (0.3s)</div>
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded flex items-center gap-1">
                            <SaxExport className="h-3 w-3" />
                            Export
                          </button>
                          <button className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded flex items-center gap-1">
                            <SaxCode className="h-3 w-3" />
                            View SQL
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto bg-white border border-gray-100 rounded-lg shadow-sm">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-indigo-50 text-left text-indigo-800 border-b border-indigo-100">
                              <th className="py-3 px-4 font-semibold">Name</th>
                              <th className="py-3 px-4 font-semibold">Email</th>
                              <th className="py-3 px-4 font-semibold">Phone</th>
                              <th className="py-3 px-4 font-semibold">Spent</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr className="border-b border-gray-100 hover:bg-indigo-50/50">
                              <td className="py-3 px-4 font-medium">Sarah Chen</td>
                              <td className="py-3 px-4">s.chen@example.com</td>
                              <td className="py-3 px-4">(555) 123-4567</td>
                              <td className="py-3 px-4 text-indigo-600 font-bold">$1,426.00</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-indigo-50/50">
                              <td className="py-3 px-4 font-medium">Michael Rodriguez</td>
                              <td className="py-3 px-4">m.rod@example.com</td>
                              <td className="py-3 px-4">(555) 987-6543</td>
                              <td className="py-3 px-4 text-indigo-600 font-bold">$1,218.75</td>
                            </tr>
                            <tr className="hover:bg-indigo-50/50">
                              <td className="py-3 px-4 font-medium">Aisha Johnson</td>
                              <td className="py-3 px-4">a.johnson@example.com</td>
                              <td className="py-3 px-4">(555) 345-6789</td>
                              <td className="py-3 px-4 text-indigo-600 font-bold">$1,105.50</td>
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
          <div className="absolute h-64 w-full bg-indigo-400/10 -skew-y-6 transform -translate-y-24"></div>
          <div className="absolute right-0 top-1/4 h-64 w-64 bg-indigo-300 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute left-0 bottom-0 h-64 w-64 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 rounded-full text-indigo-800 text-sm font-medium mb-4">
              <SaxStar className="w-4 h-4" />
              <span>Why choose Zeiro?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Zero Barriers Between You <br />and Your <span className="relative inline-block">
                <span className="relative z-10 text-indigo-600">Data</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-indigo-200 -z-10"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our zero-complexity approach makes database interactions effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-indigo-100 border border-indigo-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/40">
              <div className="relative mb-8">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-indigo-100 rounded-full"></div>
                <div className="relative z-10 h-14 w-14 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-400/20">
                  <SaxMessage className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Zero Technical Knowledge
              </h3>
              <p className="text-gray-600 mb-6">
                Ask questions in plain English and watch as complex data operations materialize with absolutely zero technical knowledge required.
              </p>
              <div className="pt-4 border-t border-indigo-100">
                <a href="#" className="flex items-center gap-2 text-indigo-600 font-medium group">
                  <span>Learn more</span>
                  <SaxArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-indigo-100 border border-indigo-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/40 md:translate-y-8">
              <div className="relative mb-8">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-purple-100 rounded-full"></div>
                <div className="relative z-10 h-14 w-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <SaxChart className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Zero Visualization Effort
              </h3>
              <p className="text-gray-600 mb-6">
                Automatically generates the perfect visualization for your data, eliminating hours of manual chart creation.
              </p>
              <div className="pt-4 border-t border-indigo-100">
                <a href="#" className="flex items-center gap-2 text-purple-600 font-medium group">
                  <span>Learn more</span>
                  <SaxArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-indigo-100 border border-indigo-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/40">
              <div className="relative mb-8">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-100 rounded-full"></div>
                <div className="relative z-10 h-14 w-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <SaxFlash className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Zero Performance Lag
              </h3>
              <p className="text-gray-600 mb-6">
                Advanced optimization engines ensure that even complex queries run with zero noticeable delay, no matter the database size.
              </p>
              <div className="pt-4 border-t border-indigo-100">
                <a href="#" className="flex items-center gap-2 text-blue-600 font-medium group">
                  <span>Learn more</span>
                  <SaxArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Feature Highlight Section */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5">
              <span className="inline-block px-4 py-1 rounded-full bg-indigo-200 text-indigo-800 text-sm font-medium mb-4">Powerful Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get Started with Zero Learning Curve
              </h2>
              <p className="text-gray-600 mb-8">
                Our platform is designed to be intuitive from day one. You&apos;ll be creating complex queries and visualizations within minutes, not weeks.
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
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 mt-0.5">
                      <SaxTick className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <button className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium shadow-lg shadow-indigo-300/30">
                <span>Explore all features</span>
                <SaxArrowRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="md:col-span-7 relative">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-400 rounded-full opacity-10"></div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-400 rounded-full opacity-10"></div>
              
              <div className="relative bg-white rounded-2xl p-8 shadow-2xl shadow-indigo-200/30 border border-indigo-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                      <SaxMonitor className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Automatic Documentation</h3>
                    <p className="text-gray-600 text-sm">
                      We auto-generate complete database documentation so your team stays on the same page.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-indigo-100 md:translate-y-8">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                      <SaxSetting className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Filters</h3>
                    <p className="text-gray-600 text-sm">
                      Create complex data filters with simple language and get exactly the data you need.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                      <SaxGlobalRefresh className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Optimization</h3>
                    <p className="text-gray-600 text-sm">
                      Zeiro automatically optimizes your queries for lightning-fast performance.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-indigo-100 md:translate-y-8">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                      <SaxMonitor className="h-6 w-6 text-purple-600" />
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
          <div className="absolute w-full h-full bg-indigo-50"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-300 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full h-24 bg-indigo-400/10 -skew-y-3"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-1.5 rounded-full text-indigo-800 text-sm font-medium mb-4">
              <SaxStar className="w-4 h-4" />
              <span>Trusted by thousands</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Teams <span className="text-indigo-600">Love Zeiro</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join teams across departments who&apos;ve transformed their data experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Testimonial 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-200 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10 transform scale-[0.85] group-hover:scale-100 transition-transform duration-300"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-6">
                  <div className="flex gap-1 text-indigo-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <SaxStar key={star} className="h-6 w-6 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                  &quot;Zeiro has completely transformed how our team works with databases. The AI features save us hours every day.&quot;
                </p>
                
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600 text-xl mr-4">
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-200 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10 transform scale-[0.85] group-hover:scale-100 transition-transform duration-300"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-6">
                  <div className="flex gap-1 text-indigo-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <SaxStar key={star} className="h-6 w-6 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                  &quot;The natural language query feature is a game-changer. It&apos;s like having a SQL expert on your team 24/7.&quot;
                </p>
                
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 text-xl mr-4">
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-200 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10 transform scale-[0.85] group-hover:scale-100 transition-transform duration-300"></div>
              <div className="bg-white p-8 rounded-3xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-6">
                  <div className="flex gap-1 text-indigo-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <SaxStar key={star} className="h-6 w-6 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 text-lg italic leading-relaxed">
                  &quot;We&apos;ve reduced our database management costs by 40% since switching to Zeiro. The ROI is incredible.&quot;
                </p>
                
                <div className="flex items-center">
                  <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xl mr-4">
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
              <div key={i} className="p-6 bg-white rounded-xl shadow-lg border border-indigo-100">
                <div className="text-4xl font-bold text-indigo-500 mb-2">{stat.number}</div>
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-400 opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500 opacity-5 blur-3xl"></div>
        
        {/* Zero symbols */}
        <div className="absolute w-full h-full overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute text-[300px] font-bold text-indigo-500/10"
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
            {/* Highlight accent */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-indigo-500 rounded-lg rotate-12"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-30 blur-2xl"></div>
            
            {/* Main content container */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-indigo-100">
              <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
                {/* Left side - gradient */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-700 opacity-20 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                  
                  <div className="relative z-10">
                    <div className="text-white inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-white/30">
                      <span>Join thousands of data teams</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Transform Your Data Experience <span className="text-indigo-200">Today</span>
                    </h2>
                    
                    <p className="text-white/80 text-lg mb-10 max-w-md">
                      Join thousands of developers who are working smarter, not harder, with Zeiro&apos;s zero-complexity approach.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a href="/auth/up" className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 border border-white/80 group w-full sm:w-auto inline-flex items-center justify-center">
                        <span className="flex items-center justify-center gap-2">
                          Get Started Free
                          <SaxArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </a>
                    </div>
                    
                    <div className="mt-12 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-purple-300"></div>
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
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">Z</div>
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
                            <span className="text-indigo-500">0.2s</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 animate-pulse border border-purple-200 flex items-center justify-center">
                          <div className="text-purple-500 flex items-center gap-2">
                            <SaxRefresh className="h-5 w-5 animate-spin" />
                            <span>Generating chart</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="text-xs px-3 py-1.5 bg-gray-100 rounded border border-gray-200 text-gray-700 flex-1 hover:bg-gray-200 transition-colors">Export Results</button>
                          <button className="text-xs px-3 py-1.5 bg-indigo-100 rounded border border-indigo-200 text-indigo-700 flex-1 hover:bg-indigo-200 transition-colors">View SQL</button>
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
      <section className="py-24 px-6 bg-gradient-to-b from-white to-indigo-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-300 rounded-full blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 rounded-full text-indigo-800 text-sm font-medium mb-4">
              <span className="text-lg">🔌</span>
              <span>Universal Compatibility</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Connect to <span className="text-indigo-600">Any Database</span> You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Zeiro works seamlessly with all major database platforms, giving you a zero-learning curve experience across your data ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-12">
            {/* Database Items */}
            {[
              { name: "PostgreSQL", logo: "/images/databases/postgresql.svg" },
              { name: "MySQL", logo: "/images/databases/mysql.svg" },
              { name: "Microsoft SQL", logo: "/images/databases/mssql.svg" },
              { name: "SQLite", logo: "/images/databases/sqlite.svg" },
              { name: "DynamoDB", logo: "/images/databases/dynamodb.svg" },
              { name: "MariaDB", logo: "/images/databases/mariadb.svg" },
              { name: "Oracle", logo: "/images/databases/oracle.svg" },
              { name: "MongoDB", logo: "/images/databases/mongodb.svg" },
              { name: "Neo4j", logo: "/images/databases/neo4j.svg" },
              { name: "Elasticsearch", logo: "/images/databases/elasticsearch.svg" },
              { name: "Redis", logo: "/images/databases/redis.svg" },
              { name: "Cassandra", logo: "/images/databases/cassandra.svg" },
            ].map((db, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-xl border border-gray-100 flex items-center justify-center mb-4 transition-transform hover:scale-105 p-3">
                  <Image 
                    src={db.logo} 
                    alt={`${db.name} logo`} 
                    width={64}
                    height={64}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* "And more" section */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">And many other databases, data warehouses, and cloud providers</p>
            <a href="#" className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              <span>View all supported databases</span>
              <SaxArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-32 relative overflow-hidden bg-indigo-100">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-indigo-100 -z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-200 rounded-full text-indigo-800 text-sm font-medium mb-4">
              <span className="text-lg">💰</span>
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Zero Complexity <span className="text-indigo-600">Pricing</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Start for free. Scale as you grow. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-200/30 hover:border-indigo-200 relative group">
              <div className="h-2 bg-gray-300 w-full group-hover:bg-gray-400 transition-colors"></div>
              <div className="p-8">
                <h3 className="text-gray-900 font-bold text-2xl mb-2">Starter</h3>
                <p className="text-gray-700 mb-6">For solo developers getting started</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-gray-900 text-5xl font-bold">$0</span>
                  <span className="text-gray-700 mb-1.5 text-xl">/month</span>
                </div>
                <button className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 transition font-medium mb-8">
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
                      <SaxTick className="h-6 w-6 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-3xl border-2 border-indigo-400 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-300/30 relative group transform scale-105 md:-translate-y-4 z-10">
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 w-full"></div>
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                MOST POPULAR
              </div>
              <div className="p-8">
                <h3 className="text-gray-900 font-bold text-2xl mb-2">Professional</h3>
                <p className="text-gray-700 mb-6">For professional developers & teams</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-gray-900 text-5xl font-bold">$29</span>
                  <span className="text-gray-700 mb-1.5 text-xl">/month</span>
                </div>
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-400/30 transition font-medium mb-8">
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
                      <SaxTick className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-200/30 hover:border-indigo-200 relative group">
              <div className="h-2 bg-gray-300 w-full group-hover:bg-gray-400 transition-colors"></div>
              <div className="p-8">
                <h3 className="text-gray-900 font-bold text-2xl mb-2">Enterprise</h3>
                <p className="text-gray-700 mb-6">For organizations with complex needs</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-gray-900 text-5xl font-bold">Custom</span>
                </div>
                <button className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 transition font-medium mb-8">
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
                      <SaxTick className="h-6 w-6 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 bg-indigo-100 rounded-3xl p-8 md:p-12 border-2 border-indigo-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Need something specific?</h3>
                <p className="text-gray-700">Our team can create a custom plan tailored to your needs.</p>
              </div>
              <button className="whitespace-nowrap px-8 py-4 bg-white rounded-xl shadow-lg border-2 border-indigo-300 text-indigo-700 font-medium hover:bg-indigo-500 hover:text-white transition-colors">
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
          <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-400 rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300 rounded-full filter blur-3xl opacity-10"></div>
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
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-500 hover:text-white transition-colors">
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
                  <li key={i}><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Careers", "Blog", "Contact", "Press"].map((item, i) => (
                  <li key={i}><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">{item}</a></li>
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
                  className="bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-3 text-gray-400 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-r-lg hover:shadow-md hover:shadow-indigo-500/30 text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Zeiro. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-indigo-400 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-indigo-400 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-indigo-400 text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
