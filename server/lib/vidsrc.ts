import type { Video } from "@shared/schema";
import { searchContent, getLatestMovies, getLatestTVShows } from './tmdb';

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

// Search VidSrc content using TMDB
export async function searchVidSrc(query: string): Promise<Video[]> {
  return searchContent(query);
}

// Fetch latest movies from TMDB
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  return getLatestMovies();
}

// Fetch latest TV shows from TMDB
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  return getLatestTVShows();
}

// Fetch latest episodes (using latest TV shows)
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  const shows = await getLatestTVShows();
  return shows.map(show => ({
    ...show,
    metadata: {
      ...show.metadata,
      season: 1,
      episode: 1,
      embedUrl: show.metadata.imdbId 
        ? `${VIDSRC_BASE_URL}/embed/tv/${show.metadata.imdbId}/1-1`
        : null
    }
  }));
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
      episode,
      embedUrl: getVidSrcEmbedUrl(content)
    },
    chapters: []
  };
}