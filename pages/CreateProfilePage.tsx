import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { fetchProfileByUserId, saveProfile } from '../services/mockApiService.ts';
import { generateBio } from '../services/geminiService.ts';
import { fileToBase64 } from '../utils/fileUtils.ts';
import Button from '../components/Button.tsx';
import { Profile, PortfolioImage, Role } from '../types.ts';
import { X, PlusCircle } from 'lucide-react';

const ROLES: Role[] = ['Model', 'Photographer', 'Makeup Artist', 'Set Artist', 'Artist'];

const EditProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Model');
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('https://picsum.photos/600/800');
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  
  const [bioKeywords, setBioKeywords] = useState('');
  const [generatingBio, setGeneratingBio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setName(user.name);
        const existingProfile = await fetchProfileByUserId(user.id);
        if (existingProfile) {
          setName(existingProfile.name);
          setRole(existingProfile.role);
          setBio(existingProfile.bio);
          setHeight(existingProfile.height);
          setWeight(existingProfile.weight);
          setEyeColor(existingProfile.eyeColor);
          setHairColor(existingProfile.hairColor);
          setProfilePictureUrl(existingProfile.profilePictureUrl);
          setPortfolio(existingProfile.portfolio);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleGenerateBio = async () => {
    if (!bioKeywords) return;
    setGeneratingBio(true);
    try {
      const newBio = await generateBio(bioKeywords);
      setBio(newBio);
    } catch (error) {
      console.error(error);
      setBio("Failed to generate bio. Please try again.");
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setProfilePictureUrl(base64);
    }
  };
  
  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      const newImage: PortfolioImage = {
        id: `temp-${Date.now()}`,
        url: base64,
        caption: ''
      };
      setPortfolio(prev => [...prev, newImage]);
    }
  };

  const handleUpdatePortfolioCaption = (id: string, caption: string) => {
    setPortfolio(prevPortfolio => 
        prevPortfolio.map(img => img.id === id ? { ...img, caption } : img)
    );
  };

  const handleRemovePortfolioImage = (id: string) => {
      setPortfolio(prevPortfolio => prevPortfolio.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const profileData: Omit<Profile, 'id' | 'userId' | 'reviews' | 'averageRating' | 'contactInfo'> = {
      name, role, bio, height, weight, eyeColor, hairColor, profilePictureUrl, portfolio
    };
    
    try {
      const saved = await saveProfile(profileData, user);
      navigate(`/profile/${saved.id}`);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading profile editor...</div>;

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-medium mb-8">Edit Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="p-6 border border-brand-border">
          <h2 className="text-xl font-serif mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm mb-1">Full Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-brand-border bg-transparent"/>
              </div>
               <div>
                <label htmlFor="role" className="block text-sm mb-1">Your Role</label>
                <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className="w-full p-2 border border-brand-border bg-transparent">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
             <div>
              <label className="block text-sm mb-1">Profile Picture</label>
              <img src={profilePictureUrl} alt="Profile preview" className="w-32 h-40 object-cover mb-2" />
              <input type="file" onChange={handleProfilePicUpload} accept="image/*" className="text-sm" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-brand-border">
           <h2 className="text-xl font-serif mb-4">Biography</h2>
           <p className="text-sm text-brand-secondary mb-4">Write your bio or use our AI assistant to help you.</p>
           <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full p-2 border border-brand-border bg-transparent mb-4"></textarea>
           <div className="flex items-center gap-4">
              <input type="text" placeholder="e.g., 'avant-garde, minimalist, ethereal'" value={bioKeywords} onChange={e => setBioKeywords(e.target.value)} className="flex-grow p-2 border border-brand-border bg-transparent"/>
              <Button type="button" onClick={handleGenerateBio} disabled={generatingBio || !bioKeywords}>
                {generatingBio ? 'Generating...' : '✨ Generate with AI'}
              </Button>
           </div>
        </div>

        {role === 'Model' && (
          <div className="p-6 border border-brand-border">
            <h2 className="text-xl font-serif mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="height" className="block text-sm mb-1">Height (e.g., 5'10")</label>
                <input id="height" type="text" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-2 border border-brand-border bg-transparent"/>
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm mb-1">Weight (e.g., 125 lbs)</label>
                <input id="weight" type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-2 border border-brand-border bg-transparent"/>
              </div>
              <div>
                <label htmlFor="eyeColor" className="block text-sm mb-1">Eye Color</label>
                <input id="eyeColor" type="text" value={eyeColor} onChange={e => setEyeColor(e.target.value)} className="w-full p-2 border border-brand-border bg-transparent"/>
              </div>
              <div>
                <label htmlFor="hairColor" className="block text-sm mb-1">Hair Color</label>
                <input id="hairColor" type="text" value={hairColor} onChange={e => setHairColor(e.target.value)} className="w-full p-2 border border-brand-border bg-transparent"/>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border border-brand-border">
          <h2 className="text-xl font-serif mb-4">Portfolio Management</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {portfolio.map(img => (
              <div key={img.id} className="space-y-2">
                <div className="relative">
                  <img src={img.url} alt={img.caption || 'Portfolio image'} className="w-full aspect-[3/4] object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolioImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => handleUpdatePortfolioCaption(img.id, e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full p-2 text-sm border border-brand-border bg-transparent"
                />
              </div>
            ))}
            <div>
              <label htmlFor="portfolioUpload" className="flex items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-brand-border hover:border-brand-primary cursor-pointer transition-colors">
                <div className="text-center text-brand-secondary">
                  <PlusCircle size={32} />
                  <span className="mt-2 block text-sm font-semibold">Add Image</span>
                </div>
                <input id="portfolioUpload" type="file" onChange={handlePortfolioUpload} accept="image/*" className="sr-only" />
              </label>
            </div>
          </div>
        </div>

        <div className="text-right">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
