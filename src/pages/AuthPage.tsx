
import React, { useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, ArrowRight, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const { signIn, signUp } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'verification') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 p-8 border border-border rounded-lg shadow-sm bg-card">
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Mail size={16} />
              <span>Email Verification</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground mt-2">
              We've sent you a verification link to activate your account
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-center">
              After verifying your email, you can{' '}
              <Link to="/auth" className="text-primary hover:underline">
                sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8 border border-border rounded-lg shadow-sm bg-card">
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>Thought Garden</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'signup' 
              ? 'Sign up to start organizing your thoughts' 
              : 'Sign in to your account to continue'}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              <>
                {mode === 'signup' ? 'Create account' : 'Sign in'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <Link to="/auth" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <Link to="/auth?mode=signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
