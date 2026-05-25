import os
import re

def slugify(text):
    # Remove emojis and non-alphanumeric characters (keep spaces and hyphens)
    text = re.sub(r'[^\w\s-]', '', text)
    # Convert to lowercase and replace spaces with hyphens
    text = re.sub(r'[\s_-]+', '-', text).strip('-').lower()
    return text

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove existing frontmatter (if any) before regenerating
    if content.startswith('---'):
        end_match = re.search(r'^---[\s\S]*?^---\s*\n?', content, re.MULTILINE)
        if end_match:
            content = content[end_match.end():]
            print(f"  Removed existing frontmatter from {os.path.basename(filepath)}")

    # Find the first heading
    match = re.search(r'^#\s+(.*)', content, re.MULTILINE)
    if not match:
        print(f"No heading found in {os.path.basename(filepath)}")
        return

    heading = match.group(1).strip()
    
    # If heading is like "📖 Saga 1-01: Shadows of the Forsaken", get the part after colon
    if ':' in heading:
        title_part = heading.split(':', 1)[1].strip()
    else:
        title_part = heading

    slug = slugify(title_part)
    filename = os.path.basename(filepath)
    saga_id = filename.replace('.md', '')

    # Determine vocab_part from filename
    if filename.startswith('Saga 1'):
        vocab_part = 'part 1'
    elif filename.startswith('Saga 2'):
        vocab_part = 'part 2'
    else:
        vocab_part = ''

    # Use double quotes for YAML to safely handle apostrophes in titles
    escaped_title = title_part.replace('"', '\\"')
    frontmatter = f"---\nslug: \"{slug}\"\ntitle: \"{escaped_title}\"\nsaga_id: \"{saga_id}\"\nvocab_part: \"{vocab_part}\"\n---\n"
    
    new_content = frontmatter + content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Processed {filename} -> slug: \"{slug}\", saga_id: \"{saga_id}\", vocab_part: \"{vocab_part}\"")

if __name__ == "__main__":
    base_dir = r"c:\E_Drive\my_work\kajubadam-vocabulary\content\stories"
    
    # Get all .md files in the directory
    all_files = [f for f in os.listdir(base_dir) if f.endswith('.md')]
    all_files.sort()  # process in order
    
    print(f"Found {len(all_files)} .md files to process")
    
    for file in all_files:
        process_file(os.path.join(base_dir, file))
    
    print("\nDone!")
