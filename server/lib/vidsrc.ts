import type { Video } from "@shared/schema";
import { searchContent, fetchLatestMovies, fetchLatestTVShows } from './tmdb';

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

// Fetch latest episodes (using latest TV shows)
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  console.log('Fetching latest episodes (using TV shows), page:', page);
  return fetchLatestTVShows(); // For now, return the same TV shows
}