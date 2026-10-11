import { DISH_MAP } from "./data/dishes";
import type { CartItem, Taste } from "./types";

export function spiceLabel(n: number) {
  return ["不辣", "少辣", "中辣", "特辣"][n] ?? "少辣";
}

export function itemLine(item: CartItem) {
  const dish = DISH_MAP[item.dishId];
  const bits = [
    dish?.name ?? item.dishId,
    `×${item.qty}`,
    spiceLabel(item.spice),
    item.portion === "two" ? "两人份" : "美志一份",
  ];
  if (!item.cilantro) bits.push("不要香菜");
  if (dish?.hasZheergen && !item.zheergen) bits.push("不要折耳根");
  if (item.staple) bits.push(`加${item.staple}`);
  return bits.join(" · ");
}

export function ticketText(items: CartItem[], note: string, taste: Taste) {
  const lines = [
    "美志的达菲厨房 · 订单小票",
    `口味档案：默认${spiceLabel(taste.spice)} / 香菜${taste.cilantro ? "要" : "不要"} / 折耳根${taste.zheergen ? "要" : "不要"}`,
    "",
    ...items.map(itemLine),
    "",
    "采购清单：",
    ...shopList(items),
    note ? `\n美志说：${note}` : "",
    "",
    "请达菲（男朋友）下厨。",
  ];
  return lines.filter((x) => x !== undefined).join("\n");
}

export function shopList(items: CartItem[]) {
  const bag = new Set<string>();
  for (const item of items) {
    const dish = DISH_MAP[item.dishId];
    dish?.shop.forEach((s) => bag.add(s));
  }
  return [...bag].map((s) => `· ${s}`);
}
