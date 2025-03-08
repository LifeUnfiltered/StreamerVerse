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

// Real movie and show data
const VIDSRC_CONTENT = {
  movies: [
    {
      imdbId: 'tt15398776',
      title: 'Oppenheimer',
      type: 'movie' as ContentType,
      year: '2023',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'
    },
    {
      imdbId: 'tt1517268',
      title: 'Barbie',
      type: 'movie' as ContentType,
      year: '2023',
      description: 'Barbie suffers a crisis that leads her to question her world and her existence.',
      poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg'
    },
    {
      imdbId: 'tt10366206',
      title: 'John Wick: Chapter 4',
      type: 'movie' as ContentType,
      year: '2023',
      description: 'John Wick uncovers a path to defeating The High Table.',
      poster: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg'
    }
  ],
  shows: [
    {
      imdbId: 'tt5491994',
      title: 'True Detective',
      type: 'tv' as ContentType,
      year: '2024',
      description: 'When the long winter night falls in Ennis, Alaska, the eight men who operate the Tsalal Arctic Research Station vanish without a trace.',
      poster: 'https://image.tmdb.org/t/p/w500/5Pmq5Cy8lIZbI9DyQS2AOwpYHTI.jpg'
    },
    {
      imdbId: 'tt1520211',
      title: 'The Walking Dead',
      type: 'tv' as ContentType,
      year: '2010',
      description: 'Sheriff Deputy Rick Grimes wakes up from a coma to learn the world is in ruins and must lead a group of survivors to stay alive.',
      poster: 'https://image.tmdb.org/t/p/w500/n8iUqhJZ8t3xG3iaUXwJXXxEyXD.jpg'
    }
  ]
};

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

// Search VidSrc content
export async function searchVidSrc(query: string): Promise<Video[]> {
  try {
    const searchTerm = query.toLowerCase();
    const allContent = [...VIDSRC_CONTENT.movies, ...VIDSRC_CONTENT.shows];

    const results = allContent.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.imdbId.toLowerCase() === searchTerm
    );

    return results.map(item => createVidSrcVideo(item));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Fetch latest movies
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  return VIDSRC_CONTENT.movies.map(movie => createVidSrcVideo(movie));
}

// Fetch latest TV shows
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  return VIDSRC_CONTENT.shows.map(show => createVidSrcVideo(show));
}

// Fetch latest episodes
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  return VIDSRC_CONTENT.shows.map(show => createVidSrcVideo({
    ...show,
    season: 1,
    episode: 1,
    description: `Latest episode of ${show.title}`
  }));
}