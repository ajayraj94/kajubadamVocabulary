#!/usr/bin/env python3
"""
Blog Post Tracker — Strategy File Annotator
Scans content/blog/ for existing .md files,
then updates each strategy .md file in content/strategy/
with [✅] / [❌] markers next to each post title,
plus a progress summary header at the top.

FIXES:
- Uses FULL RANGE for total count (endSerial - startSerial + 1)
- ALWAYS replaces old banner with fresh, correct data
- Idempotent: running multiple times gives same result
"""

import io
import os
import re
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
STRATEGY_DIR = os.path.join(PROJECT_ROOT, "content", "strategy")
BLOG_DIR = os.path.join(PROJECT_ROOT, "content", "blog")

CATEGORIES = [
    ("1.catogery 4_ 210 post.md",   "Category 4: Idioms & Phrasal Verbs",       1,   210),
    ("2.catogery 3 _ 200 post.md",  "Category 3: Grammar & Error Spotting",     211, 410),
    ("3.catogery 2_ 180 post.md",   "Category 2: Topic-wise Vocabulary",        411, 590),
    ("4.catogery 1_ 260 post.md",   "Category 1: A to Z Vocabulary Series",     591, 850),
    ("5.catogery 5 _ 150 post.md",  "Category 5: Daily Sentences & Spoken Eng", 851, 1000),
]

BANNER_PREFIX = "> 📊 **Progress:"


def extract_frontmatter_field(text: str, field: str) -> str | None:
    match = re.match(r"^---\s*\n(.*?)\n(?:---|\.\.\.)", text, re.DOTALL)
    if not match:
        return None
    frontmatter = match.group(1)
    fm_match = re.search(rf"^{field}:\s*(.+)$", frontmatter, re.MULTILINE)
    if fm_match:
        return fm_match.group(1).strip().strip('"').strip("'")
    return None


def load_existing_posts() -> dict[int, dict]:
    """Scan content/blog/ and return dict of serialNumber -> {title, file}."""
    existing = {}
    if not os.path.isdir(BLOG_DIR):
        return existing

    for fname in sorted(os.listdir(BLOG_DIR)):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(BLOG_DIR, fname)
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception:
            continue

        title = extract_frontmatter_field(content, "title")
        sn_str = extract_frontmatter_field(content, "serialNumber")

        if title and sn_str:
            try:
                sn = int(sn_str)
                existing[sn] = {"title": title, "file": fname}
            except ValueError:
                pass

    return existing


def strip_old_banner(lines: list[str]) -> list[str]:
    """Remove ALL old progress banner lines from anywhere in the file.
    Handles both top-of-file banners and banners after frontmatter."""
    result = []
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith(BANNER_PREFIX):
            i += 1  # Skip "> 📊 **Progress: ...**"
            if i < len(lines) and "✅" in lines[i] and "❌" in lines[i]:
                i += 1  # Skip "✅ Complete • ❌ Pending"
            continue
        result.append(lines[i])
        i += 1
    return result


def find_insert_point(lines: list[str]) -> int:
    """Find where to insert the banner. Returns index after frontmatter if any, else 0."""
    if lines and lines[0].strip() == "---":
        for j, line in enumerate(lines):
            if j > 0 and line.strip() == "---":
                return j + 1  # After closing ---
    return 0


def annotate_post_lines(lines: list[str], start_sn: int, end_sn: int,
                        existing: dict[int, dict]) -> dict[int, tuple]:
    """Parse lines to find numbered post entries and annotate them.
    Returns dict of line_index -> (serialNumber, title, is_written)."""
    post_info = {}
    post_regex = re.compile(r"^(\s*)(\d+)\.\s+(.+)$")
    in_frontmatter = False

    for i, line in enumerate(lines):
        # Track frontmatter
        if i == 0 and line.strip() == "---":
            in_frontmatter = True
            continue
        if in_frontmatter and line.strip() == "---":
            in_frontmatter = False
            continue
        if in_frontmatter:
            continue

        match = post_regex.match(line)
        if not match:
            continue

        num = int(match.group(2))
        title = match.group(3).strip().replace("**", "").strip()

        # Skip section headers and short lines
        if len(title) < 10:
            continue
        if re.match(r"^(Part|Section|Chapter|Letter|Theme|Sub-Category|Verb Family)\s+\d",
                    title, re.IGNORECASE):
            continue

        # Convert local numbering to global
        if num < start_sn:
            num = start_sn + num - 1

        if not (start_sn <= num <= end_sn):
            continue

        post_info[i] = (num, title, num in existing)

    return post_info


