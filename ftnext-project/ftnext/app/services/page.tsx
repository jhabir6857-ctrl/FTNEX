import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { ServiceAccordion } from '@/components/sections/ServiceAccordion';

// Page sections per spec Section 5.3:
// 1. Static hero banner
// 2. Full ServiceGrid — accordion detail view per spec
// 3. CTA band

export const metadata = {
  title: 'Services',
  description: '[PLACEHOLDER] Comprehensive logistics services — ship owning, chartering, technical management, shipping agency, and trading.',
  openGraph: {
    title: 'FTNEXT Services',
    description: '[PLACEHOLDER] Comprehensive logistics services — ship owning, chartering, technical management, shipping agency, and trading.',
  },
};

export default function ServicesPage() {
  return (
    <main>
      <section className="relative h-[50vh] w-full">
        <Image
          src="/frames/poster.webp"
          alt="FTNEXT Services"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1>Our Services</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading
          eyebrow="What We Offer"
          title="Comprehensive Logistics Services"
        />
        <ServiceAccordion />
      </section>

      <section className="bg-elevated border-t border-b border-gunmetal">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2>[PLACEHOLDER] Ready to move your cargo?</h2>
          <div className="mt-6">
            <Button href="/contact" variant="primary">
              Request a Quote
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
