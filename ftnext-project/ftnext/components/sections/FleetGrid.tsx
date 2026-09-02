import { fleet } from '@/data/fleet';
import { FleetCard } from './FleetCard';

type FleetGridProps = {
  /** Maximum number of vessels to show. Omit for all vessels. */
  limit?: number;
};

export function FleetGrid({ limit }: FleetGridProps) {
  const items = limit ? fleet.slice(0, limit) : fleet;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((vessel) => (
        <FleetCard key={vessel.id} vessel={vessel} />
      ))}
    </div>
  );
}
