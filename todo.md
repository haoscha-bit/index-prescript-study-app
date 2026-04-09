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
