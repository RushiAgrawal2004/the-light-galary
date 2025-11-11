import { MOCK_PROFILES, MOCK_GIGS, MOCK_REVIEWS } from '../constants.ts';
import { Profile, User, Gig, Application, Agreement, MonitoredImage, InfringementMatch, Review } from '../types.ts';

const LATENCY = 500;
const PROFILES_STORAGE_KEY = 'gallery_profiles';
const USERS_STORAGE_KEY = 'gallery_users';
const GIGS_STORAGE_KEY = 'gallery_gigs';
const APPLICATIONS_STORAGE_KEY = 'gallery_applications';
const AGREEMENTS_STORAGE_KEY = 'gallery_agreements';
const MONITORED_IMAGES_STORAGE_KEY = 'gallery_monitored_images';
const REVIEWS_STORAGE_KEY = 'gallery_reviews';


// --- Initialization ---

const initializeData = <T,>(key: string, initialData: T[]): T[] => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error(`Failed to parse data from localStorage for key "${key}"`, error);
    }
    localStorage.setItem(key, JSON.stringify(initialData));
    return [...initialData];
};

let users: User[] = initializeData<User>(USERS_STORAGE_KEY, [
    { id: 'user1', email: 'elara@test.com', name: 'Elara Vance' },
    { id: 'user2', email: 'liam@test.com', name: 'Liam Sterling' },
    { id: 'user3', email: 'aria@test.com', name: 'Aria Chen' },
    { id: 'user4', email: 'mateo@test.com', name: 'Mateo Rossi' },
    { id: 'user5', email: 'sienna@test.com', name: 'Sienna Miller' },
    { id: 'user6', email: 'julian@test.com', name: 'Julian Croft' },
    { id: 'user7', email: 'chloe@test.com', name: 'Chloe Kim' },
    { id: 'user8', email: 'ren@test.com', name: 'Ren Ishikawa' },
]);
let profiles: Omit<Profile, 'reviews' | 'averageRating'>[] = initializeData<Omit<Profile, 'reviews' | 'averageRating'>>(PROFILES_STORAGE_KEY, MOCK_PROFILES);
let gigs: Gig[] = initializeData<Gig>(GIGS_STORAGE_KEY, MOCK_GIGS);
let applications: Application[] = initializeData<Application>(APPLICATIONS_STORAGE_KEY, []).map(app => ({...app, status: app.status || 'Pending'})); // Migration for old data
let agreements: Agreement[] = initializeData<Agreement>(AGREEMENTS_STORAGE_KEY, []);
let monitoredImages: MonitoredImage[] = initializeData<MonitoredImage>(MONITORED_IMAGES_STORAGE_KEY, []);
let reviews: Review[] = initializeData<Review>(REVIEWS_STORAGE_KEY, MOCK_REVIEWS);


// --- Persistence ---

const persistUsers = () => localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
const persistProfiles = () => localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
const persistGigs = () => localStorage.setItem(GIGS_STORAGE_KEY, JSON.stringify(gigs));
const persistApplications = () => localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
const persistAgreements = () => localStorage.setItem(AGREEMENTS_STORAGE_KEY, JSON.stringify(agreements));
const persistMonitoredImages = () => localStorage.setItem(MONITORED_IMAGES_STORAGE_KEY, JSON.stringify(monitoredImages));
const persistReviews = () => localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));


// --- Helper function to attach reviews to profiles ---
const attachReviewsToProfile = (profile: Omit<Profile, 'reviews' | 'averageRating'>): Profile => {
    const profileReviews = reviews.filter(r => r.revieweeProfileId === profile.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const totalRating = profileReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = profileReviews.length > 0 ? totalRating / profileReviews.length : 0;
    
    return {
        ...profile,
        reviews: profileReviews,
        averageRating,
    };
};

// --- User/Auth Simulation ---

export const mockSignIn = (email: string, _pass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(u => u.email === email);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                resolve(user);
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, LATENCY);
    });
};

export const mockSignUp = (name: string, email: string, _pass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (users.some(u => u.email === email)) {
                reject(new Error('User already exists'));
                return;
            }
            const newUser: User = { id: `user${Date.now()}`, email, name };
            users.push(newUser);
            persistUsers();
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            resolve(newUser);
        }, LATENCY);
    });
};

export const mockSignOut = (): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            localStorage.removeItem('currentUser');
            resolve();
        }, LATENCY / 2);
    });
};

export const getMockCurrentUser = (): Promise<User | null> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            const userJson = localStorage.getItem('currentUser');
            resolve(userJson ? JSON.parse(userJson) : null);
        }, LATENCY / 3);
    });
};


// --- Profile Data Simulation ---

export const fetchProfiles = (): Promise<Profile[]> => {
    return new Promise(resolve => setTimeout(() => resolve(profiles.map(attachReviewsToProfile)), LATENCY));
};

export const fetchProfileById = (id: string): Promise<Profile | undefined> => {
    return new Promise(resolve => setTimeout(() => {
        const profile = profiles.find(p => p.id === id);
        resolve(profile ? attachReviewsToProfile(profile) : undefined);
    }, LATENCY));
};

