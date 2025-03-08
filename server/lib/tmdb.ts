import { MovieDb } from 'moviedb-promise';
import type { Video } from '@shared/schema';

const tmdb = new MovieDb(process.env.TMDB_API_KEY!);

// Convert TMDB movie to our Video type
function movieToVideo(movie: any): Video {
  const embedUrl = movie.imdb_id 
    ? `https://vidsrc.xyz/embed/movie/${movie.imdb_id}`
    : null;

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
      embedUrl
    },
    chapters: []
  };
}

// Convert TMDB TV show to our Video type
function tvShowToVideo(show: any, episode?: any): Video {
  const embedUrl = show.external_ids?.imdb_id 
    ? episode
      ? `https://vidsrc.xyz/embed/tv/${show.external_ids.imdb_id}/${episode.season_number}-${episode.episode_number}`
      : `https://vidsrc.xyz/embed/tv/${show.external_ids.imdb_id}`
    : null;

  const baseVideo = {
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
      embedUrl
    },
    chapters: []
  };

  if (episode) {
    return {
      ...baseVideo,
      title: `${show.name} S${episode.season_number}E${episode.episode_number} - ${episode.name}`,
      description: episode.overview || show.overview,
      thumbnail: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : baseVideo.thumbnail,
      metadata: {
        ...baseVideo.metadata,
        season: episode.season_number,
        episode: episode.episode_number,
        embedUrl
      }
    };
  }

  return baseVideo;
}

// Search for movies and TV shows
export async function searchContent(query: string): Promise<Video[]> {
  try {
    const results = await tmdb.searchMulti({ query });
    const videos: Video[] = [];

    for (const result of results.results || []) {
      if (result.media_type === 'movie') {
        const movieDetails = await tmdb.movieInfo({ 
          id: result.id, 
          append_to_response: 'external_ids' 
        });
        if (movieDetails.imdb_id) {
          videos.push(movieToVideo(movieDetails));
        }
      } else if (result.media_type === 'tv') {
        const showDetails = await tmdb.tvInfo({ 
          id: result.id, 
          append_to_response: 'external_ids' 
        });
        if (showDetails.external_ids?.imdb_id) {
          videos.push(tvShowToVideo(showDetails));
        }
      }
    }

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
      const movieDetails = await tmdb.movieInfo({ 
        id: movie.id, 
        append_to_response: 'external_ids' 
      });
      if (movieDetails.imdb_id) {
        videos.push(movieToVideo(movieDetails));
      }
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest movies error:', error);
    return [];
  }
}

// Fetch latest TV shows
export async function fetchLatestTVShows(): Promise<Video[]> {
  try {
    const airingToday = await tmdb.tvAiringToday();
    const videos: Video[] = [];

    for (const show of airingToday.results || []) {
      const showDetails = await tmdb.tvInfo({ 
        id: show.id, 
        append_to_response: 'external_ids' 
      });
      if (showDetails.external_ids?.imdb_id) {
        videos.push(tvShowToVideo(showDetails));
      }
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest TV shows error:', error);
    return [];
  }
}

// Fetch latest episodes
export async function fetchLatestEpisodes(): Promise<Video[]> {
  try {
    const airingToday = await tmdb.tvAiringToday();
    const videos: Video[] = [];

    for (const show of airingToday.results || []) {
      const showDetails = await tmdb.tvInfo({ 
        id: show.id, 
        append_to_response: 'external_ids,last_episode_to_air' 
      });
      if (showDetails.external_ids?.imdb_id && showDetails.last_episode_to_air) {
        videos.push(tvShowToVideo(showDetails, showDetails.last_episode_to_air));
      }
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest episodes error:', error);
    return [];
  }
}