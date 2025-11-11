import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { fetchAgreementById, signAgreement, fetchProfileByUserId, submitReview, fetchReviewsByGigAndReviewer } from '../services/mockApiService.ts';
import { Agreement, Profile, Review } from '../types.ts';
import NotFoundPage from './NotFoundPage.tsx';
import Button from '../components/Button.tsx';
import StarRating from '../components/StarRating.tsx';
import { CheckCircle, Clock, FileSignature, Send } from 'lucide-react';

const AgreementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Signing State
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState('');

  // Review State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');


  const loadData = async () => {
      if (!id || !user) {
          setLoading(false);
          return;
      }
      try {
        setSignError('');
        setReviewError('');
        const [agreementData, profileData] = await Promise.all([
          fetchAgreementById(id),
          fetchProfileByUserId(user.id)
        ]);
        
        setAgreement(agreementData || null);
        setUserProfile(profileData || null);

        if (agreementData && profileData) {
            const isParticipant = agreementData.posterProfileId === profileData.id || agreementData.creativeProfileId === profileData.id;
            if (!isParticipant) {
                setAgreement(null); // Block access if user is not part of the agreement
            } else {
                 const reviews = await fetchReviewsByGigAndReviewer(agreementData.gigId, profileData.id);
                 setExistingReviews(reviews);
            }
        }

      } catch (err) {
        console.error("Failed to load agreement:", err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);
  
  const handleSign = async () => {
    if (!agreement || !userProfile) return;
    setIsSigning(true);
    setSignError('');
    try {
        await signAgreement(agreement.id, userProfile.id);
        await loadData(); // Refresh data to show signed status
    } catch(err: any) {
        setSignError(err.message || 'Failed to sign agreement.');
        console.error(err);
    } finally {
        setIsSigning(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement || !userProfile || rating === 0) {
        setReviewError("Please select a star rating.");
        return;
    }
    setIsSubmittingReview(true);
    setReviewError('');
    
    const isPoster = userProfile.id === agreement.posterProfileId;
    const revieweeProfileId = isPoster ? agreement.creativeProfileId : agreement.posterProfileId;

    try {
        await submitReview({
            gigId: agreement.gigId,
            reviewerProfileId: userProfile.id,
            reviewerName: userProfile.name,
            reviewerProfilePictureUrl: userProfile.profilePictureUrl,
            revieweeProfileId,
            rating,
            comment,
        });
        await loadData(); // Refresh to show review submitted
    } catch(err: any) {
        setReviewError(err.message || "Failed to submit review.");
    } finally {
        setIsSubmittingReview(false);
    }
  }


  if (loading) {
    return <div className="text-center py-20">Loading agreement...</div>;
  }

  if (!agreement || !userProfile) {
    return <NotFoundPage />;
  }

  const isCreative = userProfile.id === agreement.creativeProfileId;
  const isPoster = userProfile.id === agreement.posterProfileId;
  const canSign = isCreative && agreement.status === 'Pending';
  const otherPartyName = isPoster ? agreement.creativeName : agreement.posterName;
  const revieweeId = isPoster ? agreement.creativeProfileId : agreement.posterProfileId;
  const hasUserReviewedOtherParty = existingReviews.some(r => r.revieweeProfileId === revieweeId);


  const StatusDisplay = () => (
    <div className={`p-4 mb-8 text-center rounded-md ${agreement.status === 'Signed' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
        {agreement.status === 'Signed' ? (
            <div className="flex items-center justify-center gap-2">
                <CheckCircle />
                <span className="font-semibold">Agreement Signed on {new Date(agreement.signedAt!).toLocaleDateString()}</span>
            </div>
        ) : (
            <div className="flex items-center justify-center gap-2">
                <Clock />
                <span className="font-semibold">Pending Signature from {agreement.creativeName}</span>
            </div>
        )}
    </div>
  );

  const ReviewForm = () => (
    <div className="mt-12 border-t border-brand-border pt-8">
        <h2 className="text-2xl font-serif font-medium mb-4 text-center">Leave a Review for {otherPartyName}</h2>
        {hasUserReviewedOtherParty ? (
             <div className="p-4 text-center bg-green-50 text-green-800 border border-green-200">
                <CheckCircle className="mx-auto mb-2" />
                <p className="font-semibold">Thank you, your review has been submitted.</p>
            </div>
        ) : (
            <form onSubmit={handleReviewSubmit} className="max-w-lg mx-auto p-6 border border-brand-border">
                <div className="mb-4 text-center">
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <StarRating rating={rating} onRatingChange={setRating} interactive />
                </div>
                 <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">Your Testimonial (Optional)</label>
                    <textarea 
                        id="comment"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={4}
                        placeholder={`Share your experience working with ${otherPartyName}...`}
                        className="w-full p-2 border border-brand-border bg-transparent focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>
                <Button type="submit" disabled={isSubmittingReview || rating === 0} className="w-full" icon={<Send size={16}/>}>
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
                {reviewError && <p className="text-red-600 text-sm mt-2 text-center">{reviewError}</p>}
            </form>
        )}
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="text-center">
        <FileSignature className="mx-auto text-brand-secondary mb-4" size={40} />
        <h1 className="text-4xl font-serif font-medium">Collaboration Agreement</h1>
        <p className="text-brand-secondary mt-2 text-lg">{agreement.gigTitle}</p>
      </div>

      <div className="my-8 text-center text-sm">
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-brand-border">
                <p className="uppercase tracking-wider text-xs text-brand-secondary">Client</p>
                <p className="font-semibold text-lg">{agreement.posterName}</p>
            </div>
            <div className="p-4 border border-brand-border">
                <p className="uppercase tracking-wider text-xs text-brand-secondary">Creative</p>
                <p className="font-semibold text-lg">{agreement.creativeName}</p>
            </div>
        </div>
      </div>

      <StatusDisplay />

      <div className="p-8 border border-brand-border bg-white/50">
        <h2 className="text-xl font-serif font-semibold mb-4 border-b border-brand-border pb-2">Terms of Agreement</h2>
        <div className="prose max-w-none text-brand-text leading-relaxed whitespace-pre-wrap">
          {agreement.terms}
        </div>
      </div>

      {canSign && (
        <div className="mt-8 text-center">
            <p className="text-brand-secondary mb-4">By clicking below, you agree to the terms outlined in this document.</p>
            <Button onClick={handleSign} disabled={isSigning} size="large" variant="primary">
                {isSigning ? 'Signing...' : `Sign as ${agreement.creativeName}`}
            </Button>
            {signError && <p className="text-red-600 mt-4">{signError}</p>}
        </div>
      )}

      {agreement.status === 'Signed' && <ReviewForm />}
    </div>
  );
};

export default AgreementPage;
