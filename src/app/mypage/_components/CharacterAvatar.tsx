import { AvatarPlaceholderIcon, EditIcon } from "./icons";
import { getPaletteStyle } from "../_lib/collaborationCharacter";
import type { Palette } from "@/queries/useCharacterPalettesQuery";

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
        <AvatarPlaceholderIcon />
      </div>
      {imageSrc && (
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={getPaletteStyle(palette)}
        >
          <img
            src={imageSrc}
            alt={label ?? ""}
            className="absolute inset-[11.67%_11%_11.33%_11%] object-cover"
          />
        </div>
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
