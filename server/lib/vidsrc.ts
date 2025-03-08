import type { Video } from "@shared/schema";

const VIDSRC_BASE_URL = "https://vidsrc.xyz/embed";

// Different content types for VidSrc
type ContentType = 'movie' | 'tv';

interface VidSrcContent {
  imdbId: string;
  title: string;
  type: ContentType;
  year?: string;
  season?: number;
  episode?: number;
  poster?: string;
  description?: string;
}

export function getVidSrcEmbedUrl(imdbId: string, type: ContentType, season?: number, episode?: number): string {
  let url = `${VIDSRC_BASE_URL}/${imdbId}`;

  if (type === 'tv' && season && episode) {
    url += `/${season}/${episode}`;
  }

  return url;
}

export function createVidSrcVideo(content: VidSrcContent): Video {
  const { imdbId, title, type, season, episode, poster, description } = content;

  // Create a display title that includes season/episode for TV shows
  const displayTitle = type === 'tv' && season && episode
    ? `${title} S${season}E${episode}`
    : title;

  return {
    id: 0, // This will be set by the database
    sourceId: imdbId,
    source: 'vidsrc',
    title: displayTitle,
    description: description || '',
    thumbnail: poster || null,
    metadata: { 
      imdbId,
      type,
      season,
      episode
    },
    chapters: null
  };
}

// Search VidSrc content (to be implemented with actual API)
export async function searchVidSrc(query: string): Promise<Video[]> {
  // TODO: Implement actual VidSrc API search
  // For now, return sample data
  const sampleMovies: VidSrcContent[] = [
    {
      imdbId: 'tt0111161',
      title: 'The Shawshank Redemption',
      type: 'movie',
      year: '1994',
      description: 'Two imprisoned men bond over a number of years...',
      poster: 'https://example.com/shawshank.jpg'
    },
    {
      imdbId: 'tt0068646',
      title: 'The Godfather',
      type: 'movie',
      year: '1972',
      description: 'The aging patriarch of an organized crime dynasty...',
      poster: 'https://example.com/godfather.jpg'
    }
  ];

  // Convert VidSrcContent to Video type
  return sampleMovies.map(movie => createVidSrcVideo(movie));
}