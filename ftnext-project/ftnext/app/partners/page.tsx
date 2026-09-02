import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PartnerLogos } from '@/components/sections/PartnerLogos';
import { Button } from '@/components/ui/Button';

// Page sections per spec Section 5.5:
// 1. Static hero banner
// 2. PartnerLogos — TODO(agent): larger format than homepage strip, optionally
//    grouped by category (port / agent / technical) using Partner.category
// 3. CTA band

export const metadata = {
  title: 'Partners',
  description: '[PLACEHOLDER] FTNEXT works with trusted port, agent, and technical partners worldwide.',
  openGraph: { title: 'FTNEXT Partners', description: '[PLACEHOLDER] FTNEXT works with trusted port, agent, and technical partners worldwide.' },
};

export default function PartnersPage() {
  return (
    <main>
      <section className="relative h-[50vh] w-full">
        <Image src="/frames/poster.webp" alt="FTNEXT Partners" fill className="object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1>Our Partners</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading eyebrow="Working Together" title="Trusted Partners Worldwide" />
        <PartnerLogos grouped />
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
