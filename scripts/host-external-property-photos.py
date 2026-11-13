#!/usr/bin/env python3
"""Download still-working hotlinked property photos into public/uploads.

Usage: python3 scripts/host-external-property-photos.py
Rewrites data/local-properties.json to local /uploads paths, keeping order.
Skips URLs that are not a valid 200 image. Does not touch listings whose
photos all fail (those stay on the existing denylist / empty-gallery path).
"""
from __future__ import annotations

import json
import ssl
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "data/local-properties.json"
UPLOAD_ROOT = ROOT / "public/uploads/properties"
MANIFEST = ROOT / "data/hosted-external-images.json"
MAX_EDGE = 1600
JPEG_QUALITY = 80
WORKERS = 16
RETRIES = 3
TIMEOUT = 30
CTX = ssl.create_default_context()


def slug_of(property_record):
    slug = property_record.get("slug")
    if isinstance(slug, str):
        return slug
    if isinstance(slug, dict):
        return slug.get("current")
    return None


def fetch(url):
    last_error = None
    for attempt in range(RETRIES):
        req = Request(
            url,
            method="GET",
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
                "Referer": "https://www.domyvitalii.cz/",
            },
        )
        try:
            with urlopen(req, context=CTX, timeout=TIMEOUT) as response:
                data = response.read()
                status = response.status
                content_type = response.headers.get("Content-Type", "")
            if status not in (200, 206) or not data:
                return {"url": url, "ok": False, "status": status, "error": f"HTTP {status} empty={not data}"}
            if "html" in (content_type or "").lower():
                return {"url": url, "ok": False, "status": status, "error": f"html content-type {content_type}"}
            if data[:3] not in (b"\xff\xd8\xff", b"\x89PN") and data[:4] not in (b"RIFF", b"\x00\x00\x00\x1c") and not data.startswith(b"RIFF") and data[:4] != b"WEBP" and not data.startswith(b"\x89PNG"):
                # JPEG, PNG, or RIFF/WebP. Also accept if Pillow can open it.
                try:
                    Image.open(BytesIO(data)).verify()
                except Exception:
                    return {"url": url, "ok": False, "status": status, "error": f"not an image magic={data[:8].hex()} ctype={content_type}"}
            return {"url": url, "ok": True, "status": status, "data": data, "ctype": content_type}
        except HTTPError as error:
            last_error = f"HTTP {error.code}"
            if error.code in (404, 410, 451):
                return {"url": url, "ok": False, "status": error.code, "error": last_error}
        except Exception as error:
            last_error = f"{type(error).__name__}: {error}"
        time.sleep(0.4 * (attempt + 1))
    return {"url": url, "ok": False, "status": None, "error": last_error}


def optimize(data):
    image = Image.open(BytesIO(data))
    if image.mode in ("RGBA", "P", "LA"):
        image = image.convert("RGB")
    elif image.mode != "RGB":
        image = image.convert("RGB")
    width, height = image.size
    longest = max(width, height)
    if longest > MAX_EDGE:
        scale = MAX_EDGE / longest
        image = image.resize((max(1, round(width * scale)), max(1, round(height * scale))), Image.Resampling.LANCZOS)
    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    return buffer.getvalue(), image.size


def main():
    inventory = json.loads(INVENTORY.read_text())
    url_to_slugs = {}
    for property_record in inventory:
        slug = slug_of(property_record)
        for url in property_record.get("images") or []:
            if isinstance(url, str) and url.startswith("http"):
                url_to_slugs.setdefault(url, []).append(slug)

    urls = list(url_to_slugs)
    print(f"checking {len(urls)} unique external URLs for {sum(len(v) for v in url_to_slugs.values())} slots")
    t0 = time.time()
    results = {}
    done = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(fetch, url): url for url in urls}
        for future in as_completed(futures):
            result = future.result()
            results[result["url"]] = result
            done += 1
            if done % 100 == 0:
                ok = sum(1 for item in results.values() if item["ok"])
                print(f"  {done}/{len(urls)} fetched, {ok} ok, {time.time()-t0:.1f}s")

    ok_urls = [url for url, result in results.items() if result["ok"]]
    bad_urls = [url for url, result in results.items() if not result["ok"]]
    print(f"fetch done in {time.time()-t0:.1f}s: {len(ok_urls)} ok, {len(bad_urls)} failed")

    # Write files per property, in original order
    hosted = {}
    failures = []
    bytes_written = 0
    listings_updated = 0
    images_copied = 0

    for property_record in inventory:
        slug = slug_of(property_record)
        images = list(property_record.get("images") or [])
        if not any(isinstance(url, str) and url.startswith("http") for url in images):
            continue

        new_images = []
        copied_here = 0
        for url in images:
            if not isinstance(url, str) or not url.strip():
                continue
            if url.startswith("/"):
                new_images.append(url)
                continue
            if not url.startswith("http"):
                new_images.append(url)
                continue
            result = results.get(url)
            if not result or not result["ok"]:
                failures.append({
                    "slug": slug,
                    "url": url,
                    "status": (result or {}).get("status"),
                    "error": (result or {}).get("error"),
                })
                continue
            try:
                payload, size = optimize(result["data"])
            except Exception as error:
                failures.append({"slug": slug, "url": url, "status": result.get("status"), "error": f"optimize: {error}"})
                continue
            copied_here += 1
            filename = f"{copied_here:02d}-gallery-{copied_here}.jpg"
            dest_dir = UPLOAD_ROOT / slug
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest = dest_dir / filename
            dest.write_bytes(payload)
            bytes_written += dest.stat().st_size
            web_path = f"/uploads/properties/{slug}/{filename}"
            new_images.append(web_path)
            hosted.setdefault(slug, []).append({
                "source": url,
                "path": web_path,
                "bytes": dest.stat().st_size,
                "size": {"w": size[0], "h": size[1]},
            })

        if copied_here == 0:
            # Leave the original records alone when nothing could be saved.
            continue

        property_record["images"] = new_images
        property_record["mainImage"] = 0
        listings_updated += 1
        images_copied += copied_here

    INVENTORY.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
    manifest = {
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "unique_external": len(urls),
        "downloaded_ok": len(ok_urls),
        "download_failed": len(bad_urls),
        "listings_updated": listings_updated,
        "images_copied": images_copied,
        "bytes_written": bytes_written,
        "max_edge": MAX_EDGE,
        "jpeg_quality": JPEG_QUALITY,
        "hosted": hosted,
        "failures": failures,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(
        f"updated {listings_updated} listings, copied {images_copied} images, "
        f"{bytes_written/1e6:.1f} MB -> {MANIFEST}"
    )


if __name__ == "__main__":
    main()
