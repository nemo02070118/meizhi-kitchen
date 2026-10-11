import { useState } from "react";
import { asset, localAsset } from "../asset";

export const MEIZHI_SHOTS = [
  { id: "now", caption: "现在的美志" },
  { id: "little", caption: "小时候" },
  { id: "train", caption: "在路上" },
  { id: "glasses", caption: "看手机" },
] as const;

export type MeizhiShot = (typeof MEIZHI_SHOTS)[number]["id"];

export function MeizhiPhoto({
  id,
  className,
  eager,
}: {
  id: MeizhiShot;
  className?: string;
  eager?: boolean;
}) {
  const cdn = asset(`meizhi/${id}.jpg`);
  const local = localAsset(`meizhi/${id}.jpg`);
  const [src, setSrc] = useState(cdn);
  return (
    <img
      className={className}
      src={src}
      alt="美志"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "low"}
      onError={() => {
        if (src === cdn && cdn !== local) setSrc(local);
      }}
    />
  );
}

export function PolaroidStrip({
  compact,
  exclude = [],
}: {
  compact?: boolean;
  exclude?: MeizhiShot[];
}) {
  const shots = MEIZHI_SHOTS.filter((s) => !exclude.includes(s.id));
  return (
    <div className={`polaroids n${shots.length} ${compact ? "compact" : ""}`}>
      {shots.map((s) => (
        <figure key={s.id} className={`polaroid shot-${s.id}`}>
          <MeizhiPhoto id={s.id} />
          <figcaption>{s.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
