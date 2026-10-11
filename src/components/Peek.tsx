import type { KitchenId } from "../types";
import { FriendPhoto } from "./FriendPhoto";

/** One cutout character, never circular, never on top of food. */
export function Cutout({
  id,
  className,
}: {
  id: KitchenId;
  className?: string;
}) {
  return <FriendPhoto id={id} cutout className={`cutout ${className ?? ""}`} />;
}
