import Image from 'next/image';
import type { Service } from '@/data/services';

/**
 * Base state: bg-slate, border-gunmetal.
 * Hover state: bg-elevated, border-crimson/40 glow. See spec Section 8.
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-slate border border-gunmetal rounded-lg p-6 transition-all duration-200 hover:bg-elevated hover:border-crimson/40 group">
      <div className="relative w-10 h-10 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
        <Image
          src={service.icon}
          alt={`${service.title} icon`}
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
      <h3 className="text-chrome font-heading font-semibold text-lg mb-2">
        {service.title}
      </h3>
      <p className="text-steel text-sm">{service.summary}</p>
    </div>
  );
}
