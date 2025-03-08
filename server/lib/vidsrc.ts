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
    chapters: []
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
    // For testing, return sample data since the API endpoint might be rate-limited
    return [
      createVidSrcVideo({
        imdbId: 'tt9362722',
        title: 'Spider-Man: Across the Spider-Verse',
        type: 'movie',
        year: '2023',
        description: 'Miles Morales catapults across the Multiverse...',
        poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'
      }),
      createVidSrcVideo({
        imdbId: 'tt1517268',
        title: 'Barbie',
        type: 'movie',
        year: '2023',
        description: 'Barbie and Ken are having the time of their lives...',
        poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg'
      })
    ];
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }
}

// Fetch latest TV shows
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  try {
    // For testing, return sample data
    return [
      createVidSrcVideo({
        imdbId: 'tt1520211',
        title: 'The Walking Dead',
        type: 'tv',
        year: '2010',
        description: 'Sheriff Deputy Rick Grimes wakes up from a coma...',
        poster: 'https://image.tmdb.org/t/p/w500/n8iUqhJZ8t3xG3iaUXwJXXxEyXD.jpg'
      }),
      createVidSrcVideo({
        imdbId: 'tt0944947',
        title: 'Game of Thrones',
        type: 'tv',
        year: '2011',
        description: 'Nine noble families fight for control...',
        poster: 'https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg'
      })
    ];
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    return [];
  }
}

// Fetch latest episodes
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  try {
    // For testing, return sample data
    return [
      createVidSrcVideo({
        imdbId: 'tt1520211',
        title: 'The Walking Dead',
        type: 'tv',
        season: 1,
        episode: 1,
        description: 'Rick searches for his family...',
        poster: 'https://image.tmdb.org/t/p/w500/n8iUqhJZ8t3xG3iaUXwJXXxEyXD.jpg'
      }),
      createVidSrcVideo({
        imdbId: 'tt0944947',
        title: 'Game of Thrones',
        type: 'tv',
        season: 1,
        episode: 1,
        description: 'Winter is Coming',
        poster: 'https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg'
      })
    ];
  } catch (error) {
    console.error('Error fetching latest episodes:', error);
    return [];
  }
}