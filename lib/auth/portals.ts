export const PORTAL_KEYS = ['estate', 'career', 'recruiter', 'admin'] as const;

export type PortalKey = (typeof PORTAL_KEYS)[number];

export type PortalRoleOption = {
  value: string;
  label: string;
};

export type PortalConfig = {
  key: PortalKey;
  name: string;
  tagline: string;
  description: string;
  basePath: string;
  dashboardPath: string;
  loginPath: string;
  signupPath?: string;
  signupRoles: PortalRoleOption[];
  hasSelfSignup: boolean;
  imageUrl: string | null;
};

export const PORTALS: Record<PortalKey, PortalConfig> = {
  estate: {
    key: 'estate',
    name: 'EstateMind',
    tagline: 'Real Estate Intelligence',
    description: 'Search, price and analyse properties with AI-driven valuations, forecasts and market data.',
    basePath: '/estate',
    dashboardPath: '/estate/dashboard',
    loginPath: '/estate/login',
    signupPath: '/estate/signup',
    signupRoles: [
      { value: 'buyer', label: 'Property Buyer' },
      { value: 'seller', label: 'Property Seller' },
      { value: 'owner', label: 'Property Owner' },
      { value: 'agent', label: 'Real Estate Agent' },
      { value: 'investor', label: 'Investor' },
    ],
    hasSelfSignup: true,
    imageUrl: 'https://images.pexels.com/photos/31737860/pexels-photo-31737860.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  career: {
    key: 'career',
    name: 'CareerMind AI',
    tagline: 'Resume & Career Intelligence',
    description: 'Build, analyse and tailor resumes, match them to job descriptions and track every application.',
    basePath: '/career',
    dashboardPath: '/career/dashboard',
    loginPath: '/career/login',
    signupPath: '/career/signup',
    signupRoles: [
      { value: 'student', label: 'Student' },
      { value: 'job_seeker', label: 'Job Seeker' },
      { value: 'career_counselor', label: 'Career Counselor' },
    ],
    hasSelfSignup: true,
    imageUrl: 'https://images.pexels.com/photos/10375961/pexels-photo-10375961.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  recruiter: {
    key: 'recruiter',
    name: 'Recruiter Portal',
    tagline: 'Talent Acquisition Intelligence',
    description: 'Post vacancies, rank candidates, track applications and manage your hiring pipeline.',
    basePath: '/recruiter',
    dashboardPath: '/recruiter/dashboard',
    loginPath: '/recruiter/login',
    signupPath: '/recruiter/signup',
    signupRoles: [
      { value: 'recruiter', label: 'Recruiter' },
      { value: 'hiring_manager', label: 'Hiring Manager' },
    ],
    hasSelfSignup: true,
    imageUrl: 'https://images.pexels.com/photos/5439395/pexels-photo-5439395.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  admin: {
    key: 'admin',
    name: 'Super Admin',
    tagline: 'Platform Control Center',
    description: 'Govern both portals, machine learning services, datasets, audit trails and system settings.',
    basePath: '/admin',
    dashboardPath: '/admin/dashboard',
    loginPath: '/admin/login',
    signupRoles: [],
    hasSelfSignup: false,
    imageUrl: null,
  },
};

export function isPortalKey(value: string): value is PortalKey {
  return (PORTAL_KEYS as readonly string[]).includes(value);
}

export function getPortalRoleLabel(portal: PortalKey, role: string): string {
  if (portal === 'admin') return 'Super Administrator';
  return PORTALS[portal].signupRoles.find((option) => option.value === role)?.label ?? role;
}
