export type Partner = {
  id: string;
  name: string;
  logo: string; // path under public/
  category: 'port' | 'agent' | 'technical' | 'other';
  url?: string;
};

// [PLACEHOLDER] Replace with real partner logos/names from client before launch.
export const partners: Partner[] = [
  { id: 'partner-001', name: '[PLACEHOLDER] Partner One', logo: '/vectors/placeholder-logo.svg', category: 'port' },
  { id: 'partner-002', name: '[PLACEHOLDER] Partner Two', logo: '/vectors/placeholder-logo.svg', category: 'agent' },
  { id: 'partner-003', name: '[PLACEHOLDER] Partner Three', logo: '/vectors/placeholder-logo.svg', category: 'technical' },
];
