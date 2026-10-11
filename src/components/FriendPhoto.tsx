import { asset } from "../asset";
import type { KitchenId } from "../types";

export function FriendPhoto({
  id,
  className,
  cutout,
}: {
  id: KitchenId;
  className?: string;
  cutout?: boolean;
}) {
  return (
    <img
      className={className}
      src={cutout ? asset(`friends/cut/${id}.png`) : asset(`friends/${id}.jpg`)}
      alt={id}
    />
  );
}
