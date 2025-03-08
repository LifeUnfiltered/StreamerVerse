import type { Video } from "@shared/schema";
import { searchContent, fetchLatestMovies, fetchLatestTVShows, fetchLatestEpisodes } from './tmdb';

const VIDSRC_BASE_URL = "https://vidsrc.xyz";

// Different content types for VidSrc
type ContentType = 'movie' | 'tv';

interface VidSrcContent {
  imdbId: string;
  title: string;
  type: ContentType;
  season?: number;
  episode?: number;
}

export function getVidSrcEmbedUrl(content: VidSrcContent): string {
  const { imdbId, type, season, episode } = content;

  // Create the embed URL based on the content type
  if (type === 'movie') {
    return `${VIDSRC_BASE_URL}/embed/movie/${imdbId}`;
  } else if (type === 'tv') {
    if (season && episode) {
      return `${VIDSRC_BASE_URL}/embed/tv/${imdbId}/${season}-${episode}`;
    }
    return `${VIDSRC_BASE_URL}/embed/tv/${imdbId}`;
  }

  throw new Error('Invalid content type');
}

export function createVidSrcVideo(content: VidSrcContent): Video {
  const { imdbId, title, type, season, episode } = content;

  // Create a display title that includes season/episode for TV shows
  const displayTitle = type === 'tv' && season && episode
    ? `${title} S${season}E${episode}`
    : title;

  return {
    id: 0, // This will be set by the database
    sourceId: imdbId,
    source: 'vidsrc',
    title: displayTitle,
    description: '',
    thumbnail: null,
    metadata: { 
      imdbId,
      type,
      season,
      episode,
      embedUrl: getVidSrcEmbedUrl(content)
    },
    chapters: []
  };
}

// Search VidSrc content using TMDB
export async function searchVidSrc(query: string): Promise<Video[]> {
  return searchContent(query);
}

// Fetch latest movies from TMDB
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  return fetchLatestMovies();
}

// Fetch latest TV shows from TMDB
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  return fetchLatestTVShows();
}

// Fetch latest episodes
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  return fetchLatestEpisodes();
}