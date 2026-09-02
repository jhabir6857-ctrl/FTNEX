import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactForm } from '@/components/sections/ContactForm';
import { offices } from '@/data/site-config';

// Page sections per spec Section 5.6:
// 1. Static hero banner
// 2. ContactForm
// 3. Office locations list (offices from data/site-config.ts — PLACEHOLDER,
//    confirm real FTNEXT offices, do NOT assume Akij's office list applies)
// No CTA band needed on this page.

export const metadata = {
  title: 'Contact',
  description: '[PLACEHOLDER] Get in touch with FTNEXT — request a quote for shipping, chartering, or logistics services.',
  openGraph: { title: 'Contact FTNEXT', description: '[PLACEHOLDER] Get in touch with FTNEXT — request a quote for shipping, chartering, or logistics services.' },
};

export default function ContactPage() {
  return (
    <main>
      <section className="relative h-[40vh] w-full">
        <Image src="/frames/poster.webp" alt="Contact FTNEXT" fill className="object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1>Contact Us</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 grid gap-12 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Get In Touch" title="Let's Move Your Cargo" />
          <ContactForm />
        </div>
        <div>
          <SectionHeading eyebrow="Our Offices" title="Where to Find Us" />
          <div className="space-y-6">
            {offices.map((office) => (
              <div key={office.id} className="text-steel">
                <p className="text-chrome font-semibold">{office.label}</p>
                <p>{office.address}</p>
                <p>{office.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
