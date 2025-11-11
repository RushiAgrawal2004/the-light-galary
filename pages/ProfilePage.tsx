
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Profile, Gig, MonitoredImage, Review } from '../types.ts';
import { fetchProfileById, fetchGigsByProfileId, fetchMonitoredImagesByUserId } from '../services/mockApiService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import NotFoundPage from './NotFoundPage.tsx';
import { MapPin, Calendar, IndianRupee, ShieldCheck, Edit, Star, MessageSquare, Mail, Download } from 'lucide-react';
import Button from '../components/Button.tsx';
import StarRating from '../components/StarRating.tsx';
import ContactModal from '../components/ContactModal.tsx';
import PortfolioPDF from '../components/PortfolioPDF.tsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [monitoredImages, setMonitoredImages] = useState<MonitoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);


  const isOwner = user && profile ? user.id === profile.userId : false;

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const profileData = await fetchProfileById(id);
        setProfile(profileData || null);
        if (profileData) {
          const gigsData = await fetchGigsByProfileId(profileData.id);
          setGigs(gigsData);

          // If the viewer is the owner, fetch monitoring data
          if (user?.id === profileData.userId) {
            const monitoredData = await fetchMonitoredImagesByUserId(user.id);
            setMonitoredImages(monitoredData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user]);

  useEffect(() => {
    if (isExporting && pdfRef.current && profile) {
      html2canvas(pdfRef.current, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        
        pdf.save(`${profile.name.replace(/\s+/g, '_')}_portfolio.pdf`);
        setIsExporting(false);
      });
    }
  }, [isExporting, profile]);

  if (loading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  if (!profile) {
    return <NotFoundPage />;
  }

  const monitoredCount = monitoredImages.filter(m => m.status === 'Monitored').length;
  const totalMatches = monitoredImages.reduce((sum, m) => sum + m.matches.length, 0);

  const PortfolioShieldSummary = () => (
    <div className="p-6 border border-brand-border bg-brand-background/50 mb-12">
      <div className="flex items-center gap-4">
        <ShieldCheck className="text-brand-primary" size={32} />
        <div>
            <h2 className="text-xl font-serif font-semibold">Portfolio Shield</h2>
            <p className="text-sm text-brand-secondary">
                {monitoredCount} of {profile.portfolio.length} images monitored. {totalMatches} potential infringements found.
            </p>
        </div>
      </div>
       <Button to="/portfolio-shield" variant="secondary" className="w-full mt-4">
            Go to Dashboard
       </Button>
    </div>
  );

  return (
    <>
      {isExporting && profile && (
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
             <PortfolioPDF profile={profile} ref={pdfRef} />
          </div>
      )}
      {isContactModalOpen && profile.contactInfo && (
        <ContactModal
          name={profile.name}
          contactInfo={profile.contactInfo}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1 md:sticky top-24 self-start">
            <img 
              src={profile.profilePictureUrl} 
              alt={profile.name} 
              className="w-full aspect-[3/4] object-cover mb-6"
            />
            <h1 className="text-4xl font-serif font-bold">{profile.name}</h1>
            <p className="text-xl font-serif text-brand-secondary -mt-1 mb-4">{profile.role}</p>
            
            <div className="space-y-3">
              {isOwner && (
                <Button to="/edit-profile" variant="secondary" className="w-full" icon={<Edit size={16}/>}>
                  Edit Profile
                </Button>
              )}
              {isAuthenticated && !isOwner && (
                 <Button onClick={() => setIsContactModalOpen(true)} variant="primary" className="w-full" icon={<Mail size={16}/>}>
                  Contact {profile.name.split(' ')[0]}
                </Button>
              )}
               <Button onClick={() => setIsExporting(true)} disabled={isExporting} variant="secondary" className="w-full" icon={<Download size={16}/>}>
                {isExporting ? 'Exporting...' : 'Export as PDF'}
              </Button>
            </div>

            <p className="text-brand-secondary mt-6 leading-relaxed">{profile.bio}</p>
            
            {profile.role === 'Model' && (
              <div className="mt-8 border-t border-brand-border pt-6 space-y-2 text-sm">
                <div className="flex justify-between"><span>Height:</span> <span>{profile.height}</span></div>
                <div className="flex justify-between"><span>Weight:</span> <span>{profile.weight}</span></div>
                <div className="flex justify-between"><span>Eyes:</span> <span>{profile.eyeColor}</span></div>
                <div className="flex justify-between"><span>Hair:</span> <span>{profile.hairColor}</span></div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="md:col-span-2 space-y-16">
            {/* Portfolio Shield Summary (for owner) */}
            {isOwner && <PortfolioShieldSummary />}
            
            {/* Reputation Section */}
            <div>
                <h2 className="text-2xl font-serif font-semibold mb-6 border-b border-brand-border pb-2">Reputation</h2>
                {profile.reviews.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 p-4 border border-brand-border mb-8">
                      <div className="text-center">
                          <p className="text-4xl font-serif font-bold">{profile.averageRating.toFixed(1)}</p>
                          <StarRating rating={profile.averageRating} />
                          <p className="text-xs text-brand-secondary mt-1">({profile.reviews.length} reviews)</p>
                      </div>
                      <div className="flex-grow">
                          <h3 className="font-serif text-xl font-medium">Testimonials & Recommendations</h3>
                          <p className="text-sm text-brand-secondary">Feedback from past collaborations.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {profile.reviews.map((review: Review) => (
                        <div key={review.id} className="p-4 border border-brand-border">
                          <div className="flex items-start gap-4">
                            <Link to={`/profile/${review.reviewerProfileId}`}>
                              <img src={review.reviewerProfilePictureUrl} alt={review.reviewerName} className="w-12 h-12 object-cover rounded-full"/>
                            </Link>
                            <div>
                              <div className="flex items-center gap-4">
                                <Link to={`/profile/${review.reviewerProfileId}`} className="font-serif font-semibold hover:text-brand-primary">{review.reviewerName}</Link>
                                <StarRating rating={review.rating} />
                              </div>
                              <p className="text-sm text-brand-secondary mt-2 italic">"{review.comment}"</p>
                              <p className="text-xs text-brand-secondary mt-2">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 border border-brand-border border-dashed">
                      <MessageSquare className="mx-auto text-brand-secondary mb-2" />
                      <p className="text-brand-secondary">No reviews yet.</p>
                      <p className="text-xs text-brand-secondary">Complete a collaboration to receive your first review.</p>
                  </div>
                )}
              </div>
          
            {/* Posted Opportunities Section */}
            {gigs.length > 0 && (
              <div>
                <h2 className="text-2xl font-serif font-semibold mb-6 border-b border-brand-border pb-2">Posted Opportunities</h2>
                <div className="space-y-6">
                  {gigs.map(gig => (
                    <Link to={`/opportunities/${gig.id}`} key={gig.id} className="block p-4 border border-brand-border hover:border-brand-primary transition-colors">
                        <h3 className="font-serif text-xl font-medium">{gig.title}</h3>
                        <p className="text-sm text-brand-secondary">Seeking: {gig.roleSought}</p>
                        <div className="flex items-center text-sm text-brand-secondary mt-2 gap-4">
                          <span className="flex items-center gap-1"><MapPin size={14}/> {gig.location}</span>
                          <span className="flex items-center gap-1"><Calendar size={14}/> {gig.date}</span>
                          <span className="flex items-center gap-1"><IndianRupee size={14}/> {gig.payment}</span>
                        </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Gallery Section */}
            <div>
              <h2 className="text-2xl font-serif font-semibold mb-6 border-b border-brand-border pb-2">Portfolio</h2>
                <div className="space-y-8">
                  {profile.portfolio.map((image) => (
                    <div key={image.id}>
                      <img 
                        src={image.url} 
                        alt={image.caption} 
                        className="w-full object-cover" 
                      />
                      <p className="text-center text-sm text-brand-secondary mt-2 italic">{image.caption}</p>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;