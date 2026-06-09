import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Types ──

interface StrategyPost {
  serialNumber: number;
  title: string;
}

interface StrategyCategory {
  file: string;
  label: string;
  startSerial: number;
  endSerial: number;
  posts: StrategyPost[];
}

interface TrackingPost extends StrategyPost {
  status: "written" | "pending";
}

interface TrackingCategory {
  label: string;
  startSerial: number;
  endSerial: number;
  total: number;
  written: number;
  percent: number;
  posts: TrackingPost[];
}

interface TrackingData {
  categories: TrackingCategory[];
  overallTotal: number;
  overallWritten: number;
  overallPercent: number;
  recentWritten: { serialNumber: number; title: string; category: string }[];
}

// ── Strategy file config ──

const STRATEGY_FILES: { file: string; label: string; startSerial: number; endSerial: number }[] = [
  {
    file: "1.catogery 4_ 210 post.md",
    label: "Category 4: Idioms & Phrasal Verbs",
    startSerial: 1,
    endSerial: 210,
  },
  {
    file: "2.catogery 3 _ 200 post.md",
    label: "Category 3: Grammar & Error Spotting",
    startSerial: 211,
    endSerial: 410,
  },
  {
    file: "3.catogery 2_ 180 post.md",
    label: "Category 2: Topic-wise Vocabulary",
    startSerial: 411,
    endSerial: 590,
  },
  {
    file: "4.catogery 1_ 260 post.md",
    label: "Category 1: A to Z Vocabulary Series",
    startSerial: 591,
    endSerial: 850,
  },
  {
    file: "5.catogery 5 _ 150 post.md",
    label: "Category 5: Daily Sentences & Spoken English",
    startSerial: 851,
    endSerial: 1000,
  },
];

// ── Helpers ──

