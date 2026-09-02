import type { Config } from 'tailwindcss';

// Brand tokens — see ftnext-build-spec.md Section 4. Do not rename these keys;
// components throughout the spec reference them by these exact names.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#C91A25',
          hover: '#E02430',
        },
        gunmetal: '#3A3F47',
        chrome: '#E2E8F0',
        steel: '#94A3B8',
        onyx: '#0B0E14',
        slate: '#131822',
        elevated: '#1C2331',
      },
      fontFamily: {
        // Confirm final typefaces with client — see Section 10, item 3.
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
};

export default config;
