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
function tvShowToVideo(show: any, episode?: any): Video {
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
    },
    chapters: []
  };

  if (episode) {
    const seasonNum = episode.season_number;
    const episodeNum = episode.episode_number;
    return {
      ...baseVideo,
      title: `${show.name} S${seasonNum}E${episodeNum} - ${episode.name}`,
      description: episode.overview || show.overview,
      thumbnail: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : baseVideo.thumbnail,
      metadata: {
        ...baseVideo.metadata,
        season: seasonNum,
        episode: episodeNum,
        embedUrl: show.external_ids?.imdb_id 
          ? `https://vidsrc.xyz/embed/tv/${show.external_ids.imdb_id}/${seasonNum}-${episodeNum}`
          : null
      }
    };
  }

  // For show without specific episode
  return {
    ...baseVideo,
    metadata: {
      ...baseVideo.metadata,
      embedUrl: show.external_ids?.imdb_id 
        ? `https://vidsrc.xyz/embed/tv/${show.external_ids.imdb_id}`
        : null
    }
  };
}

export async function searchContent(query: string): Promise<Video[]> {
  try {
    const results = await tmdb.searchMulti({ query });
    const videos: Video[] = [];

    for (const result of results.results || []) {
      if (result.media_type === 'movie') {
        const movieDetails = await tmdb.movieInfo({ 
          id: result.id as number, 
          append_to_response: 'external_ids' 
        });
        videos.push(movieToVideo(movieDetails));
      } else if (result.media_type === 'tv') {
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

export async function fetchLatestEpisodes(): Promise<Video[]> {
  try {
    const airingToday = await tmdb.tvAiringToday();
    const videos: Video[] = [];

    for (const show of airingToday.results || []) {
      const showDetails = await tmdb.tvInfo({ 
        id: show.id as number, 
        append_to_response: 'external_ids,last_episode_to_air' 
      });

      if (showDetails.last_episode_to_air) {
        videos.push(tvShowToVideo(showDetails, showDetails.last_episode_to_air));
      }
    }

    return videos;
  } catch (error) {
    console.error('TMDB latest episodes error:', error);
    return [];
  }
}