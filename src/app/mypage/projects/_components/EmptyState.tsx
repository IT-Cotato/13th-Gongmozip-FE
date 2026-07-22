export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-[7px] px-6 py-2 text-center">
      <p className="text-[15px] leading-[1.25] font-medium text-[#616161]">
        {icon} {title}
      </p>
      <p className="text-xs leading-[1.35] text-[rgba(97,97,97,0.6)]">{description}</p>
    </div>
  );
}
