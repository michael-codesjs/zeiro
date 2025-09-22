'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import Input from '@/components/input';
import FormCard from '@/components/form-card';
import { useAuth } from '@/hooks/useAuth';
import { buttonVariants } from '@/components/Button';

// Sign-in form schema
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

interface SignInFormData {
  email: string;
  password: string;
}

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
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome back
        </h1>
        <p className="text-xl text-gray-400">
          Sign in to your Zeiro account
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <FormCard variant="glass" size="lg" spacing="normal">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@company.com"
              autoComplete="email"
              variant="modern"
              labelVariant="bold"
              size="lg"
              disabled={isLoading}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              variant="modern"
              labelVariant="bold"
              size="lg"
              disabled={isLoading}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link 
                href="/auth/forgot-password" 
                className={`text-sm text-gray-400 hover:text-white transition-colors ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                tabIndex={isLoading ? -1 : 0}
                aria-disabled={isLoading}
              >
                Forgot password?
              </Link>
            </div>

            <div className="">
              <button
                type="submit"
                disabled={isLoading}
                className={buttonVariants({ variant: "primary", className: "w-full" })}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </FormCard>

        <div className="pt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/up" 
              className={`text-white hover:text-gray-300 transition-colors font-medium ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
              tabIndex={isLoading ? -1 : 0}
              aria-disabled={isLoading}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 