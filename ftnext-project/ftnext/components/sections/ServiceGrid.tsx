import { services } from '@/data/services';
import { ServiceCard } from './ServiceCard';

type ServiceGridProps = {
  /** Maximum number of services to show. Omit for all services. */
  limit?: number;
};

export function ServiceGrid({ limit }: ServiceGridProps) {
  const items = limit ? services.slice(0, limit) : services;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
