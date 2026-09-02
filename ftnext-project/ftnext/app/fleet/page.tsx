import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FleetGrid } from '@/components/sections/FleetGrid';
import { Button } from '@/components/ui/Button';

// Page sections per spec Section 5.4:
// 1. Static hero banner
// 2. FleetGrid (data from data/fleet.ts)
// 3. CTA band

export const metadata = {
  title: 'Fleet',
  description: '[PLACEHOLDER] Explore the FTNEXT fleet — bulk carriers and coastal vessels built to move the world.',
  openGraph: { title: 'FTNEXT Fleet', description: '[PLACEHOLDER] Explore the FTNEXT fleet — bulk carriers and coastal vessels built to move the world.' },
};

export default function FleetPage() {
  return (
    <main>
      <section className="relative h-[50vh] w-full">
        <Image src="/frames/poster.webp" alt="FTNEXT Fleet" fill className="object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1>Our Fleet</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading eyebrow="Vessels" title="Built to Move the World" />
        <FleetGrid />
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
