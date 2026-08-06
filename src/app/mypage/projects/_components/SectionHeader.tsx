export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex w-full items-center gap-2.5 px-6 text-[17px] leading-[1.35] font-semibold whitespace-nowrap">
      <p className="text-[#1F1F1F]">{title}</p>
      {typeof count === "number" && <p className="text-[#AC4A35]">{count}</p>}
    </div>
  );
}
