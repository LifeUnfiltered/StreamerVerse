# StreamerVerse - Personal Streaming Application

## Overview
A React-based streaming web application that provides access to movies and TV shows through VidSrc integration. Built with modern web technologies including React, TypeScript, and Tailwind CSS.

## User Preferences
- **Priority**: Comprehensive ad blocking implemented, focus on browser compatibility
- **Browser Support**: Must work consistently in both Chrome and Firefox
- **Communication Style**: Direct, action-focused communication without repetitive phrases

## Recent Changes
- **June 29, 2025**: FIXED: VidSrc cards now show proper metadata (year, ratings) instead of YouTube stats
- **June 29, 2025**: Enhanced popup blocking with MutationObserver and Chrome-specific fixes
- **June 29, 2025**: Added iframe security attributes for better Chrome/Edge compatibility
- **June 29, 2025**: Cleaned up JavaScript redeclaration errors in popup blocking code

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