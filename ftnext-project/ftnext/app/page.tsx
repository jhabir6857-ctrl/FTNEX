'use client';

import { useReducedMotion } from '@/lib/useReducedMotion';
import { useIsMobile } from '@/lib/useIsMobile';
import { ScrollCanvas } from '@/components/hero/ScrollCanvas';
import { ScrollCanvasMobile } from '@/components/hero/ScrollCanvasMobile';
import { ReducedMotionHero } from '@/components/hero/ReducedMotionHero';
import { StatBlock } from '@/components/sections/StatBlock';
import { ServiceGrid } from '@/components/sections/ServiceGrid';
import { FleetGrid } from '@/components/sections/FleetGrid';
import { PartnerLogos } from '@/components/sections/PartnerLogos';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

// Page sections per spec Section 5.1:
// 1. NavBar (in root layout)
// 2. Hero — ScrollCanvas (desktop, scroll-scrubbed frame sequence) /
//    ScrollCanvasMobile (<768px, lightweight looping video) /
//    ReducedMotionHero (prefers-reduced-motion, static)
// 3. Stat strip
// 4. ServiceGrid preview (limited to 6)
// 5. Fleet teaser (limited to 3)
// 6. PartnerLogos
// 7. CTA band
// 8. Footer (in root layout)

export default function HomePage() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <main>
      {reducedMotion ? (
        <ReducedMotionHero />
      ) : isMobile ? (
        <ScrollCanvasMobile />
      ) : (
        <ScrollCanvas />
      )}

      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* [PLACEHOLDER] real stats from client */}
        <StatBlock value="15+" label="Years of Operation" />
        <StatBlock value="40+" label="Fleet Vessels" />
        <StatBlock value="20+" label="Countries Served" />
        <StatBlock value="1M+" label="Tonnes Shipped" />
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading
          eyebrow="What We Do"
          title="Comprehensive Logistics Services"
          subtitle="[PLACEHOLDER] Section intro copy."
        />
        <ServiceGrid limit={6} />
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading eyebrow="Our Fleet" title="Built to Move the World" />
        <FleetGrid limit={3} />
        <div className="mt-8">
          <Button href="/fleet" variant="secondary">
            View Full Fleet
          </Button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading eyebrow="Trusted By" title="Our Partners" />
        <PartnerLogos />
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
