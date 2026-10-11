import fs from "node:fs";
import path from "node:path";

const dir = "public/food";
const donorPath = path.join(dir, "ah-chou.jpg");
const donor = fs.readFileSync(donorPath);
const url = "https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=900";
const res = await fetch(url);
const buf = Buffer.from(await res.arrayBuffer());
let n = 0;
for (const f of fs.readdirSync(dir)) {
  if (f === "ah-chou.jpg") continue;
  const p = path.join(dir, f);
  if (fs.readFileSync(p).equals(donor)) {
    fs.writeFileSync(p, buf);
    n += 1;
  }
}
console.log("replaced", n);
