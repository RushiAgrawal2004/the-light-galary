import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gig, Role } from '../types.ts';
import { fetchGigs } from '../services/mockApiService.ts';
import GigCard from '../components/GigCard.tsx';
import Button from '../components/Button.tsx';
import { Plus } from 'lucide-react';

const ROLES: Role[] = ['Model', 'Photographer', 'Makeup Artist', 'Set Artist', 'Artist'];

const GigsPage: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Role | 'All'>('All');

  useEffect(() => {
    const loadGigs = async () => {
      try {
        const data = await fetchGigs();
        setGigs(data);
      } catch (error) {
        console.error("Failed to fetch gigs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGigs();
  }, []);

  const filteredGigs = activeFilter === 'All' 
    ? gigs 
    : gigs.filter(p => p.roleSought === activeFilter);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p>Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-12">
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-medium">Opportunities</h1>
          <p className="text-lg text-brand-secondary mt-2">Find your next creative project or collaboration.</p>
        </div>
        <Button to="/post-opportunity" icon={<Plus size={16}/>}>
          Post an Opportunity
        </Button>
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
          All Roles
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGigs.length > 0 ? (
          filteredGigs.map(gig => (
            <GigCard key={gig.id} gig={gig} />
          ))
        ) : (
          <p className="md:col-span-3 text-center text-brand-secondary">
            No opportunities found for the selected role.
          </p>
        )}
      </div>
    </div>
  );
};

export default GigsPage;
