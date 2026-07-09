type PasswordStepProps = {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.667 10S4.167 4.167 10 4.167 18.333 10 18.333 10 15.833 15.833 10 15.833 1.667 10 1.667 10Z"
          stroke="#9CA3AF"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="2.5" stroke="#9CA3AF" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 2.5l15 15M8.19 8.19a2.5 2.5 0 0 0 3.62 3.62M6.1 6.12C3.9 7.3 2.4 9.2 1.667 10c.53.86 2.09 3.08 4.4 4.36 1.16.64 2.53 1.14 3.933 1.14 1.4 0 2.55-.36 3.6-.9M13.9 13.9c1.72-1.03 3.02-2.57 3.767-3.9-.6-1.06-2.94-4.79-6.567-5.72"
        stroke="#9CA3AF"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PASSWORD_CHECKS = [
  { key: "hasLetter", label: "영문" },
  { key: "hasNumber", label: "숫자" },
  { key: "hasSpecial", label: "특수문자" },
  { key: "hasMinLength", label: "8자이상" },
] as const;

export function PasswordStep({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  onChangePassword,
  onChangeConfirmPassword,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
}: PasswordStepProps) {
  const checks: Record<(typeof PASSWORD_CHECKS)[number]["key"], boolean> = {
    hasLetter: /[A-Za-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    hasMinLength: password.length >= 8,
  };
  const isConfirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-800">
        비밀번호<span className="text-[#FF7658]">*</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onChangePassword(e.target.value)}
          placeholder="영문, 숫자, 특수문자 8자리 이상"
          className="w-full rounded-xl bg-gray-100 px-4 py-3.5 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute top-1/2 right-3.5 -translate-y-1/2"
        >
          <EyeIcon open={showPassword} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs">
        {PASSWORD_CHECKS.map((c, i) => (
          <span key={c.key} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">·</span>}
            <span className={checks[c.key] ? "text-[#FF7658]" : "text-gray-400"}>{c.label}</span>
          </span>
        ))}
      </div>

      <label className="mt-6 mb-2 block text-sm font-medium text-gray-800">
        비밀번호 확인<span className="text-[#FF7658]">*</span>
      </label>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => onChangeConfirmPassword(e.target.value)}
          placeholder="비밀번호를 재입력해 주세요"
          className="w-full rounded-xl bg-gray-100 px-4 py-3.5 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        <button
          type="button"
          onClick={onToggleShowConfirmPassword}
          aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute top-1/2 right-3.5 -translate-y-1/2"
        >
          <EyeIcon open={showConfirmPassword} />
        </button>
      </div>
      {isConfirmMismatch && (
        <p className="mt-2 text-xs text-[#FF5A5A]">비밀번호가 일치하지 않습니다.</p>
      )}
    </div>
  );
}
