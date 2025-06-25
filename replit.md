# StreamerVerse - Personal Streaming Application

## Overview
A React-based streaming web application that provides access to movies and TV shows through VidSrc integration. Built with modern web technologies including React, TypeScript, and Tailwind CSS.

## User Preferences
- **Priority**: Get streaming functionality working first, then tackle ad blocking
- **Browser Support**: Must work consistently in both Chrome and Firefox
- **Communication Style**: Direct, action-focused communication without repetitive phrases

## Recent Changes
- **June 25, 2025**: FIXED: Removed CSP directive that was blocking VidSrc iframes
- **June 25, 2025**: Enhanced Edge browser detection (separate from Chrome)
- **June 25, 2025**: Reduced Chromium timeout to 300ms for faster loading
- **June 25, 2025**: Added comprehensive iframe detection methods for Chromium browsers

## Current Issues
- **Ad Blocking**: Popups and ads still appearing despite current blocking scripts
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