export const fetchProfileByUserId = (userId: string): Promise<Profile | undefined> => {
     return new Promise(resolve => setTimeout(() => {
        const profile = profiles.find(p => p.userId === userId);
        resolve(profile ? attachReviewsToProfile(profile) : undefined);
    }, LATENCY));
};

export const saveProfile = (profileData: Omit<Profile, 'id' | 'userId' | 'reviews' | 'averageRating' | 'contactInfo'>, user: User): Promise<Profile> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingProfileIndex = profiles.findIndex(p => p.userId === user.id);
            let savedProfile: Omit<Profile, 'reviews' | 'averageRating'>;
            if (existingProfileIndex > -1) {
                const existingProfile = profiles[existingProfileIndex];
                savedProfile = { 
                    ...existingProfile, 
                    ...profileData, 
                    contactInfo: {
                        ...existingProfile.contactInfo,
                        email: user.email,
                    } 
                };
                profiles[existingProfileIndex] = savedProfile;
            } else {
                savedProfile = { 
                    ...profileData, 
                    id: String(Date.now()), 
                    userId: user.id,
                    contactInfo: { email: user.email } 
                };
                profiles.push(savedProfile);
            }
            persistProfiles();
            resolve(attachReviewsToProfile(savedProfile));
        }, LATENCY);
    });
};


// --- Gigs / Opportunities Simulation ---

export const fetchGigs = (): Promise<Gig[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...gigs].reverse()), LATENCY)); // Show newest first
};

export const fetchGigById = (id: string): Promise<Gig | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(gigs.find(g => g.id === id)), LATENCY));
};

export const fetchGigsByProfileId = (profileId: string): Promise<Gig[]> => {
    return new Promise(resolve => setTimeout(() => resolve(gigs.filter(g => g.postedByProfileId === profileId)), LATENCY));
};

export const postGig = (gigData: Omit<Gig, 'id'>): Promise<Gig> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newGig: Gig = { ...gigData, id: `gig${Date.now()}` };
            gigs.push(newGig);
            persistGigs();
            resolve(newGig);
        }, LATENCY);
    });
};


// --- Applications Simulation ---

export const fetchApplicationsForGig = (gigId: string): Promise<Application[]> => {
    return new Promise(resolve => setTimeout(() => resolve(applications.filter(a => a.gigId === gigId)), LATENCY));
};

export const hasUserApplied = (gigId: string, userId: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(applications.some(a => a.gigId === gigId && a.applicantUserId === userId));
        }, LATENCY / 2);
    });
};

export const applyToGig = (gigId: string, applicantProfile: Profile, message: string): Promise<Application> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newApplication: Application = {
                id: `app${Date.now()}`,
                gigId,
                applicantUserId: applicantProfile.userId,
                applicantProfileId: applicantProfile.id,
                applicantName: applicantProfile.name,
                applicantProfilePictureUrl: applicantProfile.profilePictureUrl,
                message,
                appliedAt: new Date().toISOString(),
                status: 'Pending',
            };
            applications.push(newApplication);
            persistApplications();
            resolve(newApplication);
        }, LATENCY);
    });
};

// --- Agreement Simulation ---

const generateTerms = (gig: Gig, creative: Profile): string => {
    const isTFP = gig.payment.toLowerCase().includes('tfp');
    const paymentClause = isTFP 
        ? `This is a TFP (Time for Prints) collaboration. ${creative.name} will receive 5-10 high-resolution edited images for their portfolio within 14 days of the shoot.`
        : `The payment for this project is ${gig.payment}, to be paid to ${creative.name} upon completion of services on ${gig.date}.`;

    return `This agreement is between ${gig.posterName} (The Client) and ${creative.name} (The Creative) for the project titled "${gig.title}".
    
Date of Service: ${gig.date}
Location: ${gig.location}
Role: ${gig.roleSought}

Payment Terms: ${paymentClause}

Usage Rights: The Client has the right to use the final work for their specified purposes. The Creative retains the right to use the work for their own portfolio and self-promotion. Any other use requires written permission.

This digital agreement is legally binding upon signature by The Creative.
`;
};

export const acceptApplicationAndCreateAgreement = (application: Application, gig: Gig): Promise<Agreement> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const applicantProfile = profiles.find(p => p.id === application.applicantProfileId);
            if (!applicantProfile) {
                return reject(new Error('Applicant profile not found'));
            }

            const newAgreement: Agreement = {
                id: `agree${Date.now()}`,
                gigId: gig.id,
                gigTitle: gig.title,
                posterProfileId: gig.postedByProfileId,
                creativeProfileId: applicantProfile.id,
                posterName: gig.posterName,
                creativeName: applicantProfile.name,
                status: 'Pending',
                terms: generateTerms(gig, applicantProfile as any), // Cast because of missing review fields
                createdAt: new Date().toISOString(),
            };
            agreements.push(newAgreement);
            persistAgreements();
            
            const appIndex = applications.findIndex(a => a.id === application.id);
            if (appIndex > -1) {
                applications[appIndex].status = 'Accepted';
                applications[appIndex].agreementId = newAgreement.id;
                persistApplications();
            }

            resolve(newAgreement);
        }, LATENCY);
    });
};

