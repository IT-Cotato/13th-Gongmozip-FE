import type { ProjectTeammate } from "@/queries/useOngoingProjectsQuery";

const AVATAR_SIZE = 44;
const AVATAR_OVERLAP = 32;
const MAX_VISIBLE_AVATARS = 3;

function TeammateAvatar({
  profileImageUrl,
  className,
}: {
  profileImageUrl: string | null;
  className?: string;
}) {
  return (
    <div
      className={`relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-color-green-100 ${className ?? ""}`}
    >
      {profileImageUrl ? (
        <img src={profileImageUrl} alt="" className="size-full object-cover" />
      ) : (
        <img
          src="/images/project-teammate-placeholder.png"
          alt=""
          className="absolute inset-[11.67%_11%_11.33%_11%] size-full object-contain"
        />
      )}
    </div>
  );
}

export function TeammateAvatars({ teammates }: { teammates: ProjectTeammate[] }) {
  const visible = teammates.slice(0, MAX_VISIBLE_AVATARS);
  const stackWidth = AVATAR_SIZE + (visible.length - 1) * (AVATAR_SIZE - AVATAR_OVERLAP);

  return (
    <div className="relative size-[68px] shrink-0">
      <div
        className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
        style={{ width: stackWidth }}
      >
        {visible
          .slice()
          .reverse()
          .map((teammate, index) => (
            <TeammateAvatar
              key={teammate.id}
              profileImageUrl={teammate.profileImageUrl}
              className={index > 0 ? "-ml-8" : ""}
            />
          ))}
      </div>
    </div>
  );
}
