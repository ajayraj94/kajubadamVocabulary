import fs from "fs";
import path from "path";
import matter from "gray-matter";

const filePath = path.join(process.cwd(), "content", "daily-news", "2026-05-31.md");
const content = fs.readFileSync(filePath, "utf8");

console.log("=== FILE INFO ===");
console.log("File length:", content.length, "chars");
console.log("First 200 chars:", content.slice(0, 200));
console.log();

// Check gray-matter parsing
const { data, content: body } = matter(content);
console.log("=== GRAY-MATTER ===");
console.log("Frontmatter data:", JSON.stringify(data));
console.log("Body starts with:", body.slice(0, 100));
console.log();

// Check for section headers
const SECTION_HEADER_REGEX = /^##\s*(\S*\s*)?Section\s+(\d+)[:.)]\s*(.*)$/im;
console.log("=== SECTION HEADER CHECK ===");
const headers = content.match(/^##\s+.*$/gm);
console.log("All ## headers:", headers);
console.log();

// Check for NEW_SECTION_HEADER_REGEX
const NEW_SECTION_HEADER_REGEX = /^##\s*\S*\s*Section\s+(\d+)[:.)]\s*(.*)$/mgi;
let match;
console.log("=== NEW SECTION HEADER MATCHES ===");
while ((match = NEW_SECTION_HEADER_REGEX.exec(content)) !== null) {
    console.log(`  Found: "## ...Section ${match[1]}: ${match[2].trim()}" at index ${match.index}`);
}

// Check isNewFormat
const isNew = /^##\s+[^\n]*?Section\s+\d+\s*[:.)]/im.test(body);
console.log("isNewFormat:", isNew);

// Count ### Q headers
const qHeaders = body.match(/^###\s+Q(\d+)\./gm);
console.log("\n=== Q HEADERS ===");
console.log("Count:", qHeaders ? qHeaders.length : 0);
if (qHeaders) {
    qHeaders.forEach(h => console.log(" ", h));
}

// Check section-like areas in the body
console.log("\n=== WHAT COMES AFTER Q5 ===");
const q5Match = body.match(/### Q5\./);
if (q5Match) {
    const afterQ5 = body.slice(q5Match.index, q5Match.index + 500);
    console.log(afterQ5);
}

console.log("\n=== WHAT COMES AFTER Q25 ===");
const q25Match = body.match(/### Q25\./);
if (q25Match) {
    const afterQ25 = body.slice(q25Match.index, q25Match.index + 500);
    console.log(afterQ25);
}

console.log("\n=== WHAT COMES AFTER Q35 ===");
const q35Match = body.match(/### Q35\./);
if (q35Match) {
    const afterQ35 = body.slice(q35Match.index, q35Match.index + 1000);
    console.log(afterQ35);
}

console.log("\n=== WHAT COMES AFTER Q40 ===");
const q40Match = body.match(/### Q40\./);
if (q40Match) {
    const afterQ40 = body.slice(q40Match.index, q40Match.index + 500);
    console.log(afterQ40);
}
