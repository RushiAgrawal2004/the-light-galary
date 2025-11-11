import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Gig, Application, Profile } from '../types.ts';
import { fetchGigById, fetchApplicationsForGig, applyToGig, fetchProfileByUserId, acceptApplicationAndCreateAgreement } from '../services/mockApiService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import NotFoundPage from './NotFoundPage.tsx';
import Button from '../components/Button.tsx';
import { MapPin, Calendar, IndianRupee, Send, CheckCircle, FileText } from 'lucide-react';

const GigDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [userApplication, setUserApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPoster = userProfile && gig ? userProfile.id === gig.postedByProfileId : false;
  const isJobAccepted = applications.some(app => app.status === 'Accepted');

  const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const gigData = await fetchGigById(id);
        setGig(gigData || null);

        if (gigData) {
          const appsData = await fetchApplicationsForGig(gigData.id);
          setApplications(appsData);

          if (user) {
            const profileData = await fetchProfileByUserId(user.id);
            setUserProfile(profileData || null);
            
            const currentUserApplication = appsData.find(app => app.applicantUserId === user.id) || null;
            setUserApplication(currentUserApplication);
          }
        }
      } catch (error) {
        console.error("Failed to fetch gig details:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !gig) return;
    setIsSubmitting(true);
    try {
        await applyToGig(gig.id, userProfile, applicationMessage);
        setIsApplying(false);
        await loadData(); // Refresh data to show applied status
    } catch(error) {
        console.error("Failed to submit application", error);
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleAccept = async (application: Application) => {
    if(!gig) return;
    try {
        const agreement = await acceptApplicationAndCreateAgreement(application, gig);
        await loadData(); // Refresh data
        navigate(`/agreement/${agreement.id}`);
    } catch(error) {
        console.error("Failed to accept application", error);
    }
  }


  if (loading) {
    return <div className="text-center py-20">Loading opportunity...</div>;
  }

  if (!gig) {
    return <NotFoundPage />;
  }
  
  const renderApplicantActions = () => {
    if (!isAuthenticated || isPoster) return null;
    
    if (userApplication) {
        if (userApplication.status === 'Accepted') {
            return (
                <div className="text-center p-4 bg-green-50 border border-green-200">
                    <CheckCircle className="mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold text-green-800">You've been hired!</h3>
                    <p className="text-sm text-green-700 mb-4">The agreement has been sent.</p>
                    <Button to={`/agreement/${userApplication.agreementId}`} variant="primary" className="w-full">
                        View Agreement
                    </Button>
                </div>
            )
        }
         return <p className="text-center text-brand-secondary">You have applied to this opportunity.</p>;
    }

    if (isJobAccepted) {
        return <p className="text-center text-brand-secondary">This position has been filled.</p>;
    }

    if (!isApplying) {
        return <Button onClick={() => setIsApplying(true)} className="w-full">Apply Now</Button>;
    }

    return (
        <form onSubmit={handleApply}>
            <label htmlFor="message" className="block text-sm mb-2 font-medium">Your Message (Optional)</label>
            <textarea
                id="message"
                value={applicationMessage}
                onChange={e => setApplicationMessage(e.target.value)}
                rows={4}
                placeholder={`Hi ${gig.posterName.split(' ')[0]}, I'm interested...`}
                className="w-full p-2 border border-brand-border bg-transparent mb-4 focus:ring-brand-primary focus:border-brand-primary"
            ></textarea>
            <Button type="submit" disabled={isSubmitting} className="w-full" icon={<Send size={16}/>}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
            <button type="button" onClick={() => setIsApplying(false)} className="w-full text-center text-sm mt-2 text-brand-secondary hover:underline">Cancel</button>
        </form>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <p className="text-sm text-brand-secondary mb-2">Seeking {gig.roleSought}</p>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6">{gig.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-brand-secondary mb-8 border-y border-brand-border py-4">
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {gig.location}</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {gig.date}</span>
              <span className="flex items-center gap-1.5"><IndianRupee size={16} /> {gig.payment}</span>
          </div>
          <div className="prose max-w-none text-brand-text leading-relaxed whitespace-pre-wrap">
            <p>{gig.description}</p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border border-brand-border p-6 sticky top-24">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-brand-secondary mb-4">Posted By</h2>
            <Link to={`/profile/${gig.postedByProfileId}`} className="flex items-center gap-4 group mb-6">
              <img src={gig.posterProfilePictureUrl} alt={gig.posterName} className="w-16 h-16 object-cover rounded-full" />
              <div>
                <h3 className="text-lg font-serif font-medium group-hover:text-brand-primary transition-colors">{gig.posterName}</h3>
              </div>
            </Link>
            <div className="border-t border-brand-border pt-6">
              {renderApplicantActions()}
            </div>
          </div>
        </div>
      </div>

      {isPoster && (
        <div className="mt-16 border-t border-brand-border pt-12">
            <h2 className="text-3xl font-serif font-medium mb-8">Applicants ({applications.length})</h2>
            <div className="space-y-4">
                {applications.length > 0 ? (
                    applications.map(app => (
                        <div key={app.id} className="p-4 border border-brand-border flex items-start gap-4">
                           <Link to={`/profile/${app.applicantProfileId}`}>
                             <img src={app.applicantProfilePictureUrl} alt={app.applicantName} className="w-16 h-16 object-cover rounded-full" />
                           </Link>
                           <div className="flex-grow">
                             <Link to={`/profile/${app.applicantProfileId}`} className="font-serif font-medium text-lg hover:text-brand-primary transition-colors">{app.applicantName}</Link>
                             {app.message && <p className="text-sm text-brand-secondary mt-2 italic">"{app.message}"</p>}
                           </div>
                           <div className="flex-shrink-0">
                             {app.status === 'Pending' && !isJobAccepted && (
                                <Button onClick={() => handleAccept(app)}>Accept & Send Agreement</Button>
                             )}
                             {app.status === 'Accepted' && (
                                <Link to={`/agreement/${app.agreementId}`} className="flex items-center gap-2 text-green-600 font-semibold">
                                    <CheckCircle size={20} />
                                    <span>Hired</span>
                                </Link>
                             )}
                             {app.status === 'Pending' && isJobAccepted && (
                                 <span className="text-sm text-brand-secondary">Position Filled</span>
                             )}
                           </div>
                        </div>
                    ))
                ) : (
                    <p className="text-brand-secondary">No one has applied to this opportunity yet.</p>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default GigDetailPage;
