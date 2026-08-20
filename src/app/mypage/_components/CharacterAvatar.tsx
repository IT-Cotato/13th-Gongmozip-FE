import { useId } from "react";
import { EditIcon } from "./icons";
import type { Palette } from "@/queries/useCharacterPalettesQuery";

// 캐릭터 아바타의 배경은 원형이 아니라 이 조약돌 모양 벡터 하나로만 그린다
// (피그마 node 1486-30838). 예전 코드처럼 이 벡터 위에 별도의 원형 배경을
// 덧씌우면 벡터의 모서리가 원 밖으로 삐져나와 배경이 두 겹으로 겹쳐 보인다.
const BLOB_PATH =
  "M41.2102 2.17027C51.7702 3.702 61.3845 8.17477 68.8268 15.8663C76.1563 23.4411 80.6362 33.1043 81.3478 43.6516C82.1167 55.0469 80.5739 67.1142 72.8491 75.4837C64.9044 84.0914 52.7792 88.7202 41.2102 87.1387C30.6481 85.6949 24.0176 76.062 17.1405 67.8683C11.0841 60.6524 6.64615 52.8931 4.71069 43.6516C2.07266 31.0553 -4.19178 16.1437 4.28924 6.50514C12.8273 -3.19823 28.4613 0.321049 41.2102 2.17027Z";
const BLOB_FALLBACK_FILL = "#F2F1EA";

function AvatarBlob({ palette }: { palette?: Palette }) {
  const gradientId = useId();
  const hasGradient = palette?.style === "GRADIENT" && Boolean(palette.secondaryHex);
  const fill = !palette
    ? BLOB_FALLBACK_FILL
    : hasGradient
      ? `url(#${gradientId})`
      : palette.primaryHex;

  return (
    <svg
      viewBox="0 0 82 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      {hasGradient && palette && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primaryHex} />
            <stop offset="100%" stopColor={palette.secondaryHex ?? palette.primaryHex} />
          </linearGradient>
        </defs>
      )}
      <path fillRule="evenodd" clipRule="evenodd" d={BLOB_PATH} fill={fill} />
    </svg>
  );
}

export function CharacterAvatar({
  imageSrc,
  label,
  palette,
  onEditClick,
  editAriaLabel = "캐릭터 관리",
}: {
  imageSrc: string | null;
  label?: string;
  palette: Palette | undefined;
  onEditClick: () => void;
  editAriaLabel?: string;
}) {
  return (
    <div className="relative size-[92px] shrink-0">
      <div className="absolute inset-[3%_5%]">
        <AvatarBlob palette={imageSrc ? palette : undefined} />
      </div>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={label ?? ""}
          className="pointer-events-none absolute inset-[11.67%_11%_11.33%_11%] object-cover"
        />
      )}
      <button
        type="button"
        onClick={onEditClick}
        aria-label={editAriaLabel}
        className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#EFEFEF] text-black"
      >
        <EditIcon />
      </button>
    </div>
  );
}
