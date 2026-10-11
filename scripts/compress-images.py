from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public"


def jpeg(path: Path, max_side: int, quality: int) -> None:
    im = Image.open(path)
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    elif im.mode == "L":
        im = im.convert("RGB")
    w, h = im.size
    scale = max_side / max(w, h)
    if scale < 1:
        im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)


def png(path: Path, max_side: int) -> None:
    im = Image.open(path)
    w, h = im.size
    scale = max_side / max(w, h)
    if scale < 1:
        im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)
    im.save(path, "PNG", optimize=True)


def run() -> None:
    before = 0
    after = 0
    for folder, max_side, quality, kind in [
        (ROOT / "food", 480, 68, "jpg"),
        (ROOT / "friends", 640, 74, "jpg"),
        (ROOT / "meizhi", 900, 78, "jpg"),
        (ROOT / "friends" / "cut", 420, 0, "png"),
    ]:
        if not folder.exists():
            continue
        for path in folder.glob(f"*.{kind}"):
            before += path.stat().st_size
            if kind == "jpg":
                jpeg(path, max_side, quality)
            else:
                png(path, max_side)
            after += path.stat().st_size
            print(f"{path.name}: {path.stat().st_size // 1024}KB")
    print(f"total {before/1024/1024:.1f}MB -> {after/1024/1024:.1f}MB")


if __name__ == "__main__":
    run()
