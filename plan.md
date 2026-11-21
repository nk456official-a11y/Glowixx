# Glowix — plan

## Implementation
Glowix is a mobile-first React/TypeScript social video app in the existing web-db-user starter. The initial experience is a polished client-side prototype with localStorage-backed demo state for login, profile customization, fire-counter customization, messages, and uploaded video metadata; the server/database foundation remains enabled for connecting durable auth, storage and media indexes next. The shell uses a vertical-video feed with desktop side rail and bottom navigation on mobile.

## Project structure
- `client/src/pages/Home.tsx`: app shell, feed, profile, chats, settings and modal interactions.
- `client/src/index.css`: visual system and responsive layout.
- `client/src/App.tsx`: route entry.
- `drizzle/schema.ts`, `server/routers.ts`: prepared backend extension points.
- `public/manus-routes.json`: declared page routes.

## Design
### Distinct styles considered
- Cyber-lounge editorial: 0.06
- Soft neon social club: 0.71
- Playful gradient arcade: 0.08

### Chosen direction: Soft neon social club
**Design movement:** premium mobile social UI with editorial typography, tactile cards and restrained neon accents.

**Core principles:** dark cinematic canvas; warm coral energy against cool lavender; content-first, not dashboard-like; every interaction feels like a small ritual.

**Color philosophy:** near-black plum gives video and imagery a stage; coral-orange is Glowix's ownable signal for action and the fire counter; pale lavender and mint make secondary information feel calm rather than noisy.

**Layout paradigm:** a narrow content spine with a persistent navigation rail on desktop and bottom dock on mobile; oversized feed cards with floating context controls instead of rigid grids.

**Signature elements:** glowing fire-pill counter; rounded 28px surfaces with thin translucent borders; tiny uppercase metadata labels paired with bold editorial display headlines.

**Interaction philosophy:** quick, tactile controls, optimistic microcopy, optimistic local state, and clear active states. Upload, save and customize should feel immediate.

**Animation:** use subtle lift and scale on hover/tap, shimmer only on the fire counter and active navigation, and smooth modal transitions. Avoid constant motion behind video content.

**Typography system:** `Plus Jakarta Sans` for UI and metadata, `DM Serif Display` for major editorial moments. Strong numeric counters, compact labels and relaxed line-height.

**Brand essence:** Glowix is a warm, expressive place to share short videos and keep your people close. Personality: intimate, glowing, confident.

**Brand voice:** direct, kind, slightly editorial. Examples: “Your corner of the internet, lit up.” and “Keep the streak warm.”

**Wordmark & logo:** lowercase `glowix` wordmark with a small four-ray spark replacing the dot above the i; the prototype renders this as a typographic mark plus spark icon.

**Signature brand color:** ember coral `#ff6b4a`.
