"use client";

import { useState, type ReactNode } from "react";

type SignupKeyboardProps = {
  mode: "qwerty" | "numeric";
  onKey: (char: string) => void;
  onBackspace: () => void;
  onDone: () => void;
};

const QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const NUMERIC_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

function KeyButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex items-center justify-center rounded-md bg-white py-2.5 text-sm font-medium text-gray-900 shadow-sm active:bg-gray-200 ${className}`}
    >
      {children}
    </button>
  );
}

export function SignupKeyboard({ mode, onKey, onBackspace, onDone }: SignupKeyboardProps) {
  const [isUpper, setIsUpper] = useState(true);

  if (mode === "numeric") {
    return (
      <div className="border-t border-gray-200 bg-gray-100 px-2 pt-2 pb-6 select-none">
        {NUMERIC_ROWS.map((row, i) => (
          <div key={i} className="mb-2 flex gap-2">
            {row.map((k) => (
              <KeyButton key={k} onClick={() => onKey(k)} className="flex-1 text-lg">
                {k}
              </KeyButton>
            ))}
          </div>
        ))}
        <div className="flex gap-2">
          <div className="flex-1" />
          <KeyButton onClick={() => onKey("0")} className="flex-1 text-lg">
            0
          </KeyButton>
          <KeyButton onClick={onBackspace} className="flex-1 text-lg">
            ⌫
          </KeyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-gray-100 px-1 pt-2 pb-6 select-none">
      {QWERTY_ROWS.map((row, i) => (
        <div key={i} className="mb-1.5 flex justify-center gap-1">
          {i === 2 && (
            <KeyButton
              onClick={() => setIsUpper((prev) => !prev)}
              className={`w-9 ${isUpper ? "bg-gray-400 text-white" : "bg-gray-300"} active:bg-gray-400`}
            >
              ⇧
            </KeyButton>
          )}
          {row.map((k) => (
            <KeyButton
              key={k}
              onClick={() => onKey(isUpper ? k : k.toLowerCase())}
              className="flex-1"
            >
              {isUpper ? k : k.toLowerCase()}
            </KeyButton>
          ))}
          {i === 2 && (
            <KeyButton onClick={onBackspace} className="w-9 bg-gray-300 active:bg-gray-400">
              ⌫
            </KeyButton>
          )}
        </div>
      ))}
      <div className="flex justify-center gap-1">
        <KeyButton onClick={() => onKey("@")} className="w-12">
          @
        </KeyButton>
        <KeyButton onClick={() => onKey(" ")} className="flex-1">
          space
        </KeyButton>
        <KeyButton onClick={() => onKey(".")} className="w-12">
          .
        </KeyButton>
        <KeyButton onClick={onDone} className="w-16 bg-gray-300 active:bg-gray-400">
          return
        </KeyButton>
      </div>
    </div>
  );
}
