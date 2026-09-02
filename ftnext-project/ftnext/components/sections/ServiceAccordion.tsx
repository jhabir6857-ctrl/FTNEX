'use client';

import { useState } from 'react';
import Image from 'next/image';
import { services } from '@/data/services';

/**
 * Accordion-style service list for the /services page.
 * Each service expands to show its full description.
 * Spec Section 5.3 recommends accordion for simplicity.
 */
export function ServiceAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const isOpen = openId === service.id;
        return (
          <div
            key={service.id}
            className={`bg-slate border rounded-lg transition-all duration-200 ${
              isOpen ? 'border-crimson/40 bg-elevated' : 'border-gunmetal'
            }`}
          >
            <button
              type="button"
              className="w-full flex items-center gap-4 p-6 text-left"
              onClick={() => setOpenId(isOpen ? null : service.id)}
              aria-expanded={isOpen}
              aria-controls={`service-detail-${service.id}`}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={service.icon}
                  alt={`${service.title} icon`}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-chrome font-heading font-semibold text-lg">
                  {service.title}
                </h3>
                <p className="text-steel text-sm mt-1">{service.summary}</p>
              </div>
              <svg
                className={`w-5 h-5 text-steel flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div
                id={`service-detail-${service.id}`}
                className="px-6 pb-6 pt-0"
              >
                <div className="pl-14 border-t border-gunmetal pt-4">
                  <p className="text-steel leading-relaxed">{service.description}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
