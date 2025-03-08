import type { Video } from "@shared/schema";

const VIDSRC_BASE_URL = "https://vidsrc.xyz";

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
  let url = `${VIDSRC_BASE_URL}/embed/${type}/${imdbId}`;

  if (type === 'tv' && season && episode) {
    url += `/${season}-${episode}`;
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
    chapters: []
  };
}

// Fetch latest movies
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/movies/latest/page-${page}.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch latest movies');
    }
    const data = await response.json();
    return data.map((movie: any) => createVidSrcVideo({
      imdbId: movie.imdb_id,
      title: movie.title,
      type: 'movie',
      year: movie.year,
      description: movie.overview,
      poster: movie.poster
    }));
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }
}

// Fetch latest TV shows
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/tvshows/latest/page-${page}.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch latest TV shows');
    }
    const data = await response.json();
    return data.map((show: any) => createVidSrcVideo({
      imdbId: show.imdb_id,
      title: show.title,
      type: 'tv',
      year: show.year,
      description: show.overview,
      poster: show.poster
    }));
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    return [];
  }
}

// Fetch latest episodes
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/episodes/latest/page-${page}.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch latest episodes');
    }
    const data = await response.json();
    return data.map((episode: any) => createVidSrcVideo({
      imdbId: episode.show_imdb_id,
      title: episode.show_title,
      type: 'tv',
      season: episode.season_number,
      episode: episode.episode_number,
      description: episode.overview,
      poster: episode.still_path
    }));
  } catch (error) {
    console.error('Error fetching latest episodes:', error);
    return [];
  }
}

// Search VidSrc content
export async function searchVidSrc(query: string): Promise<Video[]> {
  try {
    // For IMDB ID search (starts with 'tt')
    if (query.toLowerCase().startsWith('tt')) {
      const response = await fetch(`${VIDSRC_BASE_URL}/movie/${query}`);
      if (!response.ok) {
        throw new Error('Movie not found');
      }
      const movie = await response.json();
      return [createVidSrcVideo({
        imdbId: movie.imdb_id,
        title: movie.title,
        type: 'movie',
        year: movie.year,
        description: movie.overview,
        poster: movie.poster
      })];
    }

    // Title search
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${VIDSRC_BASE_URL}/search?query=${encodedQuery}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const results = await response.json();

    return results.map((item: any) => createVidSrcVideo({
      imdbId: item.imdb_id,
      title: item.title,
      type: item.media_type === 'movie' ? 'movie' : 'tv',
      year: item.year,
      description: item.overview,
      poster: item.poster
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}