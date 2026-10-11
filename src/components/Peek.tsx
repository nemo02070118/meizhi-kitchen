import { useState, type ReactNode } from "react";
import type { KitchenId } from "../types";
import { FriendPhoto } from "./FriendPhoto";

export function Peek({
  id,
  pose = "hang",
  talk = "扒在这儿～",
}: {
  id: KitchenId;
  pose?: "hang" | "sit" | "edge-left" | "edge-right" | "edge-top";
  talk?: string;
}) {
  const [pop, setPop] = useState(false);
  return (
    <button
      type="button"
      className={`peek peek-${pose} ${pop ? "pop" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setPop(true);
        window.setTimeout(() => setPop(false), 900);
      }}
      aria-label={id}
    >
      <FriendPhoto id={id} />
      {pop && <span className="peek-talk">{talk}</span>}
    </button>
  );
}

export function ScenePeeks({ kitchen }: { kitchen: KitchenId }) {
  return (
    <div className="scene-peeks">
      <Peek id="duffy" pose="edge-left" talk="点菜点菜！" />
      <Peek id={kitchen} pose="edge-right" talk="我扒在页面上哦" />
      <Peek id="linabell" pose="edge-top" talk="今日线索来啦" />
    </div>
  );
}

export function FoodStage({
  kitchen,
  children,
}: {
  kitchen: KitchenId;
  children: ReactNode;
}) {
  return (
    <div className="food-stage">
      <Peek id={kitchen} pose="hang" talk="这道好吃！" />
      {children}
      <Peek id="duffy" pose="sit" talk="记下啦" />
    </div>
  );
}
