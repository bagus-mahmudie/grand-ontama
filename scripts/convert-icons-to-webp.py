"""Build local lossless WebP icons from the supplied ZIP and SVG fallbacks."""

from __future__ import annotations

import argparse
import zipfile
from pathlib import Path

from PIL import Image


ICON_MAP = {
    "famicons_school-outline.png": "school-outline.webp",
    "flowbite_bed-solid.png": "bed-solid.webp",
    "fluent_conference-room-28-regular.png": "conference-room.webp",
    "fluent_directions-28-filled.png": "directions-filled.webp",
    "fluent_location-20-regular.png": "location-outline.webp",
    "griddy-icons_shield-filled.png": "shield-filled.webp",
    "hugeicons_align-selection.png": "align-selection.webp",
    "hugeicons_call.png": "call.webp",
    "hugeicons_car-02.png": "car.webp",
    "hugeicons_office.png": "office.webp",
    "icon-park-solid_ruler-one.png": "ruler.webp",
    "iconamoon_share-2-thin.png": "share.webp",
    "iconoir_bathroom.png": "bathroom-outline.webp",
    "iconoir_clock.png": "clock.webp",
    "instagram-(Filled).png": "instagram-filled.webp",
    "Mask group.png": "linkedin.webp",
    "mdi_instagram.png": "instagram.webp",
    "mingcute_location-fill (1).png": "location-fill-alt.webp",
    "mingcute_location-fill.png": "location-fill.webp",
    "mingcute_sparkles-fill.png": "sparkles-fill.webp",
    "mingcute_star-fill (1).png": "star-fill-alt.webp",
    "mingcute_star-fill.png": "star-fill.webp",
    "mingcute_youtube-fill.png": "youtube-fill.webp",
    "mynaui_arrow-left.png": "arrow-left.webp",
    "octicon_person-24.png": "person.webp",
    "pepicons-pencil_train.png": "train.webp",
    "pngwing.com.png": "telegram.webp",
    "pngwing.com (1).png": "social-instagram.webp",
    "pngwing.com (2).png": "facebook.webp",
    "pngwing.com (3) 1.png": "discord.webp",
    "pngwing.com (4).png": "social-tiktok.webp",
    "pngwing.com (5).png": "whatsapp.webp",
    "proicons_beach.png": "beach.webp",
    "radix-icons_download.png": "download.webp",
    "reicon_bath-filled.png": "bath-fill.webp",
    "solar_arrow-left-outline.png": "solar-arrow-left.webp",
    "solar_calendar-outline.png": "calendar.webp",
    "solar_home-bold.png": "home-bold.webp",
    "streamline-flex_ai-generate-portrait-image-spark-solid.png": "ai-portrait-spark.webp",
    "tabler_copy.png": "copy.webp",
    "tiktok-(Filled).png": "tiktok-filled.webp",
    "Vector.png": "behance.webp",
    "verified 1.png": "verified.webp",
    "weui_arrow-outlined.png": "arrow-outlined.webp",
    "weui_arrow-outlined (1).png": "arrow-outlined-1.webp",
    "weui_arrow-outlined (2).png": "arrow-outlined-2.webp",
    "weui_arrow-outlined (3).png": "arrow-outlined-3.webp",
}


def save_lossless_webp(image: Image.Image, output: Path) -> None:
    image.convert("RGBA").save(
        output,
        "WEBP",
        lossless=True,
        quality=100,
        method=6,
        exact=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("zip_path", type=Path)
    parser.add_argument("icons_dir", type=Path)
    args = parser.parse_args()

    icons_dir = args.icons_dir.resolve()
    icons_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(args.zip_path.resolve()) as archive:
        members = {Path(name).name: name for name in archive.namelist() if not name.endswith("/")}
        missing = sorted(set(ICON_MAP) - set(members))
        if missing:
            raise SystemExit(f"Missing ZIP icons: {', '.join(missing)}")

        # Overwrite matching fallbacks with the exact PNG artwork supplied by
        # the user. Dimensions and transparent pixels are retained losslessly.
        for source_name, output_name in ICON_MAP.items():
            with archive.open(members[source_name]) as source:
                with Image.open(source) as image:
                    save_lossless_webp(image, icons_dir / output_name)

    print(
        f"Created {len(ICON_MAP)} exact lossless WebP icons from the supplied ZIP."
    )


if __name__ == "__main__":
    main()
