import { ToggleCheckIcon } from "./icons";

type ToggleProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`flex h-5 w-8 shrink-0 items-center rounded-full p-[2px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[#FF7658]" : "bg-[#DFDFDF]"
      }`}
    >
      <span
        className={`flex size-4 items-center justify-center rounded-full bg-white transition-transform ${
          checked ? "translate-x-3" : "translate-x-0"
        }`}
      >
        {checked && <ToggleCheckIcon />}
      </span>
    </button>
  );
}
