import { useState } from "react";
import { asset, localAsset } from "../asset";
import type { KitchenId } from "../types";

export function FriendPhoto({
  id,
  className,
  cutout,
  eager,
}: {
  id: KitchenId;
  className?: string;
  cutout?: boolean;
  eager?: boolean;
}) {
  const file = cutout ? `friends/cut/${id}.png` : `friends/${id}.jpg`;
  const cdn = asset(file);
  const local = localAsset(file);
  const [src, setSrc] = useState(cdn);
  return (
    <img
      className={className}
      src={src}
      alt={id}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (src === cdn && cdn !== local) setSrc(local);
      }}
    />
  );
}
