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
  let url = `${VIDSRC_BASE_URL}/${type}/${imdbId}`;

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

// Fetch latest movies
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  try {
    const response = await fetch(`https://vidsrc.xyz/movies/latest/page-${page}.json`);
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
    const response = await fetch(`https://vidsrc.xyz/tvshows/latest/page-${page}.json`);
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
    const response = await fetch(`https://vidsrc.xyz/episodes/latest/page-${page}.json`);
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