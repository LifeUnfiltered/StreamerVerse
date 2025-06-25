# StreamerVerse - Personal Streaming Application

## Overview
A React-based streaming web application that provides access to movies and TV shows through VidSrc integration. Built with modern web technologies including React, TypeScript, and Tailwind CSS.

## User Preferences
- **Priority**: Get streaming functionality working first, then tackle ad blocking
- **Browser Support**: Must work consistently in both Chrome and Firefox
- **Communication Style**: Direct, action-focused communication without repetitive phrases

## Recent Changes
- **June 25, 2025**: Reverted problematic CSS ad blocking that interfered with video display
- **June 25, 2025**: Simplified Chrome iframe loading detection to prevent timeouts
- **June 25, 2025**: Fixed navigation blocking script to allow legitimate navigation
- **June 25, 2025**: Reduced iframe loading timeouts for faster domain cycling

## Current Issues
- **Chrome Compatibility**: VidSrc videos work in Firefox but not Chrome due to stricter iframe policies
- **Ad Blocking**: Popups and ads still appearing despite current blocking scripts
- **Loading Detection**: Chrome requires different iframe load detection than Firefox

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