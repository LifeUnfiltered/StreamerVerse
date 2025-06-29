# StreamerVerse - Personal Streaming Application

## Overview
A React-based streaming web application that provides access to movies and TV shows through VidSrc integration. Built with modern web technologies including React, TypeScript, and Tailwind CSS.

## User Preferences
- **Priority**: Comprehensive ad blocking implemented, focus on browser compatibility
- **Browser Support**: Must work consistently in both Chrome and Firefox
- **Communication Style**: Direct, action-focused communication without repetitive phrases

## Recent Changes
- **June 29, 2025**: SUCCESS: Nuclear popup blocking completely eliminates all VidSrc ads/popups
- **June 29, 2025**: FIXED: Video card hover effect now covers entire card (removed rounded corners issue)
- **June 29, 2025**: FIXED: YouTube cards show proper metadata (channel, N/A for unavailable data) instead of dummy stats
- **June 29, 2025**: FIXED: VidSrc cards now show proper metadata (year, ratings) instead of YouTube stats

## Current Issues
- **Chrome Compatibility**: VidSrc videos need additional browser-specific fixes
- **Authentication**: User auth features currently disabled

## Project Architecture
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js server for API endpoints
- **Styling**: Tailwind CSS with shadcn/ui components
- **Video Sources**: VidSrc domain cycling system for reliability
- **Database**: PostgreSQL with Drizzle ORM for user data

## Technical Decisions
- Domain cycling approach for VidSrc reliability
- Browser-specific iframe loading detection
- Comprehensive sandbox permissions for video playback
- Aggressive ad blocking through multiple script layers