import { MovieDb } from 'moviedb-promise';
import type { Video } from '@shared/schema';

const tmdb = new MovieDb(process.env.TMDB_API_KEY!);

export const TEST_TV_SHOWS: Video[] = [
  {
    id: 0,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones',
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947'
    },
    chapters: []
  },
  {
    id: 1,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead',
    description: 'Sheriff Deputy Rick Grimes wakes up from a coma to learn the world is in ruins and must lead a group of survivors to stay alive.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211'
    },
    chapters: []
  }
];

// Test episodes with multiple seasons
export const TEST_EPISODES: Video[] = [
  // Game of Thrones Season 1
  {
    id: 3,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E1 - Winter Is Coming',
    description: 'Eddard Stark is torn between his family and an old friend when asked to serve at the side of King Robert Baratheon.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-1',
      season: 1,
      episode: 1
    },
    chapters: []
  },
  {
    id: 4,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E2 - The Kingsroad',
    description: 'While Bran recovers from his fall, Ned takes only his daughters to Kings Landing. Jon Snow goes with his uncle Benjen to The Wall.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-2',
      season: 1,
      episode: 2
    },
    chapters: []
  },
  {
    id: 5,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S1E3 - Lord Snow',
    description: 'Lord Stark and his daughters arrive at King\'s Landing to take up his new duties as the King\'s Hand.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/1-3',
      season: 1,
      episode: 3
    },
    chapters: []
  },
  // Game of Thrones Season 2
  {
    id: 6,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E1 - The North Remembers',
    description: 'As Robb Stark and his northern army continue the war against the Lannisters, Tyrion arrives in King\'s Landing to counsel Joffrey.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-1',
      season: 2,
      episode: 1
    },
    chapters: []
  },
  {
    id: 7,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E2 - The Night Lands',
    description: 'Arya makes friends with Gendry. Tyrion tries to take control of the Small Council. Theon arrives at his home, Pyke, in order to persuade his father into helping Robb with the war.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-2',
      season: 2,
      episode: 2
    },
    chapters: []
  },
  {
    id: 8,
    sourceId: 'tt0944947',
    source: 'vidsrc',
    title: 'Game of Thrones S2E3 - What Is Dead May Never Die',
    description: 'Tyrion tries to prevent the news of King Joffrey\'s true parentage from reaching the kingdom.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    metadata: {
      imdbId: 'tt0944947',
      type: 'tv',
      tmdbId: 1399,
      embedUrl: 'https://vidsrc.to/embed/tv/tt0944947/2-3',
      season: 2,
      episode: 3
    },
    chapters: []
  },
  // The Walking Dead Season 1
  {
    id: 9,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E1 - Days Gone Bye',
    description: 'Rick searches for his family in a world terrorized by the walking dead.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-1',
      season: 1,
      episode: 1
    },
    chapters: []
  },
  {
    id: 10,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E2 - Guts',
    description: 'Rick finds himself trapped in Atlanta, where he bands together with a group of survivors to escape the city.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-2',
      season: 1,
      episode: 2
    },
    chapters: []
  },
  {
    id: 11,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S1E3 - Tell It to the Frogs',
    description: 'Rick reunites with his family but has to decide whether to risk his life to help a group of survivors trapped in Atlanta.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/1-3',
      season: 1,
      episode: 3
    },
    chapters: []
  },
  // The Walking Dead Season 2
  {
    id: 12,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E1 - What Lies Ahead',
    description: 'The group sets out for Fort Benning but encounters a threat on the highway the likes of which they\'ve never seen.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-1',
      season: 2,
      episode: 1
    },
    chapters: []
  },
  {
    id: 13,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E2 - Bloodletting',
    description: 'After a tragic accident, the group finds shelter at a nearby farm while searching for a missing person.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-2',
      season: 2,
      episode: 2
    },
    chapters: []
  },
  {
    id: 14,
    sourceId: 'tt1520211',
    source: 'vidsrc',
    title: 'The Walking Dead S2E3 - Save the Last One',
    description: 'The group awaits Shane\'s return as he searches for medical supplies.',
    thumbnail: 'https://image.tmdb.org/t/p/w500/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    metadata: {
      imdbId: 'tt1520211',
      type: 'tv',
      tmdbId: 1402,
      embedUrl: 'https://vidsrc.to/embed/tv/tt1520211/2-3',
      season: 2,
      episode: 3
    },
    chapters: []
  }
];

