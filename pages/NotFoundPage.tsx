import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.tsx';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-6xl font-serif font-bold text-brand-primary">404</h1>
      <h2 className="text-3xl font-serif mt-4 mb-6">Page Not Found</h2>
      <p className="text-brand-secondary mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button to="/" variant="primary">
        Return to Homepage
      </Button>
    </div>
  );
};

export default NotFoundPage;
