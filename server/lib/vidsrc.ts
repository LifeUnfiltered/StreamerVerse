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

// Search VidSrc content
export async function searchVidSrc(query: string): Promise<Video[]> {
  try {
    // For now, search through our sample data
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

// Fetch latest movies
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  try {
    // For demonstration, return sample movies
    return SAMPLE_MOVIES.map(movie => createVidSrcVideo(movie));
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }
}

// Fetch latest TV shows
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  try {
    // For demonstration, return sample shows
    return SAMPLE_SHOWS.map(show => createVidSrcVideo(show));
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    return [];
  }
}

// Fetch latest episodes
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  try {
    // For demonstration, return sample episodes
    return SAMPLE_SHOWS.map(show => createVidSrcVideo({
      ...show,
      season: 1,
      episode: 1,
      description: `Latest episode of ${show.title}`
    }));
  } catch (error) {
    console.error('Error fetching latest episodes:', error);
    return [];
  }
}