// Convert TMDB movie to our Video type
function movieToVideo(movie: any): Video {
  const embedUrl = movie.imdb_id 
    ? `https://vidsrc.to/embed/movie/${movie.imdb_id}`
    : null;

  return {
    id: 0,
    sourceId: movie.imdb_id || `tmdb-${movie.id}`,
    source: 'vidsrc',
    title: movie.title,
    description: movie.overview || '',
    thumbnail: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    metadata: {
      imdbId: movie.imdb_id,
      type: 'movie',
      tmdbId: movie.id,
      embedUrl
    },
    chapters: []
  };
}

// Convert TMDB TV show to our Video type
function tvShowToVideo(show: any, episode?: any): Video | null {
  try {
    const imdbId = show.external_ids?.imdb_id;
    if (!imdbId || !show.name) {
      console.log('Skipping show - missing data:', { 
        name: show?.name,
        imdbId,
        showId: show?.id
      });
      return null;
    }

    // Use the exact URL format from VidSrc documentation
    let embedUrl: string;
    let title: string;
    let description: string;

    if (episode) {
      // Format: https://vidsrc.to/embed/tv/tt0944947/1-1
      title = `${show.name} S${episode.season_number}E${episode.episode_number} - ${episode.name}`;
      description = episode.overview || show.overview || '';
      embedUrl = `https://vidsrc.to/embed/tv/${imdbId}/${episode.season_number}-${episode.episode_number}`;
    } else {
      // Format: https://vidsrc.to/embed/tv/tt0944947
      title = show.name;
      description = show.overview || '';
      embedUrl = `https://vidsrc.to/embed/tv/${imdbId}`;
    }

    console.log('Creating TV video:', {
      title,
      imdbId,
      embedUrl,
      isEpisode: !!episode
    });

    return {
      id: 0,
      sourceId: imdbId,
      source: 'vidsrc',
      title,
      description,
      thumbnail: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
      metadata: {
        imdbId,
        type: 'tv',
        tmdbId: show.id,
        embedUrl,
        season: episode?.season_number,
        episode: episode?.episode_number
      },
      chapters: []
    };
  } catch (error) {
    console.error('Error creating TV video:', error);
    return null;
  }
}

// Search for movies and TV shows
export async function searchContent(query: string): Promise<Video[]> {
  try {
    const results = await tmdb.searchMulti({ query });
    const videos: Video[] = [];

    for (const result of results.results || []) {
      try {
        if (result.media_type === 'movie') {
          const movieDetails = await tmdb.movieInfo({ 
            id: result.id,
            append_to_response: 'external_ids' 
          });
          if (movieDetails.imdb_id) {
            videos.push(movieToVideo(movieDetails));
          }
        }
      } catch (error) {
        console.error('Error processing search result:', error);
        continue;
      }
    }

    // Add test TV shows if query matches any of their titles
    const lowerQuery = query.toLowerCase();
    TEST_TV_SHOWS.forEach(show => {
      if (show.title.toLowerCase().includes(lowerQuery)) {
        videos.push(show);
      }
    });

    return videos;
  } catch (error) {
    console.error('TMDB search error:', error);
    return [];
  }
}

// Fetch latest movies
export async function fetchLatestMovies(): Promise<Video[]> {
  try {
    const nowPlaying = await tmdb.movieNowPlaying();
    const videos: Video[] = [];

    for (const movie of nowPlaying.results || []) {
      try {
        const movieDetails = await tmdb.movieInfo({ 
          id: movie.id,
          append_to_response: 'external_ids' 
        });
        if (movieDetails.imdb_id) {
          videos.push(movieToVideo(movieDetails));
        }
      } catch (error) {
        console.error('Error processing movie:', error);
        continue;
      }
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest movies error:', error);
    return [];
  }
}

// Fetch latest TV shows - using test data for now
export async function fetchLatestTVShows(): Promise<Video[]> {
  console.log('Returning test TV shows data');
  return TEST_TV_SHOWS;
}

// Fetch latest episodes - using test data for now
export async function fetchLatestEpisodes(): Promise<Video[]> {
  console.log('Returning test episodes data');
  return TEST_EPISODES;
}