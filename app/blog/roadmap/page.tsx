// ── Roadmap Page (Server Component) ──
// Loads blog post data from the filesystem and passes it to the interactive client component.

import { getAllPublishedPosts, getRoadmapStats, computeAllTopicSerials } from "@/lib/roadmap-tracker";
import { roadmapCategories } from "@/lib/roadmap";
import { RoadmapClient } from "./RoadmapClient";

export default function BlogRoadmapPage() {
    const stats = getRoadmapStats();
    const publishedPosts = getAllPublishedPosts();
    const topicSerials = computeAllTopicSerials();

    return (
        <RoadmapClient
            roadmapCategories={roadmapCategories}
            publishedPosts={publishedPosts}
            topicSerials={topicSerials}
            stats={stats}
        />
    );
}
