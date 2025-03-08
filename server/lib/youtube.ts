import type { Video, Chapter } from "@shared/schema";

function parseChaptersFromDescription(description: string): Chapter[] {
  const lines = description.split('\n');
  const chapters: Chapter[] = [];
  // Support both single and double-digit formats: 0:00, 00:00, 1:23:45
  const timeRegex = /^(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)/;

  console.log('Parsing description for chapters:', description);

  for (const line of lines) {
    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      const [_, hours = "0", minutes, seconds] = timeMatch;
      const timestamp = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

      // Get the chapter title (everything after the timestamp)
      const titleMatch = line.match(/^\d[\d:]+\s*[-\s]?\s*(.+)/);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        chapters.push({ timestamp, title });
      }
    }
  }

  console.log('Found chapters:', chapters);
  return chapters;
}

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

  return data.items.map((item: any) => {
    const chapters = parseChaptersFromDescription(item.snippet.description);

    return {
      id: item.id.videoId,
      sourceId: item.id.videoId,
      source: 'youtube',
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      metadata: item.snippet,
      chapters
    };
  });
}