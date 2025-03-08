import type { Video } from "@shared/schema";
import { searchContent, fetchLatestMovies, fetchLatestTVShows, fetchLatestEpisodes } from './tmdb';

// Search VidSrc content using TMDB
export async function searchVidSrc(query: string): Promise<Video[]> {
  console.log('Searching VidSrc content:', query);
  const results = await searchContent(query);
  console.log(`Found ${results.length} results`);
  return results;
}

// Fetch latest movies from TMDB
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  console.log('Fetching latest movies, page:', page);
  return fetchLatestMovies();
}

// Fetch latest TV shows from TMDB
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  console.log('Fetching latest TV shows, page:', page);
  const shows = await fetchLatestTVShows();
  console.log('Retrieved TV shows:', shows.map(show => ({
    title: show.title,
    embedUrl: show.metadata?.embedUrl
  })));
  return shows;
}

// Fetch latest episodes
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  console.log('Fetching latest episodes, page:', page);
  const episodes = await fetchLatestEpisodes();
  console.log('Retrieved episodes:', episodes.map(episode => ({
    title: episode.title,
    embedUrl: episode.metadata?.embedUrl
  })));
  return episodes;
}