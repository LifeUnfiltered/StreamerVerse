import type { Video } from "@shared/schema";
import { searchContent, fetchLatestMovies, fetchLatestTVShows, fetchLatestEpisodes } from './tmdb';

// Search VidSrc content using TMDB
export async function searchVidSrc(query: string): Promise<Video[]> {
  return searchContent(query);
}

// Fetch latest movies from TMDB
export async function getLatestMovies(page: number = 1): Promise<Video[]> {
  return fetchLatestMovies();
}

// Fetch latest TV shows from TMDB
export async function getLatestTVShows(page: number = 1): Promise<Video[]> {
  return fetchLatestTVShows();
}

// Fetch latest episodes
export async function getLatestEpisodes(page: number = 1): Promise<Video[]> {
  return fetchLatestEpisodes();
}