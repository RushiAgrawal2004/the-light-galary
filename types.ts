export type Role = 'Model' | 'Photographer' | 'Makeup Artist' | 'Set Artist' | 'Artist';

export interface PortfolioImage {
  id: string;
  url: string;
  caption: string;
}

export interface Review {
  id: string;
  gigId: string;
  reviewerProfileId: string;
  reviewerName: string;
  reviewerProfilePictureUrl: string;
  revieweeProfileId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO String
}

export interface ContactInfo {
  email: string;
  website?: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  role: Role;
  bio: string;
  profilePictureUrl: string;
  contactInfo: ContactInfo;
  height: string;
  weight: string;
  eyeColor: string;
  hairColor: string;
  portfolio: PortfolioImage[];
  reviews: Review[];
  averageRating: number;
}

export interface User {
  id:string;
  email: string;
  name: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  roleSought: Role;
  location: string;
  date: string;
  payment: string;
  postedByProfileId: string; // The ID of the Profile that posted it
  posterName: string;
  posterProfilePictureUrl: string;
}

export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface Application {
  id: string;
  gigId: string;
  applicantUserId: string;
  applicantProfileId: string;
  applicantName: string;
  applicantProfilePictureUrl: string;
  message: string;
  appliedAt: string; // ISO string
  status: ApplicationStatus;
  agreementId?: string;
}

export type AgreementStatus = 'Pending' | 'Signed';

export interface Agreement {
  id: string;
  gigId: string;
  gigTitle: string;
  posterProfileId: string;
  creativeProfileId: string;
  posterName: string;
  creativeName: string;
  status: AgreementStatus;
  terms: string;
  createdAt: string; // ISO string
  signedAt?: string; // ISO string
}

// --- Portfolio Shield Types ---

export type InfringementMatchStatus = 'Found' | 'Reviewed';

export interface InfringementMatch {
  id: string;
  url: string;
  status: InfringementMatchStatus;
  foundAt: string; // ISO string
}

export type MonitoringStatus = 'Idle' | 'Scanning' | 'Monitored';

export interface MonitoredImage {
  id: string; // Corresponds to PortfolioImage.id
  userId: string;
  status: MonitoringStatus;
  lastScan?: string; // ISO string
  matches: InfringementMatch[];
}