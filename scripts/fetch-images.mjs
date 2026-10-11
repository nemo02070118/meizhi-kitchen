import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { POOL, poolFor } from "./food-urls.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "src/data/dishes.ts"), "utf8");
const rows = [...src.matchAll(
  /d\("([^"]+)",\s*"([^"]+)",\s*"[^"]*",\s*"[^"]+",\s*"[^"]+",\s*"([^"]+)",\s*\d,\s*"[^"]+",\s*"([^"]+)",\s*"([^"]+)"/g,
)];

const foodDir = path.join(root, "public/food");
fs.mkdirSync(foodDir, { recursive: true });
fs.mkdirSync(path.join(root, "public/friends"), { recursive: true });

function pick(id, name, category, role) {
  const key = poolFor(name, category, role);
  const list = POOL[key] ?? POOL.chinese;
  let h = 0;
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

async function save(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "MeizhiDuffyKitchen/1.0" } });
  if (!res.ok) throw new Error(String(res.status));
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

let ok = 0;
for (const [, id, name, category, role] of rows) {
  const dest = path.join(foodDir, `${id}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 4000) {
    ok += 1;
    continue;
  }
  const url = pick(id, name, category, role);
  try {
    await save(url, dest);
    ok += 1;
    console.log("ok", id, name);
  } catch (e) {
    console.log("fail", id, e.message);
  }
}

console.log(`food cached ${ok}/${rows.length}`);
