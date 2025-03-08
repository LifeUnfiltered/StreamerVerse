import type { Video } from "@shared/schema";

const VIDSRC_BASE_URL = "https://vidsrc.xyz/embed";

export function getVidSrcEmbedUrl(imdbId: string): string {
  return `${VIDSRC_BASE_URL}/${imdbId}`;
}

export function createVidSrcVideo(imdbId: string, title: string, description?: string): Video {
  return {
    id: imdbId,
    sourceId: imdbId,
    source: 'vidsrc',
    title,
    description: description || '',
    thumbnail: null,
    metadata: { imdbId },
    chapters: null
  };
}
