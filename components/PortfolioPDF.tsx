
import React, { forwardRef } from 'react';
import { Profile } from '../types.ts';

interface PortfolioPDFProps {
  profile: Profile;
}

const PortfolioPDF = forwardRef<HTMLDivElement, PortfolioPDFProps>(({ profile }, ref) => {
  return (
    <div 
      ref={ref} 
      className="bg-white text-black font-sans p-10" 
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      <header className="text-center border-b pb-4 mb-8">
        <h1 className="text-lg font-serif tracking-widest text-gray-600">
          THE GALLERY OF LIGHT
        </h1>
      </header>
      
      <main>
        {/* Profile Header */}
        <section className="flex items-start gap-8 mb-8">
          <div className="w-1/3 flex-shrink-0">
            <img 
              src={profile.profilePictureUrl} 
              alt={profile.name} 
              className="w-full aspect-[3/4] object-cover"
            />
          </div>
          <div className="flex-grow">
            <h2 className="text-4xl font-serif font-bold text-gray-800">{profile.name}</h2>
            <p className="text-xl font-serif text-gray-500 -mt-1 mb-4">{profile.role}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>

            {profile.role === 'Model' && (
              <div className="mt-6 border-t pt-4 space-y-1 text-xs text-gray-700">
                <div className="flex justify-between"><span>Height:</span> <span>{profile.height}</span></div>
                <div className="flex justify-between"><span>Weight:</span> <span>{profile.weight}</span></div>
                <div className="flex justify-between"><span>Eyes:</span> <span>{profile.eyeColor}</span></div>
                <div className="flex justify-between"><span>Hair:</span> <span>{profile.hairColor}</span></div>
              </div>
            )}
          </div>
        </section>

        {/* Portfolio Section */}
        <section>
          <h3 className="text-2xl font-serif font-semibold text-center text-gray-800 border-b pb-2 mb-8">
            Portfolio
          </h3>
          <div className="space-y-8">
            {profile.portfolio.map(image => (
              <div key={image.id} className="page-break-inside-avoid">
                <img 
                  src={image.url} 
                  alt={image.caption} 
                  className="w-full object-cover"
                />
                <p className="text-center text-sm text-gray-500 mt-2 italic">{image.caption}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
});

export default PortfolioPDF;