export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'free' | 'pro' | 'business';
export type CompanyRole = 'admin' | 'employee';

export interface UserProfile {
  id: string;
  lastname: string;
  firstname: string;
  username: string;
  job_title?: string;
  company?: string;
  company_id?: string;
  is_company_admin?: boolean;
  phone?: string;
  email?: string;
  website?: string;
  bio?: string;
  field?: string;
  category?: string;
  skills?: string[];
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
  view_count: number;
  qr_scan_count: number;
  created_at: any;
  updated_at: any;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  brand_color: string;
  admin_uid: string;
  created_at: any;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  joined_at: any;
}

export interface Order {
  id: string;
  company_id?: string;
  user_id: string;
  type: 'individual' | 'B2B';
  quantity: number;
  address: string;
  contact_phone: string;
  status: 'pending' | 'shipped' | 'delivered';
  created_at: any;
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
