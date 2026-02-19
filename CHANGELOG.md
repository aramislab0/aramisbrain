# Changelog

## [0.2.0] - 2026-02-19

### Added — ORACLE v0.2

#### Features
- 🔮 Oracle Page UI (`/oracle`)
- 📊 Weekly trajectories generator (3 strategic options)
- 💭 Strategic questions generator (non-directive)
- 📝 Weekly narrative summary generator
- 🎨 Silent Command design (black + gold, no red alerts)

#### Technical
- 3 new Supabase tables (`oracle_trajectories`, `oracle_questions`, `oracle_weekly_summaries`)
- 3 new API routes (`/api/oracle/*`)
- Unit tests with Vitest (16 tests, 3 suites)
- Responsive design (mobile-first)
- ARIA accessibility (tablist, aria-expanded, landmarks)
- CSS animations (fadeInUp, shimmer skeletons)
- Error handling with retry UI
- Loading skeleton states

#### Philosophy
- No scoring system
- No judgmental language
- Calm, accompanying tone throughout
- CEO agency preserved

### Changed
- Navigation updated with Oracle link
- Silent Command design enforced strictly

### Fixed
- CamelCase/snake_case mapping Oracle APIs
- Mobile responsive trajectory tabs
- Loading states UX

## [0.1.0] - 2026-02-17

### Added — ARAMIS BRAIN Core
- Projects dashboard
- Decisions journal
- Risks radar
- Events timeline
- Playbooks CRUD
- AI Chat interface
- Focus daily priorities
