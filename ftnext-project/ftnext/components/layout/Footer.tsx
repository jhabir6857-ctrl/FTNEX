import Link from 'next/link';
import Image from 'next/image';
import { navLinks, offices, socialLinks } from '@/data/site-config';

export function Footer() {
  return (
    <footer className="bg-onyx border-t border-gunmetal px-6 py-12">
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3">
        <div>
          <Link href="/" className="inline-block mb-4 group">
            <Image
              src="/logo-full.png"
              alt="FTNeX Logistics"
              width={180}
              height={63}
              className="h-12 w-auto object-contain transition-opacity group-hover:opacity-90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            />
          </Link>
          <p className="text-steel text-sm">[PLACEHOLDER] Short company tagline.</p>
        </div>
        <div>
          <p className="text-chrome font-semibold mb-3">Navigate</p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-steel hover:text-chrome text-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-chrome font-semibold mb-3">Contact</p>
          {offices.map((office) => (
            <div key={office.id} className="text-steel text-sm mb-3">
              <p>{office.label}</p>
              <p>{office.address}</p>
              <p>{office.email}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gunmetal text-steel text-xs flex justify-between">
        <p>&copy; {new Date().getFullYear()} FTNEXT. All rights reserved.</p>
        <div className="flex gap-4">
          <span>{socialLinks.facebook}</span>
          <span>{socialLinks.linkedin}</span>
        </div>
      </div>
    </footer>
  );
}
