import { localAsset } from "./asset";
import type { Dish, KitchenId } from "./types";

const mem = new Map<string, string>();

async function wikiThumb(title: string, lang: "zh" | "en" = "zh"): Promise<string | null> {
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
    `&prop=pageimages&format=json&pithumbsize=900&origin=*`;
  const res = await fetch(url);
  const json = await res.json();
  const pages = json.query?.pages ?? {};
  for (const page of Object.values(pages) as { thumbnail?: { source: string } }[]) {
    if (page.thumbnail?.source) return page.thumbnail.source;
  }
  return null;
}

async function commonsThumb(query: string): Promise<string | null> {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6" +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=imageinfo` +
    "&iiprop=url&iiurlwidth=900&format=json&origin=*";
  const res = await fetch(url);
  const json = await res.json();
  const pages = json.query?.pages ?? {};
  for (const page of Object.values(pages) as { imageinfo?: { thumburl?: string; url?: string }[] }[]) {
    const info = page.imageinfo?.[0];
    const src = info?.thumburl || info?.url;
    if (src && /\.(jpe?g|png|webp)$/i.test(src.split("?")[0])) return src;
  }
  return null;
}

export async function resolveDishImage(dish: Dish): Promise<string> {
  const local = localAsset(`food/${dish.id}.jpg`);
  const cached = mem.get(dish.id) || localStorage.getItem(`foodimg:${dish.id}`);
  if (cached) return cached;
  try {
    const head = await fetch(local, { method: "HEAD" });
    if (head.ok) {
      mem.set(dish.id, local);
      return local;
    }
  } catch {
    /* continue */
  }
  const remote =
    (await wikiThumb(dish.wiki, "zh")) ||
    (await wikiThumb(dish.wiki, "en")) ||
    (await commonsThumb(dish.query)) ||
    (await commonsThumb(dish.name));
  const final = remote ?? local;
  mem.set(dish.id, final);
  try {
    localStorage.setItem(`foodimg:${dish.id}`, final);
  } catch {
    /* quota */
  }
  return final;
}

const FRIEND_WIKI: Record<KitchenId, string> = {
  duffy: "Duffy the Disney Bear",
  gelatoni: "Duffy the Disney Bear",
  stellalou: "Duffy the Disney Bear",
  shelliemay: "Duffy the Disney Bear",
  cookieann: "Duffy the Disney Bear",
  olumel: "Duffy the Disney Bear",
  linabell: "Duffy the Disney Bear",
};

export async function resolveFriendImage(id: KitchenId): Promise<string> {
  const local = localAsset(`friends/${id}.jpg`);
  const cached = mem.get(`f:${id}`) || localStorage.getItem(`friendimg:${id}`);
  if (cached) return cached;
  try {
    const head = await fetch(local, { method: "HEAD" });
    if (head.ok) {
      mem.set(`f:${id}`, local);
      return local;
    }
  } catch {
    /* continue */
  }
  const remote = (await wikiThumb(FRIEND_WIKI[id], "en")) || (await commonsThumb("Duffy the Disney Bear plush"));
  const final = remote ?? local;
  mem.set(`f:${id}`, final);
  try {
    localStorage.setItem(`friendimg:${id}`, final);
  } catch {
    /* quota */
  }
  return final;
}
