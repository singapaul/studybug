import { SchoolHero } from '@/components/marketing/schools/school-hero';
import { SchoolBenefits } from '@/components/marketing/schools/school-benefits';
import { SchoolTestimonials } from '@/components/marketing/schools/school-testimonials';
import { SchoolCTA } from '@/components/marketing/schools/school-cta';

export default function Schools() {
  return (
    <>
      <SchoolHero />
      <SchoolBenefits />
      <SchoolTestimonials />
      <SchoolCTA />
    </>
  );
}
