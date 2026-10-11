import { asset } from "../asset";

export const MEIZHI_SHOTS = [
  { id: "little", caption: "小时候的美志" },
  { id: "now", caption: "现在的美志" },
  { id: "glasses", caption: "眼镜杀" },
  { id: "train", caption: "旅途里" },
] as const;

export type MeizhiShot = (typeof MEIZHI_SHOTS)[number]["id"];

export function MeizhiPhoto({ id, className }: { id: MeizhiShot; className?: string }) {
  return <img className={className} src={asset(`meizhi/${id}.jpg`)} alt="美志" />;
}

export function PolaroidStrip({ compact }: { compact?: boolean }) {
  return (
    <div className={`polaroids ${compact ? "compact" : ""}`}>
      {MEIZHI_SHOTS.map((s, i) => (
        <figure key={s.id} className={`polaroid r${i}`}>
          <MeizhiPhoto id={s.id} />
          <figcaption>{s.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
