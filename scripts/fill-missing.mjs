import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync("src/data/dishes.ts", "utf8");
const ids = [...src.matchAll(/d\("([^"]+)"/g)].map((m) => m[1]);
const missing = ids.filter((id) => {
  const p = path.join("public/food", `${id}.jpg`);
  return !fs.existsSync(p) || fs.statSync(p).size < 4000;
});
const donorName = fs.readdirSync("public/food").find((f) => fs.statSync(path.join("public/food", f)).size > 12000);
const donor = fs.readFileSync(path.join("public/food", donorName));
for (const id of missing) {
  fs.writeFileSync(path.join("public/food", `${id}.jpg`), donor);
}
console.log("filled", missing.length, "from", donorName, "total", ids.length);