function parseStrategyPosts(content: string, fileLabel: string): StrategyPost[] {
  const posts: StrategyPost[] = [];
  const lines = content.split("\n");

  // Regex to match numbered lines like "1. Title here" or "851. Title here"
  const postRegex = /^\s*(\d+)\.\s+(.+)/;

  for (const line of lines) {
    // Skip lines that look like section headers
    if (/^(###|##|#|\*)/.test(line.trim())) continue;
    if (/^(Part|Section|Chapter|Letter|Theme|Sub-Category|Verb Family|Verbs|Adjectives|Nouns|Synonyms)/i.test(line.trim())) continue;
    if (line.trim().startsWith("(") || line.trim().startsWith("[")) continue;

    const match = line.match(postRegex);
    if (!match) continue;

    const num = parseInt(match[1], 10);
    let title = match[2].trim();
    // Remove markdown bold markers
    title = title.replace(/\*\*/g, "").trim();
    // Skip very short titles
    if (title.length < 10) continue;

    posts.push({ serialNumber: num, title });
  }

  return posts;
}

function getGlobalSerialNumber(localSn: number, startSerial: number): number {
  // If the local number is less than startSerial, it's likely local (1-based)
  // Convert: local 1 → global startSerial
  if (localSn < startSerial) {
    return startSerial + localSn - 1;
  }
  // Already global numbering
  return localSn;
}

function loadAllStrategyCategories(): StrategyCategory[] {
  const strategyDir = path.join(process.cwd(), "content", "strategy");
  if (!fs.existsSync(strategyDir)) {
    return [];
  }

  const categories: StrategyCategory[] = [];

  for (const cfg of STRATEGY_FILES) {
    const filePath = path.join(strategyDir, cfg.file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf8").trim();
    if (!content) {
      categories.push({
        file: cfg.file,
        label: cfg.label,
        startSerial: cfg.startSerial,
        endSerial: cfg.endSerial,
        posts: [],
      });
      continue;
    }

    let rawPosts = parseStrategyPosts(content, cfg.label);

    // Convert to global serial numbers and filter by range
    const posts: StrategyPost[] = [];
    for (const p of rawPosts) {
      const globalSn = getGlobalSerialNumber(p.serialNumber, cfg.startSerial);
      if (globalSn >= cfg.startSerial && globalSn <= cfg.endSerial) {
        posts.push({ serialNumber: globalSn, title: p.title });
      }
    }

    // Deduplicate by serialNumber
    const seen = new Set<number>();
    const uniquePosts: StrategyPost[] = [];
    for (const p of posts) {
      if (!seen.has(p.serialNumber)) {
        seen.add(p.serialNumber);
        uniquePosts.push(p);
      }
    }

    categories.push({
      file: cfg.file,
      label: cfg.label,
      startSerial: cfg.startSerial,
      endSerial: cfg.endSerial,
      posts: uniquePosts,
    });
  }

  return categories;
}

function loadExistingPosts(): Map<number, { title: string; slug: string }> {
  const blogDir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(blogDir)) return new Map();

  const existing = new Map<number, { title: string; slug: string }>();
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(blogDir, file), "utf8");
    // Extract frontmatter
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;

    const fm = fmMatch[1];
    const serialMatch = fm.match(/serialNumber:\s*(\d+)/);
    const titleMatch = fm.match(/title:\s*["']?(.+?)["']?\s*$/m);
    const slugMatch = fm.match(/slug:\s*["']?(.+?)["']?\s*$/m);

    if (serialMatch) {
      const sn = parseInt(serialMatch[1], 10);
      const title = titleMatch ? titleMatch[1].replace(/["']/g, "").trim() : file.replace(".md", "");
      const slug = slugMatch ? slugMatch[1].replace(/["']/g, "").trim() : "";
      existing.set(sn, { title, slug });
    }
  }

  return existing;
}

// ── GET handler ──

export async function GET() {
  const categories = loadAllStrategyCategories();
  const existingPosts = loadExistingPosts();

  const trackingCategories: TrackingCategory[] = [];
  let overallTotal = 0;
  let overallWritten = 0;
  const recentWritten: { serialNumber: number; title: string; category: string }[] = [];

  for (const cat of categories) {
    const posts: TrackingPost[] = [];
    let writtenCount = 0;

    // Build the full list of serial numbers in range
    const serialsInRange = new Set<number>();
    for (let sn = cat.startSerial; sn <= cat.endSerial; sn++) {
      serialsInRange.add(sn);
    }

    // Track which serials from strategy file have posts
    const strategySerials = new Set(cat.posts.map((p) => p.serialNumber));

    // Mark strategy posts as written or pending
    for (const sp of cat.posts) {
      const exists = existingPosts.has(sp.serialNumber);
      posts.push({
        serialNumber: sp.serialNumber,
        title: sp.title,
        status: exists ? "written" : "pending",
      });
      if (exists) {
        writtenCount++;
        recentWritten.push({
          serialNumber: sp.serialNumber,
          title: sp.title,
          category: cat.label,
        });
      }
    }

    // Check for any existing posts not in strategy file but in range
    for (const [sn, data] of existingPosts) {
      if (sn >= cat.startSerial && sn <= cat.endSerial && !strategySerials.has(sn)) {
        posts.push({
          serialNumber: sn,
          title: data.title,
          status: "written",
        });
        writtenCount++;
        recentWritten.push({
          serialNumber: sn,
          title: data.title,
          category: cat.label,
        });
      }
    }

    // Sort by serial number
    posts.sort((a, b) => a.serialNumber - b.serialNumber);

    const percent = cat.posts.length > 0 ? Math.round((writtenCount / posts.length) * 100) : 0;

    trackingCategories.push({
      label: cat.label,
      startSerial: cat.startSerial,
      endSerial: cat.endSerial,
      total: cat.posts.length || 0,
      written: writtenCount,
      percent,
      posts,
    });

    overallTotal += cat.posts.length || 0;
    overallWritten += writtenCount;
  }

  // Sort recent written by serial number descending
  recentWritten.sort((a, b) => b.serialNumber - a.serialNumber);

  const overallPercent = overallTotal > 0 ? Math.round((overallWritten / overallTotal) * 100) : 0;

  const data: TrackingData = {
    categories: trackingCategories,
    overallTotal,
    overallWritten,
    overallPercent,
    recentWritten,
  };

  return NextResponse.json({ success: true, data });
}
