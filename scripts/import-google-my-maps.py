#!/usr/bin/env python3
"""Import deployment pins from Weatherhaven Google My Maps into src/data/global-deployments.json."""

from __future__ import annotations

import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/data/global-deployments.json"
MID = "1WjBWwEmcEb7M-4sl1pXu_b3MwyBTUm96"
KML_URL = f"https://www.google.com/maps/d/kml?mid={MID}&forcekml=1"
VIEWER_URL = f"https://www.google.com/maps/d/viewer?mid={MID}"

CATEGORY_SYSTEM = {
    "Defence/Peacekeeping": ("hqss", "HQSS"),
    "Medical/Disaster Relief": ("softwall-medical", "Softwall medical"),
    "Commercial/Scientific": ("humanitarian-package", "Humanitarian"),
}


def fetch(url: str, dest: Path) -> None:
    subprocess.run(
        ["curl", "-sL", "-A", "Mozilla/5.0", url, "-o", str(dest)],
        check=True,
    )


def geocode(addr: str) -> tuple[float, float] | None:
    q = urllib.parse.quote(addr)
    url = f"https://nominatim.openstreetmap.org/search?q={q}&format=json&limit=1"
    req = urllib.request.Request(url, headers={"User-Agent": "WeatherhavenSiteImport/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
    if not data:
        return None
    return float(data[0]["lat"]), float(data[0]["lon"])


def theater_for(lat: float, lng: float) -> str:
    if lat < -60:
        return "southcom"
    if lat > 50 and -170 <= lng <= -50:
        return "northcom"
    if lat > 50 and lng > -50:
        return "eucom"
    if -35 <= lat <= 37 and -25 <= lng <= 55:
        return "africom"
    if lng >= 26 and lat >= -10 and lat <= 45:
        return "centcom"
    if lng >= 55 or (lat < -10 and lng > 110) or (lat >= -50 and lng >= 95):
        return "indopacom"
    if lng < -30:
        return "southcom"
    if lat >= 35 and lng >= -15:
        return "eucom"
    return "northcom"


def parse_viewer(html: str) -> list[dict]:
    pattern = re.compile(
        r'\[\[null,\[(-?\d+\.?\d*),(-?\d+\.?\d*)\]\],\\?"0\\?",null,\\?"[^"]*\\?",'
        r'\[(-?\d+\.?\d*),(-?\d+\.?\d*)\],\[0,0\],\\?"[^"]*\\"\],\[\[\\"([^\\"]+)\\"\]\]',
    )
    viewer: list[dict] = [
        {"lat": float(m[0]), "lng": float(m[1]), "name": m[4].strip()} for m in pattern.findall(html)
    ]
    pattern_alt = re.compile(
        r'\[\[null,\[(-?\d+\.?\d*),(-?\d+\.?\d*)\]\],\\"0\\",null,\\"[^"]*\\",'
        r'\[(-?\d+\.?\d*),(-?\d+\.?\d*)\],\[0,0\],\\"[^"]*\\"\],\[\[\\"([^\\"]+)\\"\]\]',
    )
    for m in pattern_alt.findall(html):
        entry = {"lat": float(m[0]), "lng": float(m[1]), "name": m[4].strip()}
        if entry not in viewer:
            viewer.append(entry)
    return viewer


def parse_kml(path: Path) -> list[dict]:
    tree = ET.parse(path)
    root = tree.getroot()
    ns = {"kml": "http://www.opengis.net/kml/2.2"}
    rows: list[dict] = []
    for pm in root.findall(".//kml:Placemark", ns):
        name = (pm.find("kml:name", ns).text or "").strip()
        addr = (pm.find("kml:address", ns).text or "").strip()
        desc = pm.find("kml:description", ns)
        desc_text = desc.text if desc is not None else ""
        cat = desc_text.split("<br>")[0].strip() if desc_text else ""
        location = desc_text.split("Location:")[-1].strip() if "Location:" in desc_text else addr
        rows.append({"name": name, "address": addr, "category": cat, "location": location})
    return rows


def pick_viewer(row: dict, pool: list[dict]) -> dict | None:
    if not pool:
        return None
    if len(pool) == 1:
        return pool.pop(0)
    geo = geocode(row["address"])
    time.sleep(1.05)
    if not geo:
        return pool.pop(0)
    best_i = min(range(len(pool)), key=lambda i: (pool[i]["lat"] - geo[0]) ** 2 + (pool[i]["lng"] - geo[1]) ** 2)
    return pool.pop(best_i)


def main() -> int:
    tmp = ROOT / ".tmp-import"
    tmp.mkdir(exist_ok=True)
    kml_path = tmp / "map.kml"
    viewer_path = tmp / "viewer.html"

    print("Fetching Google My Maps KML and viewer…")
    fetch(KML_URL, kml_path)
    fetch(VIEWER_URL, viewer_path)

    kml_rows = parse_kml(kml_path)
    viewer_rows = parse_viewer(viewer_path.read_text(errors="ignore"))
    by_name: dict[str, list[dict]] = defaultdict(list)
    for v in viewer_rows:
        by_name[v["name"]].append(v)

    deployments: list[dict] = []
    seen_ids: set[str] = set()

    for row in kml_rows:
        pool = by_name[row["name"]]
        picked = pick_viewer(row, pool)
        if picked:
            lat, lng = picked["lat"], picked["lng"]
        else:
            geo = geocode(row["address"])
            time.sleep(1.05)
            if not geo:
                print("Warning: no coordinates for", row["address"], file=sys.stderr)
                continue
            lat, lng = geo

        slug_sys, code = CATEGORY_SYSTEM.get(row["category"], ("turnkey-camp", "Turnkey camp"))
        base = re.sub(r"[^a-z0-9]+", "-", f"{row['name']}-{row['address']}".lower()).strip("-")
        uid = base
        n = 2
        while uid in seen_ids:
            uid = f"{base}-{n}"
            n += 1
        seen_ids.add(uid)

        deployments.append(
            {
                "id": uid,
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "label": row["location"] or row["address"],
                "title": row["name"],
                "address": row["address"],
                "category": row["category"],
                "systemSlug": slug_sys,
                "systemCode": code,
                "environment": row["category"].split("/")[0],
                "theaterId": theater_for(lat, lng),
                "summary": f"{row['category']} deployment — {row['location'] or row['address']}.",
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(deployments, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(deployments)} deployments to {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