export const fetchAgreementById = (id: string): Promise<Agreement | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(agreements.find(a => a.id === id)), LATENCY));
};

export const fetchAgreementsByProfileId = (profileId: string): Promise<Agreement[]> => {
    return new Promise(resolve => setTimeout(() => {
        const userAgreements = agreements.filter(a => a.posterProfileId === profileId || a.creativeProfileId === profileId);
        resolve(userAgreements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, LATENCY));
};

export const signAgreement = (agreementId: string, signingProfileId: string): Promise<Agreement> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const agreementIndex = agreements.findIndex(a => a.id === agreementId);
            if (agreementIndex === -1) {
                return reject(new Error("Agreement not found"));
            }
            const agreement = agreements[agreementIndex];
            if (agreement.creativeProfileId !== signingProfileId) {
                return reject(new Error("Only the hired creative can sign this agreement."));
            }
            if (agreement.status === 'Signed') {
                 return reject(new Error("Agreement already signed."));
            }

            agreement.status = 'Signed';
            agreement.signedAt = new Date().toISOString();
            agreements[agreementIndex] = agreement;
            persistAgreements();
            resolve(agreement);
        }, LATENCY);
    });
};

// --- Review Simulation ---

export const fetchReviewsByGigAndReviewer = (gigId: string, reviewerProfileId: string): Promise<Review[]> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(reviews.filter(r => r.gigId === gigId && r.reviewerProfileId === reviewerProfileId));
    }, LATENCY / 2));
};

export const submitReview = (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const hasAlreadyReviewed = reviews.some(r => r.gigId === reviewData.gigId && r.reviewerProfileId === reviewData.reviewerProfileId && r.revieweeProfileId === reviewData.revieweeProfileId);
            if (hasAlreadyReviewed) {
                return reject(new Error("You have already submitted a review for this collaboration."));
            }

            const newReview: Review = {
                ...reviewData,
                id: `review${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            reviews.push(newReview);
            persistReviews();
            resolve(newReview);
        }, LATENCY);
    });
};

// --- Portfolio Shield Simulation ---

const generateFakeMatches = (): InfringementMatch[] => {
    const matchCount = Math.floor(Math.random() * 4); // 0 to 3 matches
    if (matchCount === 0) return [];

    const domains = ['randomblog.com', 'artforum.net', 'social-site.org', 'portfolio-scraper.biz'];
    const paths = ['/gallery/2024/', '/user-uploads/', '/posts/'];

    return Array.from({ length: matchCount }, () => ({
        id: `match${Date.now()}${Math.random()}`,
        url: `https://${domains[Math.floor(Math.random() * domains.length)]}${paths[Math.floor(Math.random() * paths.length)]}image_${Math.floor(Math.random() * 1000)}.jpg`,
        status: 'Found',
        foundAt: new Date().toISOString(),
    }));
}

export const fetchMonitoredImagesByUserId = (userId: string): Promise<MonitoredImage[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(monitoredImages.filter(img => img.userId === userId));
        }, LATENCY / 2);
    });
};

export const startMonitoringImage = (imageId: string, userId: string): Promise<MonitoredImage> => {
    return new Promise(resolve => {
        let monitoredImage = monitoredImages.find(img => img.id === imageId);
        
        // Start scanning
        if (monitoredImage) {
            monitoredImage.status = 'Scanning';
        } else {
            monitoredImage = { id: imageId, userId, status: 'Scanning', matches: [] };
            monitoredImages.push(monitoredImage);
        }
        persistMonitoredImages();

        // Simulate scan completion
        setTimeout(() => {
            const imageIndex = monitoredImages.findIndex(img => img.id === imageId);
            if (imageIndex > -1) {
                monitoredImages[imageIndex].status = 'Monitored';
                monitoredImages[imageIndex].lastScan = new Date().toISOString();
                monitoredImages[imageIndex].matches = generateFakeMatches();
                persistMonitoredImages();
                resolve(monitoredImages[imageIndex]);
            }
        }, 2000 + Math.random() * 1500); // Simulate network delay + scan time
    });
};

export const updateInfringementMatchStatus = (imageId: string, matchId: string, status: 'Found' | 'Reviewed'): Promise<MonitoredImage> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const imageIndex = monitoredImages.findIndex(img => img.id === imageId);
            if (imageIndex === -1) {
                return reject(new Error("Monitored image not found"));
            }
            const matchIndex = monitoredImages[imageIndex].matches.findIndex(m => m.id === matchId);
            if (matchIndex === -1) {
                return reject(new Error("Infringement match not found"));
            }
            monitoredImages[imageIndex].matches[matchIndex].status = status;
            persistMonitoredImages();
            resolve(monitoredImages[imageIndex]);
        }, LATENCY / 2);
    });
};