import { MovieDb } from 'moviedb-promise';
import type { Video } from '@shared/schema';

// TypeScript declarations to bridge any API type gaps
interface EnhancedShowResponse {
  id: number;
  name?: string;
  title?: string;
  external_ids?: {
    imdb_id?: string;
  };
  number_of_seasons?: number;
  poster_path?: string;
  overview?: string;
}

interface EnhancedEpisodeResponse {
  id: number;
  name?: string;
  overview?: string;
  season_number: number;
  episode_number: number;
  still_path?: string;
}

const tmdb = new MovieDb(process.env.TMDB_API_KEY!);

// Convert TMDB movie to our Video type
function movieToVideo(movie: any): Video {
  return {
    id: movie.id,
    sourceId: movie.imdb_id || `tmdb-${movie.id}`,
    source: 'vidsrc',
    title: movie.title,
    description: movie.overview || null,
    thumbnail: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    metadata: {
      imdbId: movie.imdb_id,
      type: 'movie',
      tmdbId: movie.id,
      releaseDate: movie.release_date || null,
      voteAverage: movie.vote_average || null,
      runtime: movie.runtime || null,
      embedUrl: movie.imdb_id ? `https://vidsrc.xyz/embed/movie?imdb=${movie.imdb_id}` : null,
      // Cast and crew information
      cast: movie.credits?.cast?.slice(0, 10) || [],      // Get top 10 cast members
      crew: movie.credits?.crew?.filter(person => 
        ['Director', 'Writer', 'Producer', 'Executive Producer'].includes(person.job)
      ).slice(0, 10) || [],  // Get key crew members
      productionCompanies: movie.production_companies || []
    },
    chapters: null
  };
}

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
      firstAirDate: show.first_air_date || null,
      lastAirDate: show.last_air_date || null,
      voteAverage: show.vote_average || null,
      episodeRunTime: show.episode_run_time?.[0] || null,
      embedUrl: show.external_ids?.imdb_id ? 
        `https://vidsrc.xyz/embed/tv?imdb=${show.external_ids.imdb_id}&season=1&episode=1` : null,
      totalSeasons: show.number_of_seasons,
      // Cast and crew information
      cast: show.credits?.cast?.slice(0, 10) || [],      // Get top 10 cast members
      crew: show.credits?.crew?.filter(person => 
        ['Creator', 'Executive Producer', 'Producer', 'Director', 'Writer'].includes(person.job)
      ).slice(0, 10) || [],  // Get key crew members
      createdBy: show.created_by || [],
      networks: show.networks || [],
      productionCompanies: show.production_companies || []
    },
    chapters: null
  };
}

// Convert TMDB episode to our Video type
function episodeToVideo(episode: any, show: any): Video {
  const imdbId = show.external_ids?.imdb_id;
  const seasonNum = episode.season_number;
  const episodeNum = episode.episode_number;

  return {
    id: episode.id,
    sourceId: `${imdbId}-s${seasonNum}e${episodeNum}`,
    source: 'vidsrc',
    title: `${show.name} S${seasonNum}E${episodeNum} - ${episode.name}`,
    description: episode.overview || null,
    thumbnail: episode.still_path ? 
      `https://image.tmdb.org/t/p/w500${episode.still_path}` : 
      (show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null),
    metadata: {
      imdbId: imdbId,
      type: 'tv',
      tmdbId: show.id,
      airDate: episode.air_date || null,
      voteAverage: episode.vote_average || null,
      embedUrl: imdbId ? 
        `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&season=${seasonNum}&episode=${episodeNum}` : null,
      season: seasonNum,
      episode: episodeNum
    },
    chapters: null
  };
}

// Fetch latest movies from TMDB
export async function fetchLatestMovies(page: number = 1): Promise<Video[]> {
  const videos: Video[] = [];
  try {
    const nowPlaying = await tmdb.movieNowPlaying({ page });

    for (const movie of nowPlaying.results || []) {
      try {
        const movieDetails = await tmdb.movieInfo({
          id: movie.id,
          append_to_response: 'external_ids,credits,production_companies,networks'
        });

        if (movieDetails.imdb_id) {
          videos.push(movieToVideo(movieDetails));
        }
      } catch (error) {
        console.error(`Error fetching movie details for ${movie.title}:`, error);
      }
    }
  } catch (error) {
    console.error('TMDB Now Playing Movies Error:', error);
  }
  return videos;
}

