export type Vessel = {
  id: string;
  name: string;
  type: string; // e.g. "Bulk Carrier", "Coastal Vessel"
  capacityTonnage: number;
  image: string; // path under public/
  specSheetUrl?: string;
};

// [PLACEHOLDER] Replace with real fleet data from client before launch.
export const fleet: Vessel[] = [
  {
    id: 'vessel-001',
    name: '[PLACEHOLDER] FTNEXT Star',
    type: 'Bulk Carrier',
    capacityTonnage: 55000,
    image: '/frames/poster.webp',
  },
  {
    id: 'vessel-002',
    name: '[PLACEHOLDER] FTNEXT Horizon',
    type: 'Coastal Vessel',
    capacityTonnage: 8000,
    image: '/frames/poster.webp',
  },
];
