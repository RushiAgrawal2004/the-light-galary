import React from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../types.ts';
import StarRating from './StarRating.tsx';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <Link to={`/profile/${profile.id}`} className="group block overflow-hidden">
      <div className="relative aspect-[3/4]">
        <img 
          src={profile.profilePictureUrl} 
          alt={profile.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-300"></div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-serif font-medium">{profile.name}</h3>
        <p className="text-sm text-brand-secondary">{profile.role}</p>
        {profile.averageRating > 0 && (
          <div className="flex justify-center mt-1">
            <StarRating rating={profile.averageRating} />
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProfileCard;
