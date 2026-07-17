"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const ONBOARDING_SEEN_KEY = "gongmozip:mypage-onboarding-seen";
const HIGHLIGHT_PADDING = 8;
const ARROW_CLEARANCE = 14;

type PopupSide = "below" | "above";

type CoachmarkStep = {
  targetSelector: string;
  popupSide: PopupSide;
  title?: ReactNode;
  description: ReactNode;
  buttonLabel: string;
};

const STEPS: CoachmarkStep[] = [
  {
    targetSelector: '[data-coachmark="collab-distance"]',
    popupSide: "below",
    title: (
      <>
        <span className="text-[#AC4A35]">협업거리</span>를 나타내요.
      </>
    ),
    description: (
      <>
        함께 공모전을 완주할수록 거리가 쌓이고,
        <br />
        이탈하거나 함께한 팀원들의 평가가 낮으면
        <br />
        거리가 줄어들어요.
      </>
    ),
    buttonLabel: "다음",
  },
  {
    targetSelector: '[data-coachmark="collab-distance"]',
    popupSide: "below",
    description: (
      <>
        공모전을 많이 완주하고,
        <br />
        팀원들에게도 좋은 평가를 받으면
        <br />
        이렇게 협업거리가 늘어나는 거에요 !
        <br />
        협업거리는 <span className="text-[#AC4A35]">향후 매칭에도 반영되는 중요한 지표</span>
        입니다.
      </>
    ),
    buttonLabel: "다음",
  },
  {
    targetSelector: '[data-coachmark="profile-stat"]',
    popupSide: "below",
    title: (
      <>
        <span className="text-[#AC4A35]">프로필을 작성하고 관리</span>할 수 있어요.
      </>
    ),
    description: (
      <>
        내 역량을 입력하면 딱 맞는 팀원과 매칭돼요.
        <br />
        활동이력·기본정보 등은 필수 입력이에요.
      </>
    ),
    buttonLabel: "다음",
  },
  {
    targetSelector: '[data-nav-item="team-matching"]',
    popupSide: "above",
    title: "이곳에서 팀원 매칭이 이루어져요.",
    description: (
      <>
        <span className="text-[#AC4A35]">팀 먼저, 공모전은 그다음.</span>
        <br />
        관심사 기반으로 팀을 구성하고
        <br />
        함께 도전할 공모전을 골라요.
      </>
    ),
    buttonLabel: "완료",
  },
];

type TargetRect = { top: number; left: number; width: number; height: number };

function noopSubscribe() {
  return () => {};
}

function getOnboardingSeenSnapshot() {
  return localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";
}

function getOnboardingSeenServerSnapshot() {
  return true;
}

/** Tracks the on-screen position of the coachmark target as an external store, so
 * position updates come from real subscriptions (resize/scroll) instead of effect-driven setState. */
