'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import FormContainer from '@/components/FormContainer';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  signUpStep1Schema,
  signUpStep2Schema,
  SignUpStep1FormData,
  SignUpStep2FormData,
  SignUpFormData
} from '@/schemas/auth';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const router = useRouter();
  const { signUpUser } = useAuth();
  
  // Form for step 1
  const step1Form = useForm<SignUpStep1FormData>({
    resolver: zodResolver(signUpStep1Schema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });
  
  // Form for step 2
  const step2Form = useForm<SignUpStep2FormData>({
    resolver: zodResolver(signUpStep2Schema),
    mode: 'onBlur',
    defaultValues: {
      role: '',
      usageIntent: ''
    }
  });

  // Destructure form utilities for current step
  const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 } } = step1Form;
  const { register: registerStep2, handleSubmit: handleSubmitStep2, formState: { errors: errorsStep2 } } = step2Form;
  
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
  
  // Handler for step 1 submission
  const onSubmitStep1 = (data: SignUpStep1FormData) => {
    setStep(2);
  };
  
  // Handler for step 2 and final submission
  const onSubmitStep2 = async (step2Data: SignUpStep2FormData) => {
    try {
      setIsLoading(true);
      
      // Get step 1 data
      const step1Data = step1Form.getValues();
      
      // Combine data from both steps
      const formData: SignUpFormData = {
        ...step1Data,
        ...step2Data
      };
      
      await signUpUser({
        email: formData.email,
        full_name: formData.name,
        password: formData.password,
        role: formData.role,
        usage_intent: formData.usageIntent
      });
      
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    return (step / 2) * 100;
  };
  
  // Form content based on the current step
  const renderFormContent = () => {
    if (step === 1) {
      return (
        <>
          <FormInput
            id="name"
            type="text"
            placeholder="Jane Smith"
            label="Full Name"
            required
            autoComplete="name"
            error={errorsStep1.name?.message}
            {...registerStep1('name')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
          />

          <FormInput
            id="email"
            type="email"
            placeholder="you@company.com"
            label="Work Email"
            required
            autoComplete="email"
            error={errorsStep1.email?.message}
            {...registerStep1('email')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            }
          />

          <FormInput
            id="password"
            type="password"
            placeholder="••••••••"
            label="Password"
            required
            autoComplete="new-password"
            error={errorsStep1.password?.message}
            {...registerStep1('password')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            }
            hint="Must be at least 8 characters with a number and a special character"
          />
        </>
      );
    } else {
      return (
        <>
          <div className="relative mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
              What's your role? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none ${
                errorsStep2.role ? 'text-red-400' : 'text-gray-400'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                id="role"
                className={`w-full px-4 py-3 pl-11 rounded-lg border-2 text-gray-800 ${
                  errorsStep2.role 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/30' 
                    : 'border-gray-200 bg-white/90 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                } shadow-sm outline-none transition-all duration-200 appearance-none`}
                {...registerStep2('role')}
              >
                <option value="" disabled>Select your role</option>
                {roles.map((roleOption) => (
                  <option key={roleOption.id} value={roleOption.id}>
                    {roleOption.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errorsStep2.role && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {errorsStep2.role.message}
              </p>
            )}
          </div>

          <div className="relative mb-6">
            <label htmlFor="usageIntent" className="block text-sm font-medium text-gray-700 mb-1.5">
              How do you plan on using Zeiro? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none ${
                errorsStep2.usageIntent ? 'text-red-400' : 'text-gray-400'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                id="usageIntent"
                className={`w-full px-4 py-3 pl-11 rounded-lg border-2 text-gray-800 ${
                  errorsStep2.usageIntent 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/30' 
                    : 'border-gray-200 bg-white/90 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                } shadow-sm outline-none transition-all duration-200 appearance-none`}
                {...registerStep2('usageIntent')}
              >
                <option value="" disabled>Select option</option>
                {usageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errorsStep2.usageIntent && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {errorsStep2.usageIntent.message}
              </p>
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className={`w-full transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="max-w-md mx-auto">
        <FormContainer 
          title={step === 1 ? "Create your account" : "Tell us about yourself"}
          subtitle={step === 1 ? "Join thousands of teams using Zeiro" : "Help us customize your experience"}
          onSubmit={step === 1 ? handleSubmitStep1(onSubmitStep1) : handleSubmitStep2(onSubmitStep2)}
          showBorder={true}
        >
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full mb-6 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-purple-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>

          {/* Form content */}
          {renderFormContent()}

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
            
            <Button
              type="submit"
              variant="primary"
              fullWidth={step === 1}
              isLoading={isLoading}
              rightIcon={step === 2 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : undefined}
            >
              {step === 1 ? 'Continue' : 'Create account'}
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/auth/in" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </FormContainer>
        
        <p className="text-center text-xs text-white mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-white/90 hover:text-white underline">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-white/90 hover:text-white underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
} 