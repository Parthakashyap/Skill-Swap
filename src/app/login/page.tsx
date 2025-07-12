'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-66.8 64.4C314.5 98.4 282.1 80 248 80c-82.6 0-150.2 67.6-150.2 150.2S165.4 406.2 248 406.2c45.5 0 84.3-19.1 113.2-49.8l66.3 65.5C391.2 465.7 326.6 504 248 504z"></path>
    </svg>
);


export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    
    // The signIn function for OAuth providers redirects the user, 
    // so we don't need to handle the result here like with credentials.
    // The redirect will be handled by NextAuth.
    try {
        await signIn('google', { callbackUrl });
    } catch (error) {
         setIsLoading(false);
         toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Could not sign in with Google. Please try again.',
        });
    }
  };

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Join SkillSwap</CardTitle>
          <CardDescription>Sign in to start swapping skills with the community.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button 
              variant="outline" 
              className="w-full h-12 text-base" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
             {isLoading ? 'Redirecting...' : <><GoogleIcon /> Sign in with Google</>}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
