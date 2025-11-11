import React from 'react';
import { Link } from 'react-router-dom';
import { Gig } from '../types.ts';
import { MapPin, Calendar, IndianRupee } from 'lucide-react';

interface GigCardProps {
  gig: Gig;
}

const GigCard: React.FC<GigCardProps> = ({ gig }) => {
  return (
    <Link 
      to={`/opportunities/${gig.id}`} 
      className="group block p-6 border border-brand-border hover:border-brand-primary transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <img 
          src={gig.posterProfilePictureUrl} 
          alt={gig.posterName}
          className="w-12 h-12 object-cover rounded-full flex-shrink-0" 
        />
        <div className="flex-grow">
          <p className="text-sm text-brand-secondary">
            Posted by {gig.posterName}
          </p>
          <h3 className="text-xl font-serif font-medium leading-tight mt-1 group-hover:text-brand-primary transition-colors">
            {gig.title}
          </h3>
          <p className="text-sm font-semibold text-brand-primary mt-2">
            Seeking: {gig.roleSought}
          </p>
        </div>
      </div>
      <div className="border-t border-brand-border mt-4 pt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-secondary">
        <span className="flex items-center gap-1.5">
          <MapPin size={14} /> {gig.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {gig.date}
        </span>
        <span className="flex items-center gap-1.5">
          <IndianRupee size={14} /> {gig.payment}
        </span>
      </div>
    </Link>
  );
};

export default GigCard;
