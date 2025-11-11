import React from 'react';
import AuthForm from '../components/AuthForm.tsx';

const SignInPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-20">
      <AuthForm mode="signin" />
    </div>
  );
};

export default SignInPage;
