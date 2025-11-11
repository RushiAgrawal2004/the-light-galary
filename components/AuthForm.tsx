import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { mockSignUp } from '../services/mockApiService.ts';
import Button from './Button.tsx';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const isSignUp = mode === 'signup';
  const title = isSignUp ? 'Join The Gallery' : 'Welcome Back';
  const subtitle = isSignUp ? 'Create your account to begin.' : 'Sign in to access your profile.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await mockSignUp(name, email, password);
        // After sign up, log them in automatically
        const user = await login(email, password);
        if (user) navigate('/edit-profile');
      } else {
        const user = await login(email, password);
        if (user) navigate('/discover');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 md:p-12 border border-brand-border">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold mb-2">{title}</h1>
        <p className="text-brand-secondary mb-8">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-text mb-1">Full Name</label>
            <input 
              id="name" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              className="w-full px-4 py-2 border border-brand-border bg-brand-background focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-1">Email Address</label>
          <input 
            id="email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-brand-border bg-brand-background focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>
        <div>
          <label htmlFor="password"  className="block text-sm font-medium text-brand-text mb-1">Password</label>
          <input 
            id="password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-brand-border bg-brand-background focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        
        <div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-brand-secondary">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={isSignUp ? '/signin' : '/signup'} className="font-medium text-brand-primary hover:underline">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
