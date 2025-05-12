'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateIn(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', { email, password, rememberMe });
      setIsLoading(false);
      // Implement actual login logic here
    }, 1500);
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
        {/* Left side - Brand Section */}
        <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 transition-all duration-1000 ease-out ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Zero Symbols Background */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i}
                className={`absolute text-[200px] font-bold text-white transition-all duration-1000 ease-out ${animateIn ? 'opacity-10' : 'opacity-0'}`}
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
              <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
              <p className="text-xl text-white/80 max-w-md">
                Access your databases with Zero complexity and Zero learning curve
              </p>
            </div>
          </div>

          {/* Floating geometric shapes with animations */}
          <div className={`absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-2xl rotate-12 transition-transform duration-1000 ease-out ${animateIn ? 'translate-x-0' : '-translate-x-full'}`} style={{ transitionDelay: '200ms' }}></div>
          <div className={`absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full transition-transform duration-1000 ease-out ${animateIn ? 'translate-x-0' : 'translate-x-full'}`} style={{ transitionDelay: '300ms' }}></div>
          <div className={`absolute bottom-20 right-40 w-36 h-36 bg-white/10 rounded-2xl rotate-45 transition-transform duration-1000 ease-out ${animateIn ? 'translate-y-0' : 'translate-y-full'}`} style={{ transitionDelay: '400ms' }}></div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300 rounded-full filter blur-3xl opacity-20"></div>
          </div>
          
          <div className={`w-full max-w-md transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100 shadow-yellow-100/20 backdrop-blur-sm hover:shadow-yellow-200/30 transition-all duration-300">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome back</h1>
                <p className="text-gray-600">Sign in to access your Zeiro workspace</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group relative transition-all duration-300">
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
                    className="w-full px-4 py-4 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white shadow-sm text-gray-900"
                    placeholder="you@company.com"
                  />
                  {!email && <div className="tooltip absolute left-[105%] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block w-40 z-10">Please enter your email</div>}
                </div>

                <div className="group relative transition-all duration-300">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white shadow-sm text-gray-900"
                    placeholder="••••••••"
                  />
                  {!password && <div className="tooltip absolute left-[105%] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block w-40 z-10">Please enter your password</div>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative w-10 h-5 inline-flex">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="opacity-0 w-0 h-0 absolute"
                      />
                      <span 
                        className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                          rememberMe ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}
                        onClick={() => setRememberMe(!rememberMe)}
                      >
                        <span 
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                            rememberMe ? 'translate-x-4' : ''
                          }`}
                        ></span>
                      </span>
                    </div>
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full relative overflow-hidden group py-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
                      isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:shadow-lg hover:shadow-yellow-200/50 transition-all'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </span>
                    <span className="absolute inset-0 h-full w-full scale-0 rounded-xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></span>
                  </button>
                </div>
              </form>

              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-600 text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="font-medium text-yellow-600 hover:text-yellow-700 transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            {/* Animated accent dots */}
            <div className="absolute -right-10 top-20 w-20 h-20">
              <div className={`h-2 w-2 bg-yellow-400 rounded-full absolute transition-all duration-700 ${animateIn ? 'opacity-80' : 'opacity-0'}`} style={{ top: '40%', left: '25%', transitionDelay: '100ms' }}></div>
              <div className={`h-3 w-3 bg-amber-500 rounded-full absolute transition-all duration-700 ${animateIn ? 'opacity-60' : 'opacity-0'}`} style={{ top: '60%', left: '55%', transitionDelay: '200ms' }}></div>
              <div className={`h-1.5 w-1.5 bg-yellow-300 rounded-full absolute transition-all duration-700 ${animateIn ? 'opacity-70' : 'opacity-0'}`} style={{ top: '30%', left: '65%', transitionDelay: '300ms' }}></div>
            </div>
            
            <div className="absolute -left-10 bottom-20 w-20 h-20">
              <div className={`h-2 w-2 bg-yellow-400 rounded-full absolute transition-all duration-700 ${animateIn ? 'opacity-80' : 'opacity-0'}`} style={{ top: '30%', left: '45%', transitionDelay: '150ms' }}></div>
              <div className={`h-3 w-3 bg-amber-500 rounded-full absolute transition-all duration-700 ${animateIn ? 'opacity-60' : 'opacity-0'}`} style={{ top: '70%', left: '25%', transitionDelay: '250ms' }}></div>
              <div className={`h-1.5 w-1.5 bg-yellow-300 rounded-full absolute transition-all duration-700 ${animateIn ? 'opacity-70' : 'opacity-0'}`} style={{ top: '40%', left: '75%', transitionDelay: '350ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 