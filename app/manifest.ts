import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "kajubadam Vocabulary — Master English-Hindi Vocabulary through Stories",
    short_name: "kajubadam",
    description:
      "Learn prepositions, homonyms, phrasal verbs, idioms, proverbs, and advanced English vocabulary with Hindi translations using immersive stories.",
    start_url: "/",
    display: "standalone",
    background_color: "#140905",
    theme_color: "#140905",
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
