# Project TODO

## Completed Features
- [x] Basic Index-themed study app with Prescript system
- [x] Prescript creation (Inscribe) with task pool management
- [x] Prescript assignment (Receive) with randomizer animation and audio
- [x] Focus timer with countdown and completion tracking
- [x] Dashboard with compliance metrics and weekly activity chart
- [x] Session history and archives
- [x] Index blue color theme (replacing gold)
- [x] Press Start 2P font for prescript reveals
- [x] Prescript randomizer and message audio playback
- [x] Timer bug fix (accurate countdown from chosen duration)
- [x] Glowing Index logo throughout app
- [x] Prescript beeper icon for Receive menu
- [x] DONSCREAM easter egg on navigation (1/2000 chance)
- [x] Removed all complex generated images (vault, seal, textures)
- [x] Full-stack upgrade with database and server
- [x] Email/password authentication (no OAuth, no 2FA, no email verification)
- [x] User account system with persistent data storage
- [x] Prescript pool synced across devices/sessions
- [x] Session management with JWT tokens
- [x] Comprehensive authentication tests (5 tests passing)
- [x] Separated authenticated and unauthenticated routes

## Current Status
✅ **MVP Complete** - The Index Prescript Study App is fully functional with:
- User authentication and account management
- Cross-device data persistence
- Full prescript workflow (create → receive → focus → track)
- Index-themed UI with audio and animations
- All tests passing

## Remaining (Optional Enhancements)
- [ ] Add completion sound effect (satisfying chime/seal-stamp)
- [ ] Bulk import prescripts from text file
- [ ] Prescript export/sharing feature
- [ ] Mobile app optimization
- [ ] Dark/light theme toggle
- [ ] Custom rank titles and thresholds

## Prescript Deck System
- [x] Add decks table to database schema (id, userId, name, createdAt)
- [x] Add deckId column to prescripts table
- [x] Create backend tRPC procedures for deck CRUD (create, rename, delete, list)
- [x] Update addPrescript procedure to accept optional deckId
- [x] Update Inscribe page with deck management UI (create, rename, delete decks)
- [x] Update Inscribe page to allow assigning prescripts to decks
- [x] Update Receive page with deck selector before drawing
- [x] Update PrescriptContext to support deck filtering
- [x] Add "All Prescripts" default option on Receive page
- [x] Test full deck flow end-to-end
- [x] Write vitest tests for deck procedures (8 tests passing)

## Bug Fixes
- [x] Fix deck dropdown overflow on Inscribe page — dropdown menu gets cut off for prescripts at bottom of page, making deck options unclickable

## Rank System Overhaul
- [x] Replace old rank system with 5-tier rank system with 3 subranks each
- [x] Ranks: Proselyte, Sighted Proselyte, Proxy, Messenger, Weaver (each with I, II, III subranks)
- [x] Rank thresholds: Proselyte I=0, II=50, III=100, Sighted Proselyte I=200, II=250, III=300, Proxy I=400, II=450, III=500, Messenger I=600, II=650, III=700, Weaver I=800, II=900, III=1000
- [x] Update rank display across all pages (sidebar, home, dashboard)

## Dashboard Rank Progress Indicator
- [x] Enhance rank progression section with detailed visual progress bar showing current rank, next rank, prescripts completed vs needed, and percentage

## Archive Display Bug Fix
- [x] Fix archive/history page to show prescript name (task name) for completed and deviated sessions
- [x] Fix archive/history page to show prescript duration for each session
- [x] Fix archive/history page to show prescript category for each session

## High Number Robustness (up to 100,000)
- [x] Ensure rank system handles 100,000+ prescripts without visual errors (Weaver III stays stable)
- [x] Ensure prescripts fulfilled count displays correctly for numbers up to 100,000 (toLocaleString formatting)
- [x] Ensure compliance rate calculation works correctly for very high numbers of completions and deviations

## Timer Pass/Fail Feature
- [x] Add "Pass" button to timer (premature completion) — shows Index logo with "_CleAr_" text in Press Start 2P font
- [x] Replace "Abandon" button with "Fail" button — shows Index logo with "_FaIL_" text in Press Start 2P font
- [x] Pass records completion as normal, Fail records deviation as normal
- [x] Match animation style from reference site (scramble text effect with Index logo)

## Sound Effects & UI Updates (Batch)
- [x] Play PrescriptMessage.mp3 during pass/fail animations until text fully generated
- [x] Fix Receive Prescript icon on Home page to use beeper image (not clock/timer)
- [x] Add Dice.mp3 sound for sidebar nav menu switches and home page nav buttons
- [x] Add Menuclick.mp3 for action buttons (begin compliance, pass, fail, reroll, resume, inscribe, etc.)
- [x] Add logout button that redirects to login page
