'use client';

import { SiteHeader } from '@/components/sections/SiteHeader';
import { HeroSection } from '@/components/sections/HeroSection';
import { TrustBar } from '@/components/sections/TrustBar';
import { WhyUsSection } from '@/components/sections/WhyUsSection';
import { ServiceSpotlight } from '@/components/sections/ServiceSpotlight';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { WaitlistSection } from '@/components/sections/WaitlistSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { FooterSection } from '@/components/sections/FooterSection';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustBar />
        <WhyUsSection />
        <ServiceSpotlight />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <WaitlistSection />
        <FAQSection />
      </main>
      <FooterSection />
    </>
  );
}
