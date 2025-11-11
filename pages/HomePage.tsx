import React from 'react';
import { User, Camera, ArrowRight, Briefcase } from 'lucide-react';
import Button from '../components/Button.tsx';
import IconCard from '../components/IconCard.tsx';

const HomePage: React.FC = () => {
  const iconProps = {
    color: "#6B4F41",
    size: 28,
  }
  return (
    <div className="container mx-auto px-6">
      {/* Hero Section */}
      <section className="text-center py-24 md:py-40">
        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-6">
          A quiet digital space for art, beauty, and individuality
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-brand-secondary mb-10">
          For independent models and photographers in Pune and Maharashtra — a
          haven to showcase your work without the noise of social media.
        </p>
        <div className="flex justify-center items-center space-x-4">
          <Button to="/signup" variant="primary" icon={<User size={16} />}>
            Join The Community
          </Button>
          <Button to="/discover" variant="secondary" icon={<Camera size={16} />}>
            Explore the Gallery
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-brand-border">
        <div className="grid md:grid-cols-3 gap-12">
          <IconCard 
            icon={<User {...iconProps} />}
            title="Your Digital Canvas"
            description="Create an elegant portfolio with your photos, reels, and story. No algorithms, no pressure — just you and your art."
          />
          <IconCard 
            icon={<Briefcase {...iconProps} />}
            title="Find Opportunities"
            description="Discover and post gigs, collaborations, and paid shoots. Connect with creatives for your next project."
          />
          <IconCard 
            icon={<ArrowRight {...iconProps} />}
            title="Stay True"
            description="No likes, no vanity metrics. Just meaningful connections and opportunities that resonate with your creative vision."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-24 border-t border-brand-border">
        <h2 className="text-4xl md:text-5xl font-serif font-medium mb-4">
          Ready to begin?
        </h2>
        <p className="text-lg text-brand-secondary mb-8">
          Join a community of creative souls in Pune and Maharashtra
        </p>
        <Button to="/signup" variant="primary" icon={<ArrowRight size={16} />}>
          Create Your Profile
        </Button>
      </section>
    </div>
  );
};

export default HomePage;
