# StreamerVerse - Personal Streaming Application

## Overview
A React-based streaming web application that provides access to movies and TV shows through VidSrc integration. Built with modern web technologies including React, TypeScript, and Tailwind CSS.

## User Preferences
- **Priority**: Comprehensive ad blocking implemented, focus on browser compatibility
- **Browser Support**: Must work consistently in both Chrome and Firefox
- **Communication Style**: Direct, action-focused communication without repetitive phrases

## Recent Changes
- **June 29, 2025**: SUCCESS: Episode metadata display FULLY RESTORED - shows proper S1E1 formatting, episode titles, ratings, cast, all metadata
- **June 29, 2025**: FIXED: VideoPlayer component now properly formats TV episode titles with season/episode numbers
- **June 29, 2025**: FIXED: Removed ALL hardcoded dummy metadata ("1.2K views", "2h", "Premium") from video cards
- **June 29, 2025**: FIXED: Video card hover overlay now covers entire card area with proper overflow handling
- **June 29, 2025**: Enhanced video card UI with source-specific metadata display
- **June 29, 2025**: FIXED: JavaScript syntax errors in popup blocking script completely resolved

## Recent Ad-Blocking Enhancements
- **January 7, 2025**: MAJOR UPDATE: Implemented comprehensive 8-phase ad-blocking system
  - Phase 1: Complete window control with locked `window.open`
  - Phase 2: Enhanced navigation hijacking prevention with 30+ suspicious URL patterns
  - Phase 3: Advanced element manipulation blocking
  - Phase 4: Comprehensive on-click redirect blocking with rapid-click detection
  - Phase 5: Targeted ad destruction with DOM monitoring
  - Phase 6: Aggressive mutation observer for real-time ad removal
  - Phase 7: Iframe message interception to block cross-frame redirects
  - Phase 8: Anti-circumvention with blocked ad network globals

## Current Status
- **Ad-Blocking**: Comprehensive nuclear-level blocking implemented with multiple redundant layers
- **Season Navigation**: FIXED - All seasons now display episodes correctly
- **Chrome/Firefox Compatibility**: Enhanced cross-browser ad blocking support
- **Authentication**: User auth features currently disabled (by design)

## Working Features
- ✅ Episode metadata FULLY RESTORED - proper S1E1 formatting, episode titles, cast, ratings, descriptions
- ✅ VideoPlayer shows detailed episode information (not just show names)
- ✅ Video card hover effect covers full area
- ✅ Navigation/back button functionality restored
- ✅ VidSrc metadata displays properly (year, ratings)
- ✅ YouTube metadata shows channel names (no dummy data)
- ✅ Episode title caching and formatting system working perfectly
- ✅ Season/episode navigation and episode selection working

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