
import React from 'react';

interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const IconCard: React.FC<IconCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center max-w-xs mx-auto">
      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-brand-background border-2 border-brand-border rounded-full">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-serif font-semibold">{title}</h3>
      <p className="text-brand-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default IconCard;
