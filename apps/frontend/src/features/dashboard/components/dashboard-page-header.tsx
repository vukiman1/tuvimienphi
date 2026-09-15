interface DashboardPageHeaderProps {
  title: string;
  description: string;
}

export function DashboardPageHeader({ title, description }: DashboardPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-semibold text-[#1a1412]">{title}</h1>
      <p className="mt-2 text-sm text-[#6b5a4e]">{description}</p>
    </div>
  );
}
