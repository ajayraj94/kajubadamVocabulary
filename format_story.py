"""
Process Saga 1-01.md into formatted HTML for MS Word copy-paste.
Usage: python format_story.py
Output: story_output_saga1_01.html
"""

import re
import os

def transform_bold_italic(line):
    """
    Transform markdown **BOLD** _(italic)_ patterns into styled HTML spans.
    - **WORD** (English) -> UPPERCASE with blue highlight
    - **WORD** (Hindi) -> with blue highlight
    - _(meaning)_ -> italic gray (strip surrounding underscores)
    """
    # Step 1: Handle the _(meaning)_ pattern
    line = re.sub(
        r'_\(([^)]+)\)_',
        r'<span style="font-style: italic; color: #555555;">(\1)</span>',
        line
    )

    # Step 2: Transform **WORD** patterns to highlighted bold spans
    def replace_bold(match):
        word = match.group(1)
        # Check if it's an English word (Latin characters only)
        if re.match(r'^[A-Za-z\s/\-,;:\'!?]+$', word):
            return '<span style="font-weight: bold; color: #0B5394; background-color: #E8F0FE; padding: 2px 4px; border-radius: 3px;">' + word.upper() + '</span>'
        else:
            return '<span style="font-weight: bold; color: #0B5394; background-color: #E8F0FE; padding: 2px 4px; border-radius: 3px;">' + word + '</span>'

    line = re.sub(r'\*\*([^*]+)\*\*', replace_bold, line)

    return line


def process_story():
    # Resolve paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, 'content', 'stories', 'Saga 1-01.md')
    output_path = os.path.join(script_dir, 'story_output_saga1_01.html')

    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    html_parts = []

    # HTML header
    html_parts.append("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Saga 1-01: Shadows of the Forsaken</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
""")

    in_frontmatter = False

    for line in lines:
        stripped = line.rstrip()

        # Skip frontmatter
        if stripped == '---':
            if not in_frontmatter:
                in_frontmatter = True
                continue
            else:
                in_frontmatter = False
                continue

        if in_frontmatter:
            continue

        # Skip the main title line (# 📖 ...)
        if stripped.startswith('# \U0001f4d6'):
            continue

        # Skip horizontal rules (--- that are NOT frontmatter)
        if stripped == '---':
            continue

        # Empty lines - skip
        if not stripped:
            continue

        # ACT title: ## ACT 1: THE VEIL OF SHADOWS (Saga 1-01 uses "ACT 1" not "ACT I")
        if re.match(r'^##\s+ACT\s', stripped):
            title = stripped[3:].strip()  # Remove the "## " prefix
            html_parts.append('<h1 style="font-family: \'Segoe UI\', Arial; color: #0B5394; border-bottom: 3px solid #E69138; padding-bottom: 8px; font-size: 22px; margin-bottom: 25px;">' + title + '</h1>')
            continue

        # Chapter title: ### Chapter 1: ...
        if stripped.startswith('### Chapter'):
            title = stripped[4:].strip()  # Remove the "### " prefix
            html_parts.append('<h2 style="font-family: \'Segoe UI\', Arial; color: #E69138; font-size: 18px; margin-top: 20px; margin-bottom: 15px;">' + title + '</h2>')
            continue

        # Stop at word verification section
        if stripped.startswith('## \u2705'):
            break

        # Regular paragraph lines
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', stripped))
        transformed = transform_bold_italic(stripped)

        if has_devanagari:
            # Hindi line - margin-bottom: 18px
            html_parts.append('<p style="font-family: \'Segoe UI\', Arial; font-size: 15px; color: #333333; margin-bottom: 18px; line-height: 1.5;">' + transformed + '</p>')
        else:
            # English line - margin-bottom: 4px
            html_parts.append('<p style="font-family: \'Segoe UI\', Arial; font-size: 15px; color: #333333; margin-bottom: 4px; line-height: 1.5;">' + transformed + '</p>')

    # HTML footer
    html_parts.append("</body>\n</html>")

    output = '\n'.join(html_parts)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)

    print("story_output_saga1_01.html generated successfully!")
    print("Total HTML elements:", len(html_parts))
    
    # Count elements
    h1_count = sum(1 for p in html_parts if p.startswith('<h1'))
    h2_count = sum(1 for p in html_parts if p.startswith('<h2'))
    p_count = sum(1 for p in html_parts if p.startswith('<p'))
    print("H1 (ACT titles):", h1_count)
    print("H2 (Chapter titles):", h2_count)
    print("Paragraphs:", p_count)


if __name__ == '__main__':
    process_story()