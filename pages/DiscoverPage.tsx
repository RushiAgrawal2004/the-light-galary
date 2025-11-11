import React, { useState, useEffect } from 'react';
import { Profile, Role } from '../types.ts';
import { fetchProfiles } from '../services/mockApiService.ts';
import ProfileCard from '../components/ProfileCard.tsx';

const ROLES: Role[] = ['Model', 'Photographer', 'Makeup Artist', 'Set Artist', 'Artist'];

const DiscoverPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Role | 'All'>('All');

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await fetchProfiles();
        setProfiles(data);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const filteredProfiles = activeFilter === 'All' 
    ? profiles 
    : profiles.filter(p => p.role === activeFilter);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-medium">The Gallery</h1>
        <p className="text-lg text-brand-secondary mt-2">Discover unique talent and authentic portfolios.</p>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex justify-center flex-wrap gap-2 mb-12">
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-4 py-2 text-sm border rounded-full transition-colors ${
            activeFilter === 'All'
              ? 'bg-brand-primary text-brand-background border-brand-primary'
              : 'bg-transparent text-brand-primary border-brand-border hover:bg-brand-primary/10'
          }`}
        >
          All
        </button>
        {ROLES.map(role => (
          <button
            key={role}
            onClick={() => setActiveFilter(role)}
            className={`px-4 py-2 text-sm border rounded-full transition-colors ${
              activeFilter === role
                ? 'bg-brand-primary text-brand-background border-brand-primary'
                : 'bg-transparent text-brand-primary border-brand-border hover:bg-brand-primary/10'
            }`}
          >
            {role}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProfiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage;
