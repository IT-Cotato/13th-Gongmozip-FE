const AVATAR_SIZE = 44;
const AVATAR_OVERLAP = 32;
const MAX_VISIBLE_AVATARS = 3;

// 백엔드가 팀원별 프로필 사진 없이 인원수(memberCount)만 내려주므로,
// 실제 사진 대신 인원수만큼(최대 3개) 동일한 플레이스홀더 아바타를 겹쳐 보여줌.
export function TeammateAvatars({ memberCount }: { memberCount: number }) {
  const visibleCount = Math.max(1, Math.min(memberCount, MAX_VISIBLE_AVATARS));
  const stackWidth = AVATAR_SIZE + (visibleCount - 1) * (AVATAR_SIZE - AVATAR_OVERLAP);

  return (
    <div className="relative size-[68px] shrink-0">
      <div
        className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
        style={{ width: stackWidth }}
      >
        {Array.from({ length: visibleCount }).map((_, index) => (
          <div
            key={index}
            className={`bg-color-green-100 relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white ${
              index > 0 ? "-ml-8" : ""
            }`}
          >
            <img
              src="/images/project-teammate-placeholder.png"
              alt=""
              className="absolute inset-[11.67%_11%_11.33%_11%] size-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
