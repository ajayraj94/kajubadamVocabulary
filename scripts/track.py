#!/usr/bin/env python3
"""
Blog Post Tracker v3 — SerialNumber-Based Matching
Reads 5 category strategy files from content/strategy/,
extracts all planned post titles + serial numbers,
scans content/blog/ for existing .md files,
matches by serialNumber (not title),
and reports which posts exist vs pending.
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


def extract_frontmatter_field(text: str, field: str) -> str | None:
    """Extract a field from YAML frontmatter safely."""
    match = re.match(r"^---\s*\n(.*?)\n(?:---|\.\.\.)", text, re.DOTALL)
    if not match:
        return None
    frontmatter = match.group(1)
    fm_match = re.search(rf"^{field}:\s*(.+)$", frontmatter, re.MULTILINE)
    if fm_match:
        return fm_match.group(1).strip().strip('"').strip("'")
    return None


def parse_planned_posts(filepath: str, start_sn: int) -> list[dict]:
    """
    Parse a category strategy file and extract all numbered post entries.
    Returns list of {sn, title} dicts sorted by serial number.
    
    Handles:
    - Lines like "1. Title here" or "851. Title here"
    - Both LOCAL numbering (1-200 within a category) and GLOBAL numbering (1-1000)
    - Markdown bold formatting like "**Rule 1-5:** text"
    - Section headers like "### Verb Family (Posts 1-4)"
    """
    if not os.path.isfile(filepath):
        print(f"  [!] File not found: {os.path.basename(filepath)}")
        return []
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if not content.strip():
        print(f"  [!] Empty file: {os.path.basename(filepath)}")
        return []

    planned = []
    seen_sns = set()
    
    for line in content.split("\n"):
        # Match: optional whitespace, number, dot, space, then title
        match = re.match(r"^\s*(\d+)\.\s+(.+)$", line)
        if not match:
            continue
        
        num = int(match.group(1))
        title = match.group(2).strip()
        
        # Remove markdown bold markers
        title = title.replace("**", "").strip()
        
        # Skip if title is too short (not a real post title)
        if len(title) < 10:
            continue
        
        # Skip if looks like a section/subtitle rather than a post title
        # (e.g., "Part 1:", "Section A:", "Letter A:", etc.)
        if re.match(r"^(Part|Section|Chapter|Letter|Theme|Sub-Category)\s+\d", title, re.IGNORECASE):
            continue
        
        # Convert local numbering to global numbering
        # Strategy files use LOCAL numbering (e.g., Category 3 lists 1-200, not 211-410)
        # Blog posts use GLOBAL numbering (1-1000)
        if num < start_sn:
            num = start_sn + num - 1
        
        # Skip if outside the expected range
        if not (1 <= num <= 1000):
            continue
        
        # Skip duplicate serial numbers (take the first)
        if num in seen_sns:
            continue
        
        seen_sns.add(num)
        planned.append({"sn": num, "title": title})
    
    # Sort by serial number
    planned.sort(key=lambda x: x["sn"])
    return planned


def load_existing_posts() -> dict[int, dict]:
    """Scan content/blog/ and return dict of serialNumber -> {title, file}."""
    if not os.path.isdir(BLOG_DIR):
        print(f"  [!] Blog directory not found: {BLOG_DIR}")
        return {}

    existing = {}
    files = sorted(os.listdir(BLOG_DIR))
    for fname in files:
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


def generate_report(planned: list[dict], existing: dict[int, dict]):
    """Match planned posts with existing by serialNumber and print report."""
    
    written_count = 0
    pending_count = 0
    
    print("=" * 72)
    print("  1000 BLOG POSTS TRACKER  --  SerialNumber Matching")
    print("=" * 72)
    
    for cat_file, cat_name, start_sn, end_sn in CATEGORIES:
        cat_posts = [p for p in planned if start_sn <= p["sn"] <= end_sn]
        cat_written = [p for p in cat_posts if p["sn"] in existing]
        cat_pending = [p for p in cat_posts if p["sn"] not in existing]
        
        written_count += len(cat_written)
        pending_count += len(cat_pending)
        
        print(f"\n  [{cat_name}]")
        total_in_cat = len(cat_posts)
        pct = len(cat_written) * 100 // total_in_cat if total_in_cat > 0 else 0
        print(f"  Posts {start_sn}-{end_sn}  |  Written: {len(cat_written)}/{total_in_cat} ({pct}%)")
        print(f"  " + "-" * 68)
        
        # Show written posts
        for p in cat_written:
            e = existing[p["sn"]]
            print(f"  [+] #{p['sn']:>4d}  {p['title'][:65]}")
        
        # Show pending count + gaps
        if cat_pending:
            pending_sns = sorted([p["sn"] for p in cat_pending])
            
            # Show first 5 and last 5 pending with titles
            show_items = pending_sns[:5] + pending_sns[-5:] if len(pending_sns) > 10 else pending_sns
            shown_set = set(show_items)
            
            for sn in show_items:
                p = next((pp for pp in cat_pending if pp["sn"] == sn), None)
                if p:
                    print(f"  [-] #{p['sn']:>4d}  {p['title'][:65]}")
            
            if len(pending_sns) > 10:
                hidden = len(pending_sns) - 10
                print(f"  [-] ... and {hidden} more pending posts in this category")
        else:
            print("  (no pending posts)")
    
    total_planned = len(planned)
    pct = written_count * 100 // total_planned if total_planned > 0 else 0
    
    print("\n" + "=" * 72)
    print(f"  TOTAL: {written_count}/{total_planned} written ({pct}%)  |  {pending_count} pending")
    print("=" * 72)


def main():
    if not os.path.isdir(STRATEGY_DIR):
        print(f"[!] Error: Strategy directory not found at {STRATEGY_DIR}")
        # Try to create it
        os.makedirs(STRATEGY_DIR, exist_ok=True)
        print(f"[+] Created strategy directory: {STRATEGY_DIR}")
        print("[!] Please add the 5 category strategy files there first.")
        sys.exit(1)
    
    # Fix stdout encoding for Windows (handles Hindi text in titles)
    if hasattr(sys.stdout, 'buffer'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    # Parse all strategy files
    all_planned = []
    for cat_file, cat_name, start_sn, end_sn in CATEGORIES:
        fpath = os.path.join(STRATEGY_DIR, cat_file)
        posts = parse_planned_posts(fpath, start_sn)
        
        # Only keep posts within the expected range
        posts = [p for p in posts if start_sn <= p["sn"] <= end_sn]
        all_planned.extend(posts)
    
    # Load existing blog posts
    existing = load_existing_posts()
    
    # Generate report
    generate_report(all_planned, existing)
    
    # Check for unmatched existing posts (serialNumber not in any strategy file)
    unmatched = []
    for sn, e in existing.items():
        if sn not in {p["sn"] for p in all_planned}:
            unmatched.append(e)
    
    if unmatched:
        print(f"\n  [!] {len(unmatched)} existing post(s) not found in any strategy file:")
        for e in unmatched:
            sn = next((s for s, ex in existing.items() if ex == e), "?")
            print(f"      #{sn} -> {e['file']}  ({e['title'][:60]})")


if __name__ == "__main__":
    main()
