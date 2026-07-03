export type Gender = "male" | "female" | null;

type InfoStepProps = {
  gender: Gender;
  onChangeGender: (gender: Gender) => void;
  birthdateDisplay: string;
  onChangeBirthdate: (digits: string) => void;
  onFocusBirthdate: () => void;
};

function RadioOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="flex items-center gap-2">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? "border-[#FF7658]" : "border-gray-300"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#FF7658]" />}
      </span>
      <span className="text-sm text-gray-800">{label}</span>
    </button>
  );
}

export function InfoStep({
  gender,
  onChangeGender,
  birthdateDisplay,
  onChangeBirthdate,
  onFocusBirthdate,
}: InfoStepProps) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-gray-800">
        성별<span className="text-[#FF7658]">*</span>
      </label>
      <div className="mb-6 flex gap-6">
        <RadioOption
          label="남성"
          selected={gender === "male"}
          onSelect={() => onChangeGender("male")}
        />
        <RadioOption
          label="여성"
          selected={gender === "female"}
          onSelect={() => onChangeGender("female")}
        />
      </div>

      <label className="mb-2 block text-sm font-medium text-gray-800">
        생년월일<span className="text-[#FF7658]">*</span>
      </label>
      <input
        inputMode="numeric"
        value={birthdateDisplay}
        onChange={(e) => onChangeBirthdate(e.target.value.replace(/\D/g, "").slice(0, 8))}
        onFocus={onFocusBirthdate}
        placeholder="YYYY/MM/DD"
        className="w-full rounded-xl bg-gray-100 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
      />
    </div>
  );
}
