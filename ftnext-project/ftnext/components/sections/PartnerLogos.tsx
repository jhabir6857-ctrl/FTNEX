import Image from 'next/image';
import { partners, type Partner } from '@/data/partners';

type PartnerLogosProps = {
  /** If true, group partners by category with section headers. */
  grouped?: boolean;
};

const categoryLabels: Record<Partner['category'], string> = {
  port: 'Port Partners',
  agent: 'Agent Partners',
  technical: 'Technical Partners',
  other: 'Other Partners',
};

export function PartnerLogos({ grouped = false }: PartnerLogosProps) {
  if (!grouped) {
    // Flat logo strip (homepage)
    return (
      <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
        {partners.map((partner) => (
          <div key={partner.id} className="relative h-10 w-32">
            <Image
              src={partner.logo}
              alt={`${partner.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    );
  }

  // Grouped layout (partners page)
  const grouped_map = partners.reduce<Record<string, Partner[]>>((acc, partner) => {
    const key = partner.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(partner);
    return acc;
  }, {});

  return (
    <div className="space-y-12">
      {Object.entries(grouped_map).map(([category, categoryPartners]) => (
        <div key={category}>
          <h3 className="text-chrome font-heading font-semibold text-lg mb-6">
            {categoryLabels[category as Partner['category']] ?? category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {categoryPartners.map((partner) => (
              <div
                key={partner.id}
                className="relative h-16 w-full bg-slate/50 rounded-lg p-4 flex items-center justify-center"
              >
                {partner.url ? (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-full w-full"
                  >
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo — ${categoryLabels[partner.category]}`}
                      fill
                      className="object-contain"
                    />
                  </a>
                ) : (
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo — ${categoryLabels[partner.category]}`}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
