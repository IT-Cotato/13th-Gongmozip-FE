import { EditIcon } from "@/app/mypage/_components/icons";
import { CloseIcon } from "../../../_components/icons";

export type Certificate = {
  name: string;
  category: string;
  grade: string;
  year: string;
};

type CertificateCardProps = {
  certificate: Certificate;
  onEdit: () => void;
  onDelete: () => void;
};

export function CertificateCard({ certificate, onEdit, onDelete }: CertificateCardProps) {
  return (
    <div className="relative flex w-full flex-col items-start gap-2.5 rounded-2xl border border-[rgba(97,97,97,0.16)] p-4">
      <span className="rounded-full bg-[#616161] px-2 py-1 text-xs leading-[1.35] font-semibold text-white">
        {certificate.category}
      </span>

      <div className="flex w-full flex-col gap-1">
        <p className="px-1 text-[17px] leading-[1.35] font-medium text-[#1f1f1f]">
          {certificate.name}
        </p>
        <div className="flex items-center gap-1 px-1 text-xs leading-[1.35] text-[#616161]">
          {certificate.grade && (
            <>
              <span className="font-semibold">{certificate.grade}</span>
              {certificate.year && (
                <span className="size-[2px] shrink-0 rounded-full bg-[#616161]" />
              )}
            </>
          )}
          {certificate.year && <span>{certificate.year}</span>}
        </div>
      </div>

      <div className="absolute top-[15px] right-[15px] flex items-center gap-1">
        <button
          type="button"
          aria-label="자격증 수정"
          onClick={onEdit}
          className="flex size-7 items-center justify-center rounded-[10px]"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          aria-label="자격증 삭제"
          onClick={onDelete}
          className="flex size-7 items-center justify-center rounded-[10px]"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
