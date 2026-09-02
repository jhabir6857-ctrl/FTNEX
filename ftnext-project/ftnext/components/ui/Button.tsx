import Link from 'next/link';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-crimson text-chrome hover:bg-crimson-hover hover:shadow-[0_0_20px_rgba(201,26,37,0.4)]',
  secondary:
    'bg-transparent border border-gunmetal text-chrome hover:border-crimson',
  ghost: 'bg-transparent text-steel hover:text-chrome',
};

export function Button({ children, href, onClick, variant = 'primary', type = 'button' }: ButtonProps) {
  const classes = `px-6 py-3 rounded-md font-semibold transition-all duration-200 ${variantClasses[variant]}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