// Search content using TMDB
export async function searchContent(query: string): Promise<Video[]> {
  const videos: Video[] = [];

  try {
    console.log('Searching TMDB for:', query);
    const results = await tmdb.searchMulti({ query });

    for (const result of results.results || []) {
      try {
        if (result.media_type === 'movie') {
          // Fetch complete movie details including IMDB ID
          const movieDetails = await tmdb.movieInfo({
            id: result.id,
            append_to_response: 'external_ids,credits,production_companies,networks'
          });

          if (movieDetails.imdb_id) {
            videos.push(movieToVideo(movieDetails));
          }
        } else if (result.media_type === 'tv') {
          // Fetch complete TV show details including external IDs
          const showDetails = await tmdb.tvInfo({
            id: result.id,
            append_to_response: 'external_ids,credits,production_companies,networks'
          });

          if (showDetails.name && showDetails.external_ids?.imdb_id) {
            videos.push(showToVideo(showDetails));
          }
        }
      } catch (error) {
        console.error(`Error fetching details for ${result.title || result.name}:`, error);
      }
    }

    console.log(`Found ${videos.length} results for query: ${query}`);
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
          append_to_response: 'external_ids,credits,production_companies,networks'
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
      append_to_response: 'external_ids,credits,production_companies,networks'
    });

    if (!showDetails.name || !showDetails.external_ids?.imdb_id) {
      console.error('Show details missing required data');
      return videos;
    }

    // If season number is provided, fetch only that season
    if (seasonNumber) {
      console.log(`Fetching season ${seasonNumber} for show ${showDetails.name}`);
      try {
        const season = await tmdb.seasonInfo({
          id: showId,
          season_number: seasonNumber,
          append_to_response: 'episodes'  // Make sure we get all episode details
        });

        console.log(`Retrieved ${season.episodes?.length || 0} episodes for season ${seasonNumber}`);
        
        // Fetch individual episode details for more complete information
        for (const episode of season.episodes || []) {
          try {
            // For each episode, get its full details including overview
            const episodeDetails = await tmdb.episodeInfo({
              id: showId,
              season_number: seasonNumber,
              episode_number: episode.episode_number
            });
            
            // Use the enhanced details
            videos.push(episodeToVideo(episodeDetails, showDetails));
          } catch (episodeError) {
            console.error(`Error fetching episode details for S${seasonNumber}E${episode.episode_number}:`, episodeError);
            // Fall back to the basic episode data
            videos.push(episodeToVideo(episode, showDetails));
          }
        }
      } catch (seasonError) {
        console.error(`Error fetching season ${seasonNumber}:`, seasonError);
      }
    } else {
      // Fetch all seasons
      console.log(`Fetching all seasons for show ${showDetails.name}`);
      const totalSeasons = showDetails.number_of_seasons || 1;
      console.log(`Show has ${totalSeasons} seasons in total`);
      
      for (let i = 1; i <= totalSeasons; i++) {
        try {
          console.log(`Fetching details for season ${i}...`);
          const season = await tmdb.seasonInfo({
            id: showId,
            season_number: i,
            append_to_response: 'episodes'  // Make sure we get all episode details
          });

          console.log(`Retrieved ${season.episodes?.length || 0} episodes for season ${i}`);
          
          if (season.episodes && season.episodes.length > 0) {
            // For the first 5 episodes of each season, get detailed information
            // This is to avoid making too many API calls while still getting good data
            const episodesToFetchDetailed = season.episodes.slice(0, 5);
            const otherEpisodes = season.episodes.slice(5);
            
            // Fetch detailed info for the first few episodes
            for (const episode of episodesToFetchDetailed) {
              try {
                // Get full episode details for better descriptions
                const episodeDetails = await tmdb.episodeInfo({
                  id: showId,
                  season_number: i,
                  episode_number: episode.episode_number
                });
                
                // Use enhanced details
                videos.push(episodeToVideo(episodeDetails, showDetails));
              } catch (episodeError) {
                console.error(`Error fetching detailed info for S${i}E${episode.episode_number}:`, episodeError);
                // Fall back to basic data
                videos.push(episodeToVideo(episode, showDetails));
              }
            }
            
            // Use basic info for remaining episodes to save on API calls
            for (const episode of otherEpisodes) {
              videos.push(episodeToVideo(episode, showDetails));
            }
          }
        } catch (seasonError) {
          console.error(`Error fetching season ${i}:`, seasonError);
        }
      }
    }

    // Sort episodes by season and episode number
    videos.sort((a, b) => {
      const seasonA = a.metadata?.season || 0;
      const seasonB = b.metadata?.season || 0;
      if (seasonA !== seasonB) return seasonA - seasonB;
      return (a.metadata?.episode || 0) - (b.metadata?.episode || 0);
    });
  } catch (error) {
    console.error('TMDB TV Show Episodes Error:', error);
  }

  return videos;
}

