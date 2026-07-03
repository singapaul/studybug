export type PlanType = 'free' | 'pro';
export type BillingCycle = 'monthly' | 'annual';
export type AccountType = 'student' | 'teacher' | 'parent';

export interface PlanDetails {
  id: PlanType;
  name: string;
  description: string;
  subtitle: string;
  monthlyPrice: number;
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
    features: ['3 game modes', '2 pre-built subjects', 'No account required to try'],
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
    features: [
      'All game modes unlocked',
      'Access all pre-built decks',
      'Create unlimited custom decks',
      'Save progress & track performance',
      'Share decks with friends',
      'Export decks (PDF, CSV & worksheets)',
    ],
    highlighted: true,
    badge: 'Most Popular',
    badgeColor: 'primary',
    ctaText: 'Get Started',
    tier: 'pro',
  },
];
