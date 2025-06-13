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
import { useAuth } from '@/hooks/useAuth';

// Sign-in form schema
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const router = useRouter();
  const { signInUser } = useAuth();

  // React Hook Form setup
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Animation effect
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Handle sign-in form submission
  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      // Use the signInUser method from useAuth hook
     await signInUser({ username: data.email, password: data.password });
      
    
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message.includes('User is not confirmed')) {
        toast.error('Your account is not verified. Please check your email for verification code.');
        router.push(`/auth/code?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="max-w-md mx-auto">
        <FormContainer
          title="Welcome back"
          subtitle="Sign in to your Zeiro account"
          onSubmit={handleSubmit(onSubmit)}
          showBorder={true}
        >
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

          <div className="mt-6 mb-2">
            <FormInput
              id="password"
              type="password"
              placeholder="••••••••"
              label="Password"
              required
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
              disabled={isLoading}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>

          <div className="flex justify-end mt-2 mb-6">
            <Link 
              href="/auth/forgot-password" 
              className={`text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
              tabIndex={isLoading ? -1 : 0}
              aria-disabled={isLoading}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Signing In..."
          >
            Sign In
          </Button>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/up" 
                className={`font-medium text-indigo-600 hover:text-indigo-700 transition-colors ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                tabIndex={isLoading ? -1 : 0}
                aria-disabled={isLoading}
              >
                Sign up
              </Link>
            </p>
          </div>
        </FormContainer>
      </div>
    </div>
  );
} 