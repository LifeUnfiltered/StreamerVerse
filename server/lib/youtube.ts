import type { Video, Chapter } from "@shared/schema";

function parseChaptersFromDescription(description: string): Chapter[] {
  const lines = description.split('\n');
  const chapters: Chapter[] = [];
  const timeRegex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/;

  console.log('Parsing description for chapters:', description);

  for (const line of lines) {
    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      const [fullTime, hours = "0", minutes = "0", seconds = "0"] = timeMatch;
      const timestamp = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

      // Get the chapter title (everything after the timestamp)
      const title = line.substring(fullTime.length).trim();
      if (title) {
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

  // For testing purposes, let's add some sample chapters to the first video
  return data.items.map((item: any, index: number) => {
    let chapters = parseChaptersFromDescription(item.snippet.description);

    // Add sample chapters to the first video if no chapters were found
    if (index === 0 && chapters.length === 0) {
      chapters = [
        { timestamp: 0, title: "Introduction" },
        { timestamp: 30, title: "Main Content" },
        { timestamp: 60, title: "Summary" }
      ];
    }

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