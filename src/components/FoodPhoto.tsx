import { useState } from "react";
import { asset } from "../asset";
import type { Dish } from "../types";
import { resolveDishImage } from "../photo";

export function FoodPhoto({
  dish,
  className,
  alt,
  onClick,
}: {
  dish: Dish;
  className?: string;
  alt?: string;
  onClick?: () => void;
}) {
  const local = asset(`food/${dish.id}.jpg`);
  const [src, setSrc] = useState(local);
  return (
    <img
      className={className}
      src={src}
      alt={alt ?? dish.name}
      onClick={onClick}
      onError={() => {
        if (src !== local) return;
        resolveDishImage(dish).then((url) => {
          if (url !== local) setSrc(url);
        });
      }}
    />
  );
}
