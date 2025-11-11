import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { fetchProfileByUserId, postGig } from '../services/mockApiService.ts';
import Button from '../components/Button.tsx';
import { Profile, Role, Gig } from '../types.ts';

const ROLES: Role[] = ['Model', 'Photographer', 'Makeup Artist', 'Set Artist', 'Artist'];

const CreateGigPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roleSought, setRoleSought] = useState<Role>('Model');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [payment, setPayment] = useState('');
  
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await fetchProfileByUserId(user.id);
        if (profile) {
          setUserProfile(profile);
        } else {
            setError('You must create a profile before posting an opportunity.');
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
        setError('Could not find your profile to post this opportunity.');
        return;
    }
    setSaving(true);
    setError('');

    const gigData: Omit<Gig, 'id'> = {
      title,
      description,
      roleSought,
      location,
      date,
      payment,
      postedByProfileId: userProfile.id,
      posterName: userProfile.name,
      posterProfilePictureUrl: userProfile.profilePictureUrl,
    };
    
    try {
      const savedGig = await postGig(gigData);
      navigate(`/opportunities/${savedGig.id}`);
    } catch (err) {
      console.error("Failed to post gig:", err);
      setError('An error occurred while posting. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  if (error) {
      return (
        <div className="container mx-auto px-6 py-12 max-w-2xl text-center">
            <h1 className="text-2xl font-serif font-medium mb-4 text-red-600">Action Required</h1>
            <p className="text-brand-secondary mb-6">{error}</p>
            {error.includes('create a profile') && <Button to="/edit-profile">Create Your Profile</Button>}
        </div>
      )
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <h1 className="text-4xl font-serif font-medium mb-8">Post an Opportunity</h1>
      <form onSubmit={handleSubmit} className="space-y-6 p-8 border border-brand-border">
        <div>
          <label htmlFor="title" className="block text-sm mb-1 font-medium">Title</label>
          <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border border-brand-border bg-transparent focus:ring-brand-primary focus:border-brand-primary"/>
          <p className="text-xs text-brand-secondary mt-1">e.g., "E-commerce Fashion Shoot"</p>
        </div>

        <div>
            <label htmlFor="description" className="block text-sm mb-1 font-medium">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} required className="w-full p-2 border border-brand-border bg-transparent focus:ring-brand-primary focus:border-brand-primary"></textarea>
            <p className="text-xs text-brand-secondary mt-1">Provide details about the project, requirements, and what you're looking for.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="roleSought" className="block text-sm mb-1 font-medium">Role Sought</label>
                <select id="roleSought" value={roleSought} onChange={e => setRoleSought(e.target.value as Role)} className="w-full p-2 border border-brand-border bg-transparent">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="location" className="block text-sm mb-1 font-medium">Location</label>
                <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} required className="w-full p-2 border border-brand-border bg-transparent"/>
                <p className="text-xs text-brand-secondary mt-1">e.g., "Pune, Maharashtra"</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="date" className="block text-sm mb-1 font-medium">Date(s)</label>
                <input id="date" type="text" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border border-brand-border bg-transparent"/>
                 <p className="text-xs text-brand-secondary mt-1">e.g., "August 15, 2024" or "Flexible"</p>
            </div>
             <div>
                <label htmlFor="payment" className="block text-sm mb-1 font-medium">Payment</label>
                <input id="payment" type="text" value={payment} onChange={e => setPayment(e.target.value)} required className="w-full p-2 border border-brand-border bg-transparent"/>
                <p className="text-xs text-brand-secondary mt-1">e.g., "Paid - ₹15,000" or "TFP/Collaboration"</p>
            </div>
        </div>
        
        <div className="text-right pt-4">
          <Button type="submit" variant="primary" disabled={saving || !userProfile}>
            {saving ? 'Posting...' : 'Post Opportunity'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateGigPage;