// Fetch latest episodes
export async function fetchLatestEpisodes(): Promise<Video[]> {
  const videos: Video[] = [];

  try {
    const popular = await tmdb.tvPopular();
    console.log(`Fetching latest episodes from ${popular.results?.length || 0} popular shows`);

    // For each show, get the latest season and its episodes
    for (const show of popular.results?.slice(0, 5) || []) {
      try {
        const showDetails = await tmdb.tvInfo({
          id: show.id,
          append_to_response: 'external_ids,credits,production_companies,networks'
        });

        if (!showDetails.name || !showDetails.external_ids?.imdb_id) {
          console.log(`Skipping show ${show.name || show.id}: missing required data`);
          continue;
        }

        const latestSeason = showDetails.number_of_seasons || 1;
        console.log(`Fetching latest episodes from "${showDetails.name}" season ${latestSeason}`);
        
        try {
          const season = await tmdb.seasonInfo({
            id: show.id,
            season_number: latestSeason,
            append_to_response: 'episodes'
          });

          // Get the 3 most recent episodes
          const latestEpisodes = season.episodes?.slice(-3) || [];
          console.log(`Found ${latestEpisodes.length} recent episodes for ${showDetails.name}`);

          // Get detailed information for each episode
          for (const episode of latestEpisodes) {
            try {
              // Fetch detailed episode information for better descriptions
              const episodeDetails = await tmdb.episodeInfo({
                id: show.id,
                season_number: latestSeason,
                episode_number: episode.episode_number
              });
              
              // Use detailed episode information
              videos.push(episodeToVideo(episodeDetails, showDetails));
              console.log(`Added episode ${episodeDetails.name || 'Unknown'} from ${showDetails.name}`);
            } catch (episodeError) {
              console.error(`Error fetching episode details for ${showDetails.name} S${latestSeason}E${episode.episode_number}:`, episodeError);
              // Fall back to basic episode data
              videos.push(episodeToVideo(episode, showDetails));
            }
          }
        } catch (seasonError) {
          console.error(`Error fetching season ${latestSeason} for ${showDetails.name}:`, seasonError);
        }
      } catch (error) {
        console.error(`Error fetching show ${show.name || 'unknown'}:`, error);
      }
    }
  } catch (error) {
    console.error('TMDB Latest Episodes Error:', error);
  }

  return videos;
}

// Fetch trending content (movies and TV shows) for the day or week
export async function fetchTrending(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<Video[]> {
  const videos: Video[] = [];
  try {
    console.log(`Fetching trending content for the ${timeWindow}`);
    const trending = await tmdb.trending({
      media_type: 'all',
      time_window: timeWindow,
      page
    });

    for (const item of trending.results || []) {
      try {
        if (item.media_type === 'movie') {
          // Fetch complete movie details
          const movieDetails = await tmdb.movieInfo({
            id: item.id,
            append_to_response: 'external_ids,credits,production_companies,networks'
          });
          
          if (movieDetails.imdb_id) {
            videos.push(movieToVideo(movieDetails));
          }
        } else if (item.media_type === 'tv') {
          // Fetch complete TV show details
          const showDetails = await tmdb.tvInfo({
            id: item.id,
            append_to_response: 'external_ids,credits,production_companies,networks'
          });
          
          if (showDetails.name && showDetails.external_ids?.imdb_id) {
            videos.push(showToVideo(showDetails));
          }
        }
      } catch (error) {
        console.error(`Error fetching trending item details:`, error);
      }
    }
    
    console.log(`Found ${videos.length} trending items`);
  } catch (error) {
    console.error('TMDB Trending Error:', error);
  }

  return videos;
}

// Fetch all movie genres 
export async function fetchMovieGenres() {
  try {
    const genreData = await tmdb.genreMovieList();
    return genreData.genres || [];
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    return [];
  }
}

// Fetch all TV show genres
export async function fetchTVGenres() {
  try {
    const genreData = await tmdb.genreTvList();
    return genreData.genres || [];
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    return [];
  }
}

// Fetch movies by genre
export async function fetchMoviesByGenre(genreId: number, page: number = 1): Promise<Video[]> {
  const videos: Video[] = [];
  
  try {
    console.log(`Fetching movies for genre ID: ${genreId}`);
    const discovered = await tmdb.discoverMovie({
      with_genres: genreId.toString(),
      page
    });
    
    // Process first 10 results to avoid too many API calls
    for (const movie of discovered.results?.slice(0, 10) || []) {
      try {
        const movieDetails = await tmdb.movieInfo({
          id: movie.id,
          append_to_response: 'external_ids,credits,production_companies,networks'
        });
        
        if (movieDetails.imdb_id) {
          videos.push(movieToVideo(movieDetails));
        }
      } catch (error) {
        console.error(`Error fetching movie details for genre:`, error);
      }
    }
    
    console.log(`Found ${videos.length} movies for genre ID: ${genreId}`);
  } catch (error) {
    console.error(`Error fetching movies by genre (${genreId}):`, error);
  }
  
  return videos;
}

// Fetch TV shows by genre
export async function fetchTVShowsByGenre(genreId: number, page: number = 1): Promise<Video[]> {
  const videos: Video[] = [];
  
  try {
    console.log(`Fetching TV shows for genre ID: ${genreId}`);
    const discovered = await tmdb.discoverTv({
      with_genres: genreId.toString(),
      page
    });
    
    // Process first 10 results to avoid too many API calls
    for (const show of discovered.results?.slice(0, 10) || []) {
      try {
        const showDetails = await tmdb.tvInfo({
          id: show.id,
          append_to_response: 'external_ids,credits,production_companies,networks'
        });
        
        if (showDetails.name && showDetails.external_ids?.imdb_id) {
          videos.push(showToVideo(showDetails));
        }
      } catch (error) {
        console.error(`Error fetching TV show details for genre:`, error);
      }
    }
    
    console.log(`Found ${videos.length} TV shows for genre ID: ${genreId}`);
  } catch (error) {
    console.error(`Error fetching TV shows by genre (${genreId}):`, error);
  }
  
  return videos;
}