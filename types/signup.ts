export type PlanType = 'free' | 'pro';
export type BillingCycle = 'monthly' | 'annual';
export type AccountType = 'student' | 'teacher' | 'parent';

export interface PlanDetails {
  id: PlanType;
  name: string;
  description: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  negativeFeatures?: string[];
  highlighted?: boolean;
  badge?: string;
  badgeColor?: 'primary' | 'accent' | 'secondary';
  ctaText: string;
  tier: 'free' | 'pro';
}

export interface SignupFormData {
  plan: PlanType;
  billingCycle: BillingCycle;
  accountType: AccountType;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  childName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  billingPostcode: string;
  agreedToTerms: boolean;
}

export interface SchoolDemoFormData {
  schoolName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  numberOfStudents: string;
  numberOfTeachers: string;
  preferredContactTime: string[];
  specificDate: string;
  additionalNotes: string;
}

export const PLANS: PlanDetails[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    subtitle: 'Perfect for trying out',
    monthlyPrice: 0,
    annualPrice: 0,
    features: ['3 game modes', '10 pre-built subjects', 'No account required to try'],
    negativeFeatures: ['No custom decks', 'No progress saving'],
    ctaText: 'Start Free',
    tier: 'free',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Perfect for individual learners',
    subtitle: 'Everything you need to master any subject',
    monthlyPrice: 5,
    annualPrice: 45,
    features: [
      'All game modes unlocked',
      'Access all pre-built decks',
      'Create unlimited custom decks',
      'Save progress & track performance',
      'Share decks with friends',
      'Study offline mode',
      'Export/import decks',
    ],
    highlighted: true,
    badge: 'Most Popular',
    badgeColor: 'primary',
    ctaText: 'Start 14-Day Free Trial',
    tier: 'pro',
  },
];
