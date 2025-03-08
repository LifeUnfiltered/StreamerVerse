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

// Sample data for demonstration
const SAMPLE_MOVIES = [
  {
    imdbId: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie' as ContentType,
    year: '2023',
    description: 'Miles Morales catapults across the Multiverse...',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'
  },
  {
    imdbId: 'tt1517268',
    title: 'Barbie',
    type: 'movie' as ContentType,
    year: '2023',
    description: 'Barbie and Ken are having the time of their lives...',
    poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg'
  }
];

const SAMPLE_SHOWS = [
  {
    imdbId: 'tt1520211',
    title: 'The Walking Dead',
    type: 'tv' as ContentType,
    year: '2010',
    description: 'Sheriff Deputy Rick Grimes wakes up from a coma...',
    poster: 'https://image.tmdb.org/t/p/w500/n8iUqhJZ8t3xG3iaUXwJXXxEyXD.jpg'
  },
  {
    imdbId: 'tt0944947',
    title: 'Game of Thrones',
    type: 'tv' as ContentType,
    year: '2011',
    description: 'Nine noble families fight for control...',
    poster: 'https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg'
  }
];

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

// Search function that uses sample data
export async function searchVidSrc(query: string): Promise<Video[]> {
  try {
    const searchTerm = query.toLowerCase();
    const allContent = [...SAMPLE_MOVIES, ...SAMPLE_SHOWS];

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

// Fetch latest movies using sample data
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  return SAMPLE_MOVIES.map(movie => createVidSrcVideo(movie));
}

// Fetch latest TV shows using sample data
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  return SAMPLE_SHOWS.map(show => createVidSrcVideo(show));
}

// Fetch latest episodes using sample data
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  return SAMPLE_SHOWS.map(show => createVidSrcVideo({
    ...show,
    season: 1,
    episode: 1,
    description: `Latest episode of ${show.title}`
  }));
}