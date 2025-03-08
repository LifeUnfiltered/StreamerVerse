import type { Video } from "@shared/schema";

export async function searchYouTube(query: string): Promise<Video[]> {
  const apiKey = process.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API key not configured");
  }

  const params = new URLSearchParams({
    part: 'snippet',
    maxResults: '25',
    q: query,
    type: 'video',
    key: apiKey
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch videos from YouTube');
  }

  const data = await response.json();

  return data.items.map((item: any) => ({
    id: item.id.videoId,
    sourceId: item.id.videoId,
    source: 'youtube',
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    metadata: item.snippet
  }));
}