function useTargetRect(selector: string, enabled: boolean): TargetRect | null {
  const cacheRef = useRef<TargetRect | null>(null);

  const getSnapshot = useCallback(() => {
    if (!enabled) return null;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) {
      cacheRef.current = null;
      return null;
    }
    const domRect = el.getBoundingClientRect();
    const prev = cacheRef.current;
    if (
      prev &&
      prev.top === domRect.top &&
      prev.left === domRect.left &&
      prev.width === domRect.width &&
      prev.height === domRect.height
    ) {
      return prev;
    }
    const next = {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
    };
    cacheRef.current = next;
    return next;
  }, [selector, enabled]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!enabled) return () => {};
      const resizeObserver = new ResizeObserver(onStoreChange);
      resizeObserver.observe(document.documentElement);
      const target = document.querySelector<HTMLElement>(selector);
      if (target) resizeObserver.observe(target);
      window.addEventListener("resize", onStoreChange);
      window.addEventListener("scroll", onStoreChange, true);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", onStoreChange);
        window.removeEventListener("scroll", onStoreChange, true);
      };
    },
    [selector, enabled],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function OnboardingCoachmark() {
  const hasSeenOnboarding = useSyncExternalStore(
    noopSubscribe,
    getOnboardingSeenSnapshot,
    getOnboardingSeenServerSnapshot,
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const isActive = !hasSeenOnboarding && !isDismissed;
  const step = STEPS[stepIndex];
  const rect = useTargetRect(step.targetSelector, isActive);

  useEffect(() => {
    if (!isActive) return;
    const el = document.querySelector<HTMLElement>(step.targetSelector);
    el?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [isActive, step.targetSelector]);

  function finishOnboarding() {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    setIsDismissed(true);
  }

  function handleNext() {
    if (stepIndex === STEPS.length - 1) {
      finishOnboarding();
      return;
    }
    setStepIndex((current) => current + 1);
  }

  if (!isActive || !rect) return null;

  const isLastStep = stepIndex === STEPS.length - 1;

  // Center the popup on the target, but clamp it to stay fully on-screen; the arrow
  // shifts back by the clamp amount so it still points at the (possibly off-center) target.
  const sideMargin = 16;
  const popupWidth = Math.min(350, window.innerWidth - sideMargin * 2);
  const targetCenterX = rect.left + rect.width / 2;
  const popupCenterX = Math.min(
    Math.max(targetCenterX, sideMargin + popupWidth / 2),
    window.innerWidth - sideMargin - popupWidth / 2,
  );
  const arrowMaxOffset = popupWidth / 2 - 24;
  const arrowOffsetX = Math.min(
    Math.max(targetCenterX - popupCenterX, -arrowMaxOffset),
    arrowMaxOffset,
  );

  return (
    <div className="fixed inset-0 z-40">
      <div aria-hidden="true" className="absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-2xl"
        style={{
          top: rect.top - HIGHLIGHT_PADDING,
          left: rect.left - HIGHLIGHT_PADDING,
          width: rect.width + HIGHLIGHT_PADDING * 2,
          height: rect.height + HIGHLIGHT_PADDING * 2,
          boxShadow: "0 0 0 9999px rgba(31,31,31,0.6)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute flex w-[350px] max-w-[calc(100vw-32px)] flex-col items-center drop-shadow-[0_2px_5px_rgba(0,0,0,0.1),0_9px_9px_rgba(0,0,0,0.09),0_19px_12px_rgba(0,0,0,0.05)]"
        style={{
          left: popupCenterX,
          transform: "translateX(-50%)",
          ...(step.popupSide === "below"
            ? { top: rect.top + rect.height + HIGHLIGHT_PADDING + ARROW_CLEARANCE }
            : { bottom: window.innerHeight - (rect.top - HIGHLIGHT_PADDING) + ARROW_CLEARANCE }),
        }}
      >
        {step.popupSide === "below" && <ArrowPointer offsetX={arrowOffsetX} />}
        <div className="flex w-full flex-col items-center rounded-2xl bg-white px-4 pt-2 pb-4">
          <div className="flex w-full flex-col items-center gap-2.5 px-1 pt-4 pb-2 text-center">
            {step.title && (
              <p className="w-full text-[20px] leading-[1.35] font-medium break-keep text-[#1F1F1F]">
                {step.title}
              </p>
            )}
            <p className="w-full text-[17px] leading-[1.5] font-medium break-keep text-[#616161]">
              {step.description}
            </p>
          </div>
          <div className="flex w-full items-center justify-between">
            <StepDots total={STEPS.length} current={stepIndex} />
            <button
              type="button"
              onClick={handleNext}
              className="flex h-7 items-center gap-0.5 rounded-[10px] bg-[#616161] px-1.5 py-[7px] text-[13px] font-semibold text-white"
            >
              {step.buttonLabel}
              {!isLastStep && <ChevronRightIcon />}
            </button>
          </div>
        </div>
        {step.popupSide === "above" && <ArrowPointer flipped offsetX={arrowOffsetX} />}
      </div>
    </div>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`size-1 rounded-full bg-[#616161] ${index === current ? "" : "opacity-50"}`}
        />
      ))}
    </div>
  );
}

function ArrowPointer({ flipped = false, offsetX = 0 }: { flipped?: boolean; offsetX?: number }) {
  return (
    <div
      className="flex w-full justify-center"
      style={{ transform: `translateX(${offsetX}px) scaleY(${flipped ? -1 : 1})` }}
    >
      <svg width="28" height="9" viewBox="0 0 100 30.6512" fill="none">
        <path
          d="M41.003 2.76918C46.4328 -0.923057 53.5672 -0.92306 58.997 2.76917L100 30.6512H0L41.003 2.76918Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.91087 4.41087C7.23631 4.08544 7.76382 4.08544 8.08926 4.41087L13.0893 9.41087C13.4146 9.73631 13.4147 10.2638 13.0893 10.5893L8.08926 15.5893C7.76384 15.9147 7.23631 15.9146 6.91087 15.5893C6.58543 15.2638 6.58543 14.7363 6.91087 14.4109L11.3217 10.0001L6.91087 5.58926C6.58543 5.26382 6.58543 4.73631 6.91087 4.41087Z"
        fill="white"
      />
    </svg>
  );
}
