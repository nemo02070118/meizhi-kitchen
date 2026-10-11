import { useState } from "react";
import { asset, localAsset } from "../asset";
import type { Dish } from "../types";
import { resolveDishImage } from "../photo";

export function FoodPhoto({
  dish,
  className,
  alt,
  onClick,
  eager,
}: {
  dish: Dish;
  className?: string;
  alt?: string;
  onClick?: () => void;
  eager?: boolean;
}) {
  const cdn = asset(`food/${dish.id}.jpg`);
  const local = localAsset(`food/${dish.id}.jpg`);
  const [src, setSrc] = useState(cdn);
  return (
    <img
      className={className}
      src={src}
      alt={alt ?? dish.name}
      onClick={onClick}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "low"}
      onError={() => {
        if (src === cdn && cdn !== local) {
          setSrc(local);
          return;
        }
        if (src !== local && src !== cdn) return;
        resolveDishImage(dish).then((url) => {
          if (url !== src) setSrc(url);
        });
      }}
    />
  );
}