def build_banner(written: int, total: int) -> str:
    """Build the progress banner string."""
    pct = (written * 100 // total) if total > 0 else 0
    bar_len = 20
    filled = round(bar_len * written / total) if total > 0 else 0
    bar = "█" * filled + "░" * (bar_len - filled)
    return f"> 📊 **Progress: {bar} {written}/{total} posts ({pct}%)**\n> ✅ Complete • ❌ Pending\n"


def annotate_strategy_file(filepath: str, start_sn: int, end_sn: int,
                           existing: dict[int, dict]) -> tuple[int, int, int]:
    """
    Read a strategy file, annotate with [✅] / [❌], and update banner.
    Always replaces old banner with fresh data.
    Returns (total_posts, written_count, pending_count).
    """
    if not os.path.isfile(filepath):
        print(f"  [!] File not found: {os.path.basename(filepath)}")
        return (0, 0, 0)

    with open(filepath, "r", encoding="utf-8") as f:
        original = f.read()

    lines = original.split("\n") if original.strip() else []

    # For empty files, still write a progress banner (so user sees 0/180 etc.)
    if not lines:
        total_posts = end_sn - start_sn + 1
        banner = build_banner(0, total_posts)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(banner)
        return (total_posts, 0, total_posts)

    # ── Step 1: Remove old banner if present ──
    lines = strip_old_banner(lines)

    # ── Step 2: Calculate correct totals using full range ──
    total_posts = end_sn - start_sn + 1
    written_count = sum(1 for sn in range(start_sn, end_sn + 1) if sn in existing)
    pending_count = total_posts - written_count

    # ── Step 3: Build fresh banner ──
    banner = build_banner(written_count, total_posts)

    # ── Step 4: Find post lines to annotate ──
    post_info = annotate_post_lines(lines, start_sn, end_sn, existing)

    # ── Step 5: Rebuild file with banner + annotations ──
    insert_at = find_insert_point(lines)
    post_regex = re.compile(r"^(\s*)(\d+)\.\s+(.+)$")

    final = lines[:insert_at]  # Frontmatter lines (if any)
    final.append(banner)       # Fresh banner

    for i in range(insert_at, len(lines)):
        line = lines[i]
        if i in post_info:
            _, _, is_written = post_info[i]
            marker = "✅" if is_written else "❌"
            match = post_regex.match(line)
            if match:
                indent = match.group(1)
                raw_num = match.group(2)
                rest = re.sub(r"^\s*[✅❌]\s*", "", match.group(3)).strip()
                final.append(f"{indent}{raw_num}. {marker} {rest}")
            else:
                final.append(line)
        else:
            final.append(line)

    new_content = "\n".join(final)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    return (total_posts, written_count, pending_count)


def main():
    if not os.path.isdir(STRATEGY_DIR):
        os.makedirs(STRATEGY_DIR, exist_ok=True)
        print(f"[+] Created strategy directory: {STRATEGY_DIR}")
        print("[!] Please add the 5 category strategy files there first.")
        sys.exit(1)

    if hasattr(sys.stdout, 'buffer'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    existing = load_existing_posts()
    print(f"[+] Found {len(existing)} existing blog posts\n")

    grand_total = 0
    grand_written = 0
    grand_pending = 0

    for cat_file, cat_name, start_sn, end_sn in CATEGORIES:
        fpath = os.path.join(STRATEGY_DIR, cat_file)
        print(f"  📄 {cat_name}")
        total, written, pending = annotate_strategy_file(fpath, start_sn, end_sn, existing)

        if total > 0:
            pct = written * 100 // total
            print(f"     Posts {start_sn}-{end_sn}: {written}/{total} ({pct}%) — {pending} pending")
        else:
            print(f"     No posts found in file")
        print()

        grand_total += total
        grand_written += written
        grand_pending += pending

    pct = grand_written * 100 // grand_total if grand_total > 0 else 0
    print("=" * 60)
    print(f"  TOTAL: {grand_written}/{grand_total} ({pct}%)  |  {grand_pending} pending")
    print("=" * 60)


if __name__ == "__main__":
    main()
