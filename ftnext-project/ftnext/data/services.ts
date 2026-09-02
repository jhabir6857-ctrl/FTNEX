export type Service = {
  id: string;
  title: string;
  icon: string; // path under public/vectors/
  summary: string; // 1-2 sentence card copy
  description: string; // full copy for /services detail
};

// [PLACEHOLDER] Mirrors Akij's category set per spec Section 5.1 — confirm
// final service names/copy with client before launch.
export const services: Service[] = [
  {
    id: 'ship-owners',
    title: 'Ship Owners',
    icon: '/vectors/ship-owners.svg',
    summary: '[PLACEHOLDER] Owners of cost-efficient bulk carrier fleets operating worldwide.',
    description: '[PLACEHOLDER] Full description of ship-owning operations, fleet growth strategy, and standards.',
  },
  {
    id: 'charterer-operator',
    title: 'Ship Charterer / Operator',
    icon: '/vectors/charterer.svg',
    summary: '[PLACEHOLDER] Dedicated chartering team maintaining relationships with reputable partners.',
    description: '[PLACEHOLDER] Full description of chartering and operations services.',
  },
  {
    id: 'technical-manager',
    title: 'Technical Manager',
    icon: '/vectors/technical.svg',
    summary: '[PLACEHOLDER] Experienced, qualified personnel managing dry cargo vessels to optimum standards.',
    description: '[PLACEHOLDER] Full description of technical management services.',
  },
  {
    id: 'shipping-agent',
    title: 'Shipping Agent',
    icon: '/vectors/agent.svg',
    summary: '[PLACEHOLDER] Extensive complementary services beyond standard ship agency.',
    description: '[PLACEHOLDER] Full description of shipping agent services.',
  },
  {
    id: 'trading',
    title: 'Trading',
    icon: '/vectors/trading.svg',
    summary: '[PLACEHOLDER] Part of a larger conglomerate, trading across multiple industries.',
    description: '[PLACEHOLDER] Full description of trading operations.',
  },
  {
    id: 'coastal-vessels',
    title: 'Coastal Vessels',
    icon: '/vectors/coastal.svg',
    summary: '[PLACEHOLDER] Operating coastal vessels in domestic waters, with fleet expansion planned.',
    description: '[PLACEHOLDER] Full description of coastal vessel operations.',
  },
];
