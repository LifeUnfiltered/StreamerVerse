import { MovieDb } from 'moviedb-promise';
import type { Video } from '@shared/schema';

const tmdb = new MovieDb(process.env.TMDB_API_KEY!);

// Convert TMDB TV show to our Video type
function showToVideo(show: any): Video {
  return {
    id: show.id,
    sourceId: show.external_ids?.imdb_id || `tmdb-${show.id}`,
    source: 'vidsrc',
    title: show.name,
    description: show.overview || null,
    thumbnail: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
    metadata: {
      imdbId: show.external_ids?.imdb_id,
      type: 'tv',
      tmdbId: show.id,
      embedUrl: show.external_ids?.imdb_id ? 
        `https://vidsrc.to/embed/tv/${show.external_ids.imdb_id}` : null
    },
    chapters: null
  };
}

// Convert TMDB episode to our Video type
function episodeToVideo(episode: any, show: any): Video {
  return {
    id: episode.id,
    sourceId: show.external_ids?.imdb_id || `tmdb-${show.id}`,
    source: 'vidsrc',
    title: `${show.name} S${episode.season_number}E${episode.episode_number} - ${episode.name}`,
    description: episode.overview || null,
    thumbnail: episode.still_path ? 
      `https://image.tmdb.org/t/p/w500${episode.still_path}` : 
      (show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null),
    metadata: {
      imdbId: show.external_ids?.imdb_id,
      type: 'tv',
      tmdbId: show.id,
      embedUrl: show.external_ids?.imdb_id ? 
        `https://vidsrc.to/embed/tv/${show.external_ids.imdb_id}/${episode.season_number}-${episode.episode_number}` : null,
      season: episode.season_number,
      episode: episode.episode_number
    },
    chapters: null
  };
}

// Search content using TMDB
export async function searchContent(query: string): Promise<Video[]> {
  const videos: Video[] = [];

  try {
    const results = await tmdb.searchMulti({ query });

    for (const result of results.results || []) {
      if (result.media_type === 'tv') {
        try {
          const showDetails = await tmdb.tvInfo({
            id: result.id,
            append_to_response: 'external_ids'
          });

          if (showDetails.name && showDetails.external_ids?.imdb_id) {
            videos.push(showToVideo(showDetails));
          }
        } catch (error) {
          console.error(`Error fetching show details for ${result.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('TMDB Search Error:', error);
  }

  return videos;
}

// Fetch latest TV shows from TMDB
export async function fetchLatestTVShows(page: number = 1): Promise<Video[]> {
  const videos: Video[] = [];

  try {
    const popular = await tmdb.tvPopular({ page });

    for (const show of popular.results || []) {
      try {
        const showDetails = await tmdb.tvInfo({
          id: show.id,
          append_to_response: 'external_ids'
        });

        if (showDetails.name && showDetails.external_ids?.imdb_id) {
          videos.push(showToVideo(showDetails));
        }
      } catch (error) {
        console.error(`Error fetching show details for ${show.name}:`, error);
      }
    }
  } catch (error) {
    console.error('TMDB Popular TV Shows Error:', error);
  }

  return videos;
}

// Fetch episodes for a specific TV show
export async function fetchTVShowEpisodes(showId: number, seasonNumber?: number): Promise<Video[]> {
  const videos: Video[] = [];

  try {
    const showDetails = await tmdb.tvInfo({
      id: showId,
      append_to_response: 'external_ids'
    });

    if (!showDetails.name || !showDetails.external_ids?.imdb_id) {
      console.error('Show details missing required data');
      return videos;
    }

    // If season number is provided, fetch only that season
    if (seasonNumber) {
      const season = await tmdb.seasonInfo({
        id: showId,
        season_number: seasonNumber
      });

      for (const episode of season.episodes || []) {
        videos.push(episodeToVideo(episode, showDetails));
      }
    } else {
      // Fetch all seasons
      for (let i = 1; i <= (showDetails.number_of_seasons || 1); i++) {
        const season = await tmdb.seasonInfo({
          id: showId,
          season_number: i
        });

        for (const episode of season.episodes || []) {
          videos.push(episodeToVideo(episode, showDetails));
        }
      }
    }
  } catch (error) {
    console.error('TMDB TV Show Episodes Error:', error);
  }

  return videos;
}

// Fetch latest episodes
export async function fetchLatestEpisodes(): Promise<Video[]> {
  const videos: Video[] = [];

  try {
    // Get popular shows first
    const popular = await tmdb.tvPopular();

    // For each show, get the latest season and its episodes
    for (const show of popular.results?.slice(0, 5) || []) {
      try {
        const showDetails = await tmdb.tvInfo({
          id: show.id,
          append_to_response: 'external_ids'
        });

        if (!showDetails.name || !showDetails.external_ids?.imdb_id) {
          continue;
        }

        const latestSeason = showDetails.number_of_seasons || 1;
        const season = await tmdb.seasonInfo({
          id: show.id,
          season_number: latestSeason
        });

        // Get the last 3 episodes of each show
        for (const episode of season.episodes?.slice(-3) || []) {
          videos.push(episodeToVideo(episode, showDetails));
        }
      } catch (error) {
        console.error(`Error fetching show ${show.name}:`, error);
      }
    }
  } catch (error) {
    console.error('TMDB Latest Episodes Error:', error);
  }

  return videos;
}

// Convert TMDB movie to our Video type
function movieToVideo(movie: any): Video {
  return {
    id: 0,
    sourceId: movie.imdb_id || `tmdb-${movie.id}`,
    source: 'vidsrc',
    title: movie.title,
    description: movie.overview || null,
    thumbnail: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    metadata: {
      imdbId: movie.imdb_id,
      type: 'movie',
      tmdbId: movie.id,
      embedUrl: movie.imdb_id ? `https://vidsrc.to/embed/movie/${movie.imdb_id}` : null
    },
    chapters: null
  };
}