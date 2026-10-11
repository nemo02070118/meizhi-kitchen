const CDN = "https://cdn.jsdelivr.net/gh/nemo02070118/meizhi-kitchen@main/public/";

function localUrl(path: string) {
  const base = import.meta.env.BASE_URL || "./";
  return `${base}${path.replace(/^\//, "")}`;
}

export function asset(path: string) {
  const clean = path.replace(/^\//, "");
  if (typeof location !== "undefined" && location.hostname.endsWith("github.io")) {
    return `${CDN}${clean}`;
  }
  return localUrl(clean);
}

export function localAsset(path: string) {
  return localUrl(path);
}
