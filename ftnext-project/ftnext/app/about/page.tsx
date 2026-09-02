import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

// Page sections per spec Section 5.2:
// 1. Static hero banner (not the scroll canvas — reserved for Home)
// 2. Company narrative
// 3. Timeline/milestones (optional)
// 4. Leadership/team (optional, pending client content)
// 5. CTA band

export const metadata = {
  title: 'About',
  description: '[PLACEHOLDER] Learn about FTNEXT — our history, mission, and commitment to maritime excellence.',
  openGraph: { title: 'About FTNEXT', description: '[PLACEHOLDER] Learn about FTNEXT — our history, mission, and commitment to maritime excellence.' },
};

export default function AboutPage() {
  return (
    <main>
      <section className="relative h-[50vh] w-full">
        <Image
          src="/frames/poster.webp"
          alt="About FTNEXT"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1>About FTNEXT</h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <SectionHeading eyebrow="Our Story" title="[PLACEHOLDER] Company Narrative" />
        <p className="text-steel leading-relaxed">
          [PLACEHOLDER] Founding story, mission, and values copy goes here.
        </p>
      </section>

      {/* TODO(agent): optional timeline/milestones section — reuse StatBlock-style
          layout horizontally per spec, pending client content. */}

      {/* TODO(agent): optional leadership/team section, pending client content. */}

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
