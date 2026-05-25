const fs = require('fs');
const path = require('path');

function slugify(text) {
    // Remove emojis and non-alphanumeric characters (keep spaces and hyphens)
    text = text.replace(/[^\w\s-]/g, '');
    // Convert to lowercase and replace spaces with hyphens
    text = text.replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
    return text;
}

function processFile(filepath) {
    if (!fs.existsSync(filepath)) {
        console.log(`File not found: ${filepath}`);
        return;
    }

    let content = fs.readFileSync(filepath, 'utf-8');

    // Remove existing frontmatter (if any) before regenerating
    if (content.startsWith('---')) {
        const endMatch = content.match(/^---[\s\S]*?^---\s*\n?/m);
        if (endMatch) {
            content = content.slice(endMatch[0].length);
            console.log(`  Removed existing frontmatter from ${path.basename(filepath)}`);
        }
    }

    // Find the first heading
    const match = content.match(/^#\s+(.*)/m);
    if (!match) {
        console.log(`No heading found in ${path.basename(filepath)}`);
        return;
    }

    const heading = match[1].trim();

    let titlePart = heading;
    if (heading.includes(':')) {
        titlePart = heading.split(':').slice(1).join(':').trim();
    }

    const slug = slugify(titlePart);
    const filename = path.basename(filepath);
    const sagaId = filename.replace('.md', '');

    // Determine vocab_part from filename
    let vocabPart = '';
    if (filename.startsWith('Saga 1')) vocabPart = 'part 1';
    else if (filename.startsWith('Saga 2')) vocabPart = 'part 2';

    // Use double quotes for YAML to safely handle apostrophes in titles
    const escapedTitle = titlePart.replace(/"/g, '\\"');
    const frontmatter = `---\nslug: "${slug}"\ntitle: "${escapedTitle}"\nsaga_id: "${sagaId}"\nvocab_part: "${vocabPart}"\n---\n`;

    const newContent = frontmatter + content;

    fs.writeFileSync(filepath, newContent, 'utf-8');

    console.log(`Processed ${filename} -> slug: "${slug}", saga_id: "${sagaId}", vocab_part: "${vocabPart}"`);
}

const baseDir = path.join(__dirname, 'content', 'stories');

// Get all .md files in the directory
const allFiles = fs.readdirSync(baseDir)
    .filter(file => file.endsWith('.md'))
    .sort(); // process in order

console.log(`Found ${allFiles.length} .md files to process`);

allFiles.forEach(file => {
    processFile(path.join(baseDir, file));
});

console.log('\nDone!');
