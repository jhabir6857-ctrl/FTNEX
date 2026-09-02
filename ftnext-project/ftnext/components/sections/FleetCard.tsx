import Image from 'next/image';
import type { Vessel } from '@/data/fleet';

export function FleetCard({ vessel }: { vessel: Vessel }) {
  return (
    <div className="bg-slate border border-gunmetal rounded-lg overflow-hidden transition-all duration-200 hover:bg-elevated hover:border-crimson/40">
      <div className="relative h-48 w-full">
        <Image
          src={vessel.image}
          alt={`${vessel.name} — ${vessel.type}, ${vessel.capacityTonnage.toLocaleString()} DWT`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-chrome font-heading font-semibold text-lg mb-1">
          {vessel.name}
        </h3>
        <p className="text-steel text-sm">
          {vessel.type} &middot; {vessel.capacityTonnage.toLocaleString()} DWT
        </p>
      </div>
    </div>
  );
}
