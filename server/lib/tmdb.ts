import { MovieDb } from 'moviedb-promise';
import type { Video } from '@shared/schema';

const tmdb = new MovieDb(process.env.TMDB_API_KEY!);

// Convert TMDB movie to our Video type
function movieToVideo(movie: any): Video {
  return {
    id: 0,
    sourceId: movie.imdb_id || `tmdb-${movie.id}`,
    source: 'vidsrc',
    title: movie.title,
    description: movie.overview,
    thumbnail: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    metadata: {
      imdbId: movie.imdb_id,
      type: 'movie',
      tmdbId: movie.id,
      embedUrl: movie.imdb_id ? `https://vidsrc.xyz/embed/movie/${movie.imdb_id}` : null
    },
    chapters: []
  };
}

// Convert TMDB TV show to our Video type
function tvShowToVideo(show: any): Video {
  return {
    id: 0,
    sourceId: show.external_ids?.imdb_id || `tmdb-${show.id}`,
    source: 'vidsrc',
    title: show.name,
    description: show.overview,
    thumbnail: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
    metadata: {
      imdbId: show.external_ids?.imdb_id,
      type: 'tv',
      tmdbId: show.id,
      embedUrl: show.external_ids?.imdb_id ? `https://vidsrc.xyz/embed/tv/${show.external_ids.imdb_id}` : null
    },
    chapters: []
  };
}

export async function searchContent(query: string): Promise<Video[]> {
  try {
    const results = await tmdb.searchMulti({ query });
    const videos: Video[] = [];

    for (const result of results.results || []) {
      if (result.media_type === 'movie') {
        // Fetch additional movie details to get IMDB ID
        const movieDetails = await tmdb.movieInfo({ 
          id: result.id as number, 
          append_to_response: 'external_ids' 
        });
        videos.push(movieToVideo(movieDetails));
      } else if (result.media_type === 'tv') {
        // Fetch additional TV show details to get IMDB ID
        const showDetails = await tmdb.tvInfo({ 
          id: result.id as number, 
          append_to_response: 'external_ids' 
        });
        videos.push(tvShowToVideo(showDetails));
      }
    }

    return videos;
  } catch (error) {
    console.error('TMDB search error:', error);
    return [];
  }
}

export async function fetchLatestMovies(): Promise<Video[]> {
  try {
    const nowPlaying = await tmdb.movieNowPlaying();
    const videos: Video[] = [];

    for (const movie of nowPlaying.results || []) {
      const movieDetails = await tmdb.movieInfo({ 
        id: movie.id as number, 
        append_to_response: 'external_ids' 
      });
      videos.push(movieToVideo(movieDetails));
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest movies error:', error);
    return [];
  }
}

export async function fetchLatestTVShows(): Promise<Video[]> {
  try {
    const airingToday = await tmdb.tvAiringToday();
    const videos: Video[] = [];

    for (const show of airingToday.results || []) {
      const showDetails = await tmdb.tvInfo({ 
        id: show.id as number, 
        append_to_response: 'external_ids' 
      });
      videos.push(tvShowToVideo(showDetails));
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest TV shows error:', error);
    return [];
  }
}