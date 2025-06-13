'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { resendSignUpCode } from 'aws-amplify/auth';

import FormContainer from '@/components/FormContainer';
import PinInput from '@/components/PinInput';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

// Create a client component that safely uses useSearchParams
function VerificationCodeContent() {
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { answerAuthenticationChallenge } = useAuth();
  
  // Default verification code (temporary for development)
  const defaultDevCode = '123456';
  
  // Extract email from URL params
  useEffect(() => {
    const usernameParam = searchParams.get('username');
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  // Pre-fill code with default value
  useEffect(() => {
    setCode(defaultDevCode);
  }, []);

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
      toast.error('Email address is missing. Please try signing up again.');
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

      toast.success('Your account has been verified successfully!');
      
      // Redirect to sign in page after successful verification
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [code, username, answerAuthenticationChallenge]);

  // Handle resend code
  const handleResend = useCallback(async () => {
    if (!username.trim()) {
      toast.error('Email address is missing. Please try signing up again.');
      return;
    }

    setIsResending(true);

    try {
      await resendSignUpCode({
        username: username
      });
      
      toast.success('A new verification code has been sent to your email');
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast.error(error.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  }, [username]);

  // Determine if any action is in progress
  const isActionInProgress = isLoading || isResending;

  return (
    <div className={`w-full transition-all duration-1000 ease-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="max-w-md mx-auto">
        <FormContainer
          title="Verify your account"
          subtitle="Enter the verification code sent to your email"
          onSubmit={handleVerify}
          showBorder={true}
          background="primary"
        >
          {/* Default Code Indicator */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="shrink-0 mr-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-sm text-yellow-800 font-medium">Default Verification Code</div>
                <div className="text-yellow-700">Use code: <span className="font-mono font-bold">{defaultDevCode}</span></div>
              </div>
            </div>
          </div>

          {/* Email information */}
          <div className="mb-8 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center">
              <div className="shrink-0 mr-3">
                <div className="bg-indigo-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-sm text-indigo-800 font-medium">Verification code sent to:</div>
                <div className="text-indigo-700">{username || 'your email address'}</div>
              </div>
            </div>
          </div>

          {/* Pin Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="flex justify-center mt-2 mb-6">
            <button
              type="button"
              className={`text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium ${isActionInProgress ? 'pointer-events-none opacity-50' : ''}`}
              onClick={handleResend}
              disabled={isActionInProgress}
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Verifying..."
            disabled={isResending}
          >
            Verify Account
          </Button>
        </FormContainer>

        <p className="text-center text-xs text-white mt-6">
          Having trouble? Contact <a href="mailto:support@zeiro.com" className="text-white/90 hover:text-white underline">support@zeiro.com</a>
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
        <div className="p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
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