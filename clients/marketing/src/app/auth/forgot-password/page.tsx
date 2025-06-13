'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import FormContainer from '@/components/FormContainer';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

// Forgot password form schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  // React Hook Form setup
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  // Animation effect
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Get the current email value
  const email = watch('email');

  // Handle forgot password form submission
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      // In a real implementation, we would call the AWS Amplify API here
      // Example: await resetPassword({ username: data.email });
      
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password reset instructions sent to your email');
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="max-w-md mx-auto">
        <FormContainer
          title="Reset your password"
          subtitle={isSubmitted ? "Check your email" : "We'll send you instructions to reset your password"}
          onSubmit={handleSubmit(onSubmit)}
          showBorder={true}
        >
          {!isSubmitted ? (
            <>
              <FormInput
                id="email"
                type="email"
                placeholder="you@company.com"
                label="Email"
                required
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
                disabled={isLoading}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                loadingText="Sending Reset Instructions..."
                className="mt-6"
              >
                Send Reset Instructions
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 mb-6">
                We've sent reset instructions to <strong>{email}</strong>. Please check your email and follow the instructions to reset your password.
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/auth/in')}
              >
                Back to Sign In
              </Button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{' '}
              <Link 
                href="/auth/in" 
                className={`font-medium text-indigo-600 hover:text-indigo-700 transition-colors ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                tabIndex={isLoading ? -1 : 0}
                aria-disabled={isLoading}
              >
                Sign in
              </Link>
            </p>
          </div>
        </FormContainer>
      </div>
    </div>
  );
} 