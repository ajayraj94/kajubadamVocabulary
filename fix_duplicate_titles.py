import os
import re

BASE = r"c:\E_Drive\my_work\kajubadam-vocabulary\content\stories"

# Mapping: filename -> (new_slug, new_title)
FIXES = {
    # "The Whispering Shadows" duplicates
    "Saga 2-13.md":  ("the-whispering-shadows",  "The Whispering Shadows"),   # keep original
    "Saga 2-52.md":  ("the-fools-parliament",     "The Fools' Parliament"),
    "Saga 2-53.md":  ("the-crimson-keep",         "The Crimson Keep"),
    "Saga 2-54.md":  ("the-shadowed-ascent",      "The Shadowed Ascent"),
    "Saga 2-55.md":  ("the-doleful-march",         "The Doleful March"),
    "Saga 2-56.md":  ("the-murky-depths",          "The Murky Depths"),
    "Saga 2-57.md":  ("the-calm-before-oblivion",  "The Calm Before Oblivion"),

    # "The Fading Light" duplicates
    "Saga 2-26.md":  ("the-fading-light",       "The Fading Light"),       # keep original
    "Saga 2-34.md":  ("dismal-omens",           "Dismal Omens"),
    "Saga 2-42.md":  ("shadows-of-the-past",    "Shadows of the Past"),
    "Saga 2-67.md":  ("the-stultified-shadows", "The Stultified Shadows"),

    # "The Obsidian Spire" duplicates
    "Saga 1-20.md":  ("the-shadow-spire",       "The Shadow Spire"),       # remove Obsidian
    "Saga 1-31.md":  ("the-ascent-of-ashes",    "The Ascent of Ashes"),

    # "The Ethereal Plains" duplicates
    "Saga 1-09.md":  ("the-ethereal-plains",    "The Ethereal Plains"),    # keep original
    "Saga 1-37.md":  ("the-whisper-of-the-void","The Whisper of the Void"),

    # "The Distant Horizons" duplicates
    "Saga 2-04.md":  ("the-distant-horizons",   "The Distant Horizons"),   # keep original
    "Saga 2-15.md":  ("the-edge-of-the-map",    "The Edge of the Map"),

    # "The Gathering Storm" duplicates
    "Saga 2-25.md":  ("the-gathering-storm",    "The Gathering Storm"),    # keep original
    "Saga 2-31.md":  ("into-the-wilderness",    "Into the Wilderness"),

    # "The Shattered Crown" duplicates
    "Saga 2-45.md":  ("the-shattered-crown",    "The Shattered Crown"),    # keep original
    "Saga 2-66.md":  ("the-resonant-rebellion", "The Resonant Rebellion"),
}

# Also need to read the heading line to fix it
for fname, (new_slug, new_title) in FIXES.items():
    fpath = os.path.join(BASE, fname)
    if not os.path.exists(fpath):
        print(f"SKIP {fname} - not found")
        continue

    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    old_content = content
    
    # 1. Fix slug line
    content = re.sub(
        r'^slug: ".*"',
        f'slug: "{new_slug}"',
        content,
        flags=re.MULTILINE
    )
    
    # 2. Fix title line
    escaped_title = new_title.replace('"', '\\"')
    content = re.sub(
        r'^title: ".*"',
        f'title: "{escaped_title}"',
        content,
        flags=re.MULTILINE
    )
    
    # 3. Fix the heading line: # 📖 Saga X-XX: Old Title -> # 📖 Saga X-XX: New Title
    content = re.sub(
        r'^(# 📖 Saga \d+-\d+:).*',
        rf'\1 {new_title}',
        content,
        flags=re.MULTILINE
    )

    if content != old_content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"FIXED {fname:20s} -> slug: \"{new_slug:30s}\" title: \"{new_title}\"")
    else:
        print(f"UNCHANGED {fname} - no changes detected")

print("\nDone! All files updated.")