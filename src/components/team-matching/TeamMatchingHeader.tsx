import Link from "next/link";

type TeamMatchingHeaderProps = {
  backHref?: string;
  title?: string;
};

export default function TeamMatchingHeader({
  backHref = "/team-matching",
  title = "팀원 매칭",
}: TeamMatchingHeaderProps) {
  return (
    <header className="flex h-[46px] shrink-0 items-center justify-between bg-white px-4 py-1">
      <Link
        aria-label="뒤로가기"
        className="flex h-6 w-6 items-center justify-center"
        href={backHref}
      >
        <span className="block h-[10px] w-[10px] rotate-45 border-b-2 border-l-2 border-[#1F1F1F]" />
      </Link>
      <h1 className="text-center font-[Roboto] text-[17px] font-semibold leading-[135%] text-[#111111]">
        {title}
      </h1>
      <span className="h-6 w-6" aria-hidden="true" />
    </header>
  );
}
