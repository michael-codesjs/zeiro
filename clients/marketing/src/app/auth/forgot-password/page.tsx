'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import Input from '@/components/input';
import Button from '../../components/button';
import FormCard from '@/components/form-card';

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
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Reset your password
        </h1>
        <p className="text-xl text-gray-400">
          {isSubmitted ? "Check your email" : "We'll send you instructions to reset your password"}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {!isSubmitted ? (
          <FormCard variant="subtle" size="lg" spacing="normal">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="you@company.com"
                autoComplete="email"
                variant="minimal"
                labelVariant="bold"
                size="lg"
                disabled={isLoading}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isLoading}
                  isLoading={isLoading}
                  loadingText="Sending Reset Instructions..."
                >
                  Send Reset Instructions
                </Button>
              </div>
            </form>
          </FormCard>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300 mb-8 text-lg">
              We've sent reset instructions to <strong className="text-white">{email}</strong>. Please check your email and follow the instructions to reset your password.
            </p>
            <CtaButton
              type="button"
              variant="primary"
              size="md"
              onClick={() => router.push('/auth/in')}
            >
              Back to Sign In
            </CtaButton>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            Remember your password?{' '}
            <Link 
              href="/auth/in" 
              className={`text-white hover:text-gray-300 transition-colors font-medium ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
              tabIndex={isLoading ? -1 : 0}
              aria-disabled={isLoading}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 