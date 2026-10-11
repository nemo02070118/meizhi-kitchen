import { asset } from "../asset";
import type { KitchenId } from "../types";

export function FriendPhoto({ id, className }: { id: KitchenId; className?: string }) {
  return <img className={className} src={asset(`friends/${id}.jpg`)} alt={id} />;
}
