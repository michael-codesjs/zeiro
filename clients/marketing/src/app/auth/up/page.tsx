'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import Input from '@/components/input';
import Select from '@/components/select';
import Button from '../../components/button';
import FormCard from '@/components/form-card';
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
  const { 
    register: registerStep2, 
    handleSubmit: handleSubmitStep2, 
    formState: { errors: errorsStep2 },
    watch: watchStep2,
    setValue: setValueStep2
  } = step2Form;
  
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

  // Form content based on the current step
  const renderFormContent = () => {
    if (step === 1) {
      return (
        <>
          <Input
            id="name"
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            autoComplete="name"
            variant="modern"
            labelVariant="bold"
            size="lg"
            required
            error={errorsStep1.name?.message}
            {...registerStep1('name')}
          />

          <Input
            id="email"
            type="email"
            label="Work Email"
            placeholder="you@company.com"
            autoComplete="email"
            variant="modern"
            labelVariant="bold"
            size="lg"
            required
            error={errorsStep1.email?.message}
            {...registerStep1('email')}
          />

          <Input
            id="password"
            label="Password"
            placeholder="Create a secure password"
            autoComplete="new-password"
            variant="password"
            labelVariant="bold"
            size="lg"
            required
            error={errorsStep1.password?.message}
            hint="Must be at least 8 characters with a number and a special character"
            {...registerStep1('password')}
          />
        </>
      );
    } else {
      return (
        <>
          <Select
            label="What's your role?"
            placeholder="Choose your role"
            variant="modern"
            labelVariant="bold"
            size="lg"
            required
            error={errorsStep2.role?.message}
            options={roles.map(role => ({ value: role.id, label: role.name }))}
            value={watchStep2('role')}
            onChange={(value) => setValueStep2('role', value)}
            name="role"
          />

          <Select
            label="How do you plan on using Zeiro?"
            placeholder="Select your primary use case"
            variant="modern"
            labelVariant="bold"
            size="lg"
            required
            error={errorsStep2.usageIntent?.message}
            options={usageOptions.map(option => ({ value: option.id, label: option.name }))}
            value={watchStep2('usageIntent')}
            onChange={(value) => setValueStep2('usageIntent', value)}
            name="usageIntent"
          />
        </>
      );
    }
  };

  return (
    <div className={`w-full transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {step === 1 ? "Create your account" : "Tell us about yourself"}
        </h1>
        <p className="text-lg text-gray-400">
          {step === 1 ? "Join thousands of teams using Zeiro" : "Help us customize your experience"}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <FormCard variant="glass" size="lg" spacing="normal">
          <form onSubmit={step === 1 ? handleSubmitStep1(onSubmitStep1) : handleSubmitStep2(onSubmitStep2)} className="space-y-6">
            {/* Form content */}
            {renderFormContent()}

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading}
                isLoading={isLoading}
                loadingText={step === 1 ? 'Creating...' : 'Setting up...'}
              >
                {step === 1 ? 'Continue' : 'Create account'}
              </Button>
              
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              )}
            </div>
          </form>
        </FormCard>
        
        <div className="mt-3 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/in" className="text-white hover:text-gray-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-gray-400 hover:text-white underline transition-colors">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-400 hover:text-white underline transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
} 