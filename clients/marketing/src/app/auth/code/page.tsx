'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { resendSignUpCode } from 'aws-amplify/auth';
import PinInput from '@/components/PinInput';
import { useAuth } from '@/hooks/useAuth';
import { buttonVariants } from '@/components/Button';

// Create a client component that safely uses useSearchParams
function VerificationCodeContent() {
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [flowType, setFlowType] = useState<'login' | 'signup'>('signup');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { answerAuthenticationChallenge } = useAuth();
  
  // Extract email and flow type from URL params
  useEffect(() => {
    const usernameParam = searchParams.get('username');
    const flowParam = searchParams.get('flow');
    
    if (usernameParam) {
      setUsername(usernameParam);
    }
    
    if (flowParam === 'login' || flowParam === 'signup') {
      setFlowType(flowParam);
    }
  }, [searchParams]);

  // Animation effect
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Handle code verification
  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    if (!username.trim()) {
      const errorMessage = flowType === 'login'
        ? 'Email address is missing. Please try signing in again.'
        : 'Email address is missing. Please try signing up again.';
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      // Call Amplify confirmSignUp
      console.log('code', code)
      await answerAuthenticationChallenge(
        username,
        code,
      );

      const successMessage = flowType === 'login' 
        ? 'Login verification successful!' 
        : 'Your account has been verified successfully!';
      toast.success(successMessage);
      
      // Redirect to sign in page after successful verification
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [code, username, answerAuthenticationChallenge, flowType]);

  // Handle resend code
  const handleResend = useCallback(async () => {
    if (!username.trim()) {
      const errorMessage = flowType === 'login'
        ? 'Email address is missing. Please try signing in again.'
        : 'Email address is missing. Please try signing up again.';
      toast.error(errorMessage);
      return;
    }

    setIsResending(true);

    try {
      await resendSignUpCode({
        username: username
      });
      
      const resendMessage = flowType === 'login'
        ? 'A new login code has been sent to your email'
        : 'A new verification code has been sent to your email';
      toast.success(resendMessage);
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast.error(error.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  }, [username, flowType]);

  // Determine if any action is in progress
  const isActionInProgress = isLoading || isResending;

  // Dynamic content based on flow type
  const getContent = () => {
    if (flowType === 'login') {
      return {
        title: 'Verify your login',
        subtitle: 'Enter the verification code sent to your email to complete your sign-in',
        buttonText: 'Verify & Sign In'
      };
    } else {
      return {
        title: 'Verify your account',
        subtitle: 'Enter the verification code sent to your email to complete your account setup',
        buttonText: 'Verify Account'
      };
    }
  };

  const content = getContent();

  return (
    <div className={`w-full transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {content.title}
        </h1>
        <p className="text-xl text-muted-foreground">
          {content.subtitle}
        </p>
      </div>

      <div className="max-w-md mx-auto">

        {/* Email information */}
        <div className="mb-8 bg-secondary/80 rounded-lg p-4 border border-border">
          <div className="flex items-center">
            <div className="shrink-0 mr-3">
              <div className="bg-muted rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium">Verification code sent to:</div>
              <div className="text-foreground">{username || 'your email address'}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* Pin Input */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-4">
              Verification Code
            </label>
            <PinInput
              length={6}
              onChange={setCode}
              autoFocus
              value={code}
              disabled={isActionInProgress}
            />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${isActionInProgress ? 'pointer-events-none opacity-50' : ''}`}
              onClick={handleResend}
              disabled={isActionInProgress}
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || isResending}
              className={buttonVariants({ variant: "primary", className: "w-full" })}
            >
              {isLoading ? 'Verifying...' : content.buttonText}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Having trouble? Contact <a href="mailto:support@zeiro.com" className="text-muted-foreground hover:text-foreground underline transition-colors">support@zeiro.com</a>
        </p>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingState() {
  return (
    <div className="w-full">
      <div className="max-w-md mx-auto">
        <div className="p-8 bg-card rounded-xl shadow-lg border border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function VerificationCode() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerificationCodeContent />
    </Suspense>
  );
} 