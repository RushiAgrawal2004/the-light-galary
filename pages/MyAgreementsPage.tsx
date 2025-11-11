import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { fetchAgreementsByProfileId, fetchProfileByUserId } from '../services/mockApiService.ts';
import { Agreement, Profile } from '../types.ts';
import { FileText, CheckCircle, Clock } from 'lucide-react';

const MyAgreementsPage: React.FC = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const profile = await fetchProfileByUserId(user.id);
          setUserProfile(profile);
          if (profile) {
            const agreementData = await fetchAgreementsByProfileId(profile.id);
            setAgreements(agreementData);
          }
        } catch (error) {
          console.error("Failed to load agreements:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return <div className="text-center py-20">Loading your agreements...</div>;
  }
  
  const StatusIndicator: React.FC<{ status: 'Pending' | 'Signed' }> = ({ status }) => {
    if (status === 'Signed') {
        return <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold"><CheckCircle size={16} /> Signed</span>;
    }
    return <span className="flex items-center gap-1.5 text-sm text-amber-600 font-semibold"><Clock size={16} /> Pending Signature</span>;
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-medium mb-8">My Agreements</h1>
      
      {agreements.length > 0 ? (
        <div className="space-y-4">
          {agreements.map(agreement => {
            const isPoster = userProfile?.id === agreement.posterProfileId;
            const otherPartyName = isPoster ? agreement.creativeName : agreement.posterName;
            const otherPartyRole = isPoster ? 'Creative' : 'Client';

            return (
                <Link key={agreement.id} to={`/agreement/${agreement.id}`} className="block p-6 border border-brand-border hover:border-brand-primary transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-brand-secondary">Agreement with {otherPartyName} ({otherPartyRole})</p>
                            <h2 className="text-xl font-serif font-medium mt-1">{agreement.gigTitle}</h2>
                        </div>
                        <StatusIndicator status={agreement.status} />
                    </div>
                    <p className="text-xs text-brand-secondary mt-2">
                        Created on {new Date(agreement.createdAt).toLocaleDateString()}
                    </p>
                </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-brand-border border-dashed">
            <FileText className="mx-auto text-brand-secondary mb-4" size={40} />
            <h2 className="text-xl font-serif font-medium">No Agreements Yet</h2>
            <p className="text-brand-secondary mt-2">When you are hired or hire someone, your agreements will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default MyAgreementsPage;
