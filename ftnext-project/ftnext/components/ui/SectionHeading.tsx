type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="text-crimson text-xs uppercase tracking-widest font-semibold mb-2">
          {eyebrow}
        </p>
      )}
      <h2>{title}</h2>
      {subtitle && <p className="mt-3 text-steel">{subtitle}</p>}
    </div>
  );
}
