'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [usageIntent, setUsageIntent] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    role: false,
    usageIntent: false
  });
  
  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateIn(true);
  }, []);
  
  const roles = [
    { id: 'engineering', name: 'Engineering' },
    { id: 'product', name: 'Product' },
    { id: 'it', name: 'IT' },
    { id: 'data', name: 'Data Science/Analytics' },
    { id: 'operations', name: 'Operations' },
    { id: 'business', name: 'Business/Management' },
    { id: 'other', name: 'Other' },
  ];
  
  const usageOptions = [
    { id: 'data_analysis', name: 'Data analysis and insights' },
    { id: 'database_management', name: 'Managing multiple databases' },
    { id: 'reporting', name: 'Creating reports for my team' },
    { id: 'business_intelligence', name: 'Business intelligence' },
    { id: 'data_visualization', name: 'Data visualization' },
    { id: 'learning', name: 'Learning SQL and databases' },
    { id: 'team_collaboration', name: 'Team collaboration on data' },
    { id: 'other', name: 'Other' },
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Mark all fields in step 1 as touched
      setTouched(prev => ({
        ...prev,
        name: true,
        email: true,
        password: true
      }));
      
      if (!name || !email || !password) {
        return; // Don't proceed if validation fails
      }
      
      setStep(2);
      return;
    }
    
    // Mark all fields in step 2 as touched
    setTouched(prev => ({
      ...prev,
      role: true,
      usageIntent: true
    }));
    
    if (!role || !usageIntent) {
      return; // Don't proceed if validation fails
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Signup attempt:', { name, email, password, role, usageIntent });
      setIsLoading(false);
      // Implement actual signup logic here
    }, 1500);
  };

  const getStepProgress = () => {
    return (step / 2) * 100;
  };

  const isNextDisabled = () => {
    if (step === 1) {
      return !name || !email || !password;
    }
    return !role || !usageIntent;
  };
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="px-6 py-4 bg-transparent absolute top-0 left-0 w-full z-10">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="font-bold text-gray-900 text-2xl">
            zeiro
          </Link>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-grow flex h-screen">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative order-2 lg:order-1">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300 rounded-full filter blur-3xl opacity-20"></div>
          </div>
          
          <div className={`w-full max-w-lg transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100 shadow-yellow-100/20 backdrop-blur-sm hover:shadow-yellow-200/30 transition-all duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
                <p className="text-gray-600">Join thousands of teams using Zeiro</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full mb-8 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${getStepProgress()}%` }}
                ></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <>
                    <div className="relative group transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={`w-full px-4 py-4 pl-12 rounded-xl border ${!name && touched.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all focus:bg-white shadow-sm text-gray-900`}
                        placeholder="Jane Smith"
                      />
                      <label 
                        htmlFor="name" 
                        className={`absolute text-sm font-medium transition-all duration-300 ${name ? '-top-6 left-0 text-gray-700' : 'top-4 left-12 text-gray-500'}`}
                      >
                        Full Name
                      </label>
                      {!name && touched.name && (
                        <div className="text-red-500 text-xs mt-1 ml-1">Please enter your name</div>
                      )}
                    </div>

                    <div className="relative group transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur('email')}
                        className={`w-full px-4 py-4 pl-12 rounded-xl border ${!email && touched.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all focus:bg-white shadow-sm text-gray-900`}
                        placeholder="you@company.com"
                      />
                      <label 
                        htmlFor="email" 
                        className={`absolute text-sm font-medium transition-all duration-300 ${email ? '-top-6 left-0 text-gray-700' : 'top-4 left-12 text-gray-500'}`}
                      >
                        Work Email
                      </label>
                      {!email && touched.email && (
                        <div className="text-red-500 text-xs mt-1 ml-1">Please enter your email</div>
                      )}
                    </div>

                    <div className="relative group transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur('password')}
                        className={`w-full px-4 py-4 pl-12 rounded-xl border ${!password && touched.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all focus:bg-white shadow-sm text-gray-900`}
                        placeholder="••••••••"
                      />
                      <label 
                        htmlFor="password" 
                        className={`absolute text-sm font-medium transition-all duration-300 ${password ? '-top-6 left-0 text-gray-700' : 'top-4 left-12 text-gray-500'}`}
                      >
                        Password
                      </label>
                      {!password && touched.password ? (
                        <div className="text-red-500 text-xs mt-1 ml-1">Please enter a password</div>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500 ml-1">
                          Must be at least 8 characters with a number and a special character
                        </p>
                      )}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="relative group transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <select
                        id="role"
                        name="role"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        onBlur={() => handleBlur('role')}
                        className={`w-full px-4 py-4 pl-12 rounded-xl border ${!role && touched.role ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all focus:bg-white shadow-sm text-gray-900 appearance-none`}
                      >
                        <option value="" disabled>Select your role</option>
                        {roles.map((roleOption) => (
                          <option key={roleOption.id} value={roleOption.id}>
                            {roleOption.name}
                          </option>
                        ))}
                      </select>
                      <label 
                        htmlFor="role" 
                        className={`absolute text-sm font-medium transition-all duration-300 ${role ? '-top-6 left-0 text-gray-700' : 'top-4 left-12 text-gray-500'}`}
                      >
                        What's your role?
                      </label>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {!role && touched.role && (
                        <div className="text-red-500 text-xs mt-1 ml-1">Please select your role</div>
                      )}
                    </div>

                    <div className="relative group transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <select
                        id="usageIntent"
                        name="usageIntent"
                        required
                        value={usageIntent}
                        onChange={(e) => setUsageIntent(e.target.value)}
                        onBlur={() => handleBlur('usageIntent')}
                        className={`w-full px-4 py-4 pl-12 rounded-xl border ${!usageIntent && touched.usageIntent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all focus:bg-white shadow-sm text-gray-900 appearance-none`}
                      >
                        <option value="" disabled>Select option</option>
                        {usageOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                      <label 
                        htmlFor="usageIntent" 
                        className={`absolute text-sm font-medium transition-all duration-300 ${usageIntent ? '-top-6 left-0 text-gray-700' : 'top-4 left-12 text-gray-500'}`}
                      >
                        How do you plan on using Zeiro?
                      </label>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {!usageIntent && touched.usageIntent && (
                        <div className="text-red-500 text-xs mt-1 ml-1">Please select how you plan to use Zeiro</div>
                      )}
                    </div>
                  </>
                )}

                <div className="pt-4 flex flex-col md:flex-row gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="py-4 px-6 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 md:w-auto w-full"
                    >
                      Back
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`relative overflow-hidden group py-4 px-8 rounded-xl font-medium flex-1 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
                      isLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:shadow-lg hover:shadow-yellow-200/50 transition-all'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      <>
                        {step === 2 ? (
                          <>
                            Create account
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </>
                        ) : (
                          'Continue'
                        )}
                      </>
                    )}
                    <span className="absolute inset-0 h-full w-full scale-0 rounded-xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></span>
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-yellow-600 hover:text-yellow-700 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-yellow-600 hover:text-yellow-700">Terms of Service</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-yellow-600 hover:text-yellow-700">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Right side - Brand Section */}
        <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-amber-500 to-yellow-400 order-1 lg:order-2 transition-all duration-1000 ease-out ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Zero Symbols Background */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i}
                className={`absolute text-[200px] font-bold text-white transition-opacity duration-1000 ${animateIn ? 'opacity-10' : 'opacity-0'}`}
                style={{
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: 0.1,
                  transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() + 0.5})`,
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                0
              </div>
            ))}
            
            <div className={`absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 text-white text-center p-8 transition-all duration-1000 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/40 shadow-xl">
                <span className="text-6xl font-bold">Z</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">Join Zeiro Today</h2>
              <p className="text-xl text-white/80 max-w-md">
                Start working with your data with zero complexity and maximum productivity
              </p>
            </div>
          </div>

          {/* Floating cards with animation */}
          <div className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[400px] h-[250px] perspective-1000 transition-all duration-1000 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '300ms' }}>
            <div className="absolute top-0 left-0 w-full h-full transform rotate-3 transition-transform bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 p-4 shadow-xl hover:rotate-1 duration-300">
              <div className="w-12 h-12 bg-white/30 rounded-xl mb-4"></div>
              <div className="h-4 w-3/4 bg-white/30 rounded-full mb-3"></div>
              <div className="h-4 w-1/2 bg-white/30 rounded-full"></div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full transform -rotate-6 transition-transform bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 p-4 shadow-xl hover:-rotate-2 duration-300">
              <div className="w-12 h-12 bg-white/30 rounded-xl mb-4"></div>
              <div className="h-4 w-3/4 bg-white/30 rounded-full mb-3"></div>
              <div className="h-4 w-1/2 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Floating geometric shapes with animations */}
          <div className={`absolute bottom-20 left-10 w-32 h-32 bg-white/10 rounded-2xl rotate-12 transition-transform duration-1000 ease-out ${animateIn ? 'translate-x-0' : '-translate-x-full'}`} style={{ transitionDelay: '200ms' }}></div>
          <div className={`absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full transition-transform duration-1000 ease-out ${animateIn ? 'translate-x-0' : 'translate-x-full'}`} style={{ transitionDelay: '300ms' }}></div>
          <div className={`absolute bottom-32 right-10 w-36 h-36 bg-white/10 rounded-2xl rotate-45 transition-transform duration-1000 ease-out ${animateIn ? 'translate-y-0' : 'translate-y-full'}`} style={{ transitionDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
} 