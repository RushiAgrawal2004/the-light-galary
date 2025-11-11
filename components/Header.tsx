import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { fetchProfileByUserId } from '../services/mockApiService.ts';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleProfileClick = async () => {
    if (user) {
      const profile = await fetchProfileByUserId(user.id);
      if (profile) {
        navigate(`/profile/${profile.id}`);
      } else {
        navigate('/edit-profile');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-background/80 backdrop-blur-sm border-b border-brand-border">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif font-semibold tracking-wider text-brand-text">
          The Gallery of Light
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium tracking-wide">
          <Link to="/discover" className="hover:text-brand-primary transition-colors">
            Discover
          </Link>
          <Link to="/opportunities" className="hover:text-brand-primary transition-colors">
            Opportunities
          </Link>
          {isAuthenticated ? (
            <>
              <button onClick={handleProfileClick} className="hover:text-brand-primary transition-colors">
                My Profile
              </button>
              <Link to="/my-agreements" className="hover:text-brand-primary transition-colors">
                My Agreements
              </Link>
              <Link to="/portfolio-shield" className="hover:text-brand-primary transition-colors">
                Portfolio Shield
              </Link>
              <button
                onClick={handleSignOut}
                className="border border-brand-primary text-brand-primary px-4 py-2 hover:bg-brand-primary hover:text-brand-background transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="border border-brand-primary text-brand-primary px-4 py-2 hover:bg-brand-primary hover:text-brand-background transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
