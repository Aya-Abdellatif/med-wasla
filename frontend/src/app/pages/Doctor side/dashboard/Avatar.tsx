import { getDisplayInitial } from "../../../../utils/displayName";
import { getAvatarColor } from "./dashboardUtils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const sizeMap = { sm: "w-10 h-10 text-base", md: "w-12 h-12 text-lg", lg: "w-24 h-24 text-3xl" };
  const { bg, text } = getAvatarColor(name);
  const initial = getDisplayInitial(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: bg, color: text }}
    >
      {initial}
    </div>
  );
}
