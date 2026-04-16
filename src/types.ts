export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'free' | 'pro' | 'business';

export interface UserProfile {
  id: string;
  lastname: string;
  firstname: string;
  username: string;
  job_title?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  bio?: string;
  field?: string;
  card_color: string;
  card_text_color: string;
  avatar_url?: string;
  role: UserRole;
  plan: SubscriptionPlan;
  verified: boolean;
  is_active: boolean;
  show_in_directory: boolean;
  profile_public: boolean;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  address?: string;
  maps_url?: string;
  lastname_display?: 'full' | 'initial';
  card_pattern?: string;
  // Business Fields
  business_name?: string;
  business_logo?: string;
  business_bio?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  business_address?: string;
  business_color?: string;
  business_industry?: string;
  view_count: number;
  qr_scan_count: number;
  created_at: any;
  updated_at: any;
}

export interface ProfileView {
  id: string;
  profile_id: string;
  viewer_ip: string;
  viewed_at: any;
  source: 'direct' | 'qr' | 'directory';
}

export interface VerifiedRequest {
  id: string;
  profile_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: any;
}
