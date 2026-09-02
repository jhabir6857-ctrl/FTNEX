type StatBlockProps = {
  value: string;
  label: string;
};

export function StatBlock({ value, label }: StatBlockProps) {
  return (
    <div className="text-center">
      <p className="text-4xl font-heading font-bold text-chrome">{value}</p>
      <p className="text-steel text-sm uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}
