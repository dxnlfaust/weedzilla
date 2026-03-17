# WeedZilla — Feature Update Spec

## Overview

This document specifies a set of feature changes to the existing WeedZilla app. The app is a Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase stack deployed on Vercel. Phases 1–3 are complete and live.

These changes touch the database schema, upload flow, voting system, competition model, homepage, winners page, species page, and mobile navigation. Read this entire document before starting work.

---

## Change 1: Before & After Post Type

### Summary
Users can now upload a second post type: "Before & After" (B&A). These posts contain two images (before and after a site clearing) displayed with a swipe/slider interaction. B&A posts have their own weekly competition separate from weed posts.

### Database Changes
- Add `post_type` column to `posts` table: `TEXT NOT NULL DEFAULT 'weed' CHECK (post_type IN ('weed', 'before_after'))`
- Add `image_url_after` column to `posts` table: `TEXT` (nullable — only populated for B&A posts)
- For B&A posts, the existing `image_url` field stores the "before" image. `image_url_after` stores the "after" image.
- Make `species_id` nullable on the `posts` table. Weed posts still require a species tag. B&A posts can optionally have a species tag OR a free-text site description.
- Add `site_description` column to `posts` table: `TEXT` (nullable — only used for B&A posts that don't tag a species)
- Validation rule: Weed posts MUST have `species_id`. B&A posts MUST have either `species_id` OR `site_description` (at least one, can have both).
- Add a `view_count` column to `posts` table: `INTEGER NOT NULL DEFAULT 0`. This tracks how many times a post's detail page has been viewed. Used for tiebreaking (see Change 3).

Update RLS policies as needed to account for the new columns.

### Upload Flow Changes

The current upload page needs to be restructured.

**Step 1: Post type selection (triggered from mobile nav, see Change 6)**
The user arrives at the upload page with a query param indicating the type: `/upload?type=weed` or `/upload?type=before_after`. The upload form adapts based on this param.

**Weed upload form (existing, minor changes):**
- Image file input (single image, as it works now)
- Species search combobox (required)
- Caption (optional, max 280 chars)
- Submit button

**B&A upload form (new):**
- Two separate file inputs, clearly labelled:
  - "Before" — with a label like "Before: Upload the original site photo"
  - "After" — with a label like "After: Upload the cleared/restored site photo"
- Once each image is selected, show a thumbnail preview next to/below the input so the user can confirm which is which before submitting.
- Species search combobox (optional) — label: "Tag a species (optional)"
- Site description text field (optional) — label: "Describe the site (optional)" — max 280 chars
- Client-side validation: at least one of species or site description must be provided. Show inline error if both are empty on submit.
- Caption (optional, max 280 chars)
- Submit button

**B&A image display component:**
Use a before/after slider — two images overlaid with a draggable vertical divider. The user drags left/right to reveal before vs after. Use `react-compare-slider` or build a lightweight custom version. On mobile, also support swipe gestures. The "Before" label should appear on the left side, "After" on the right.

This slider component is used everywhere a B&A post is displayed: post detail page, post cards (smaller version), winners page.

For PostCard thumbnails in grids, show the "after" image as the thumbnail by default (the result is more visually interesting). Show a small "B&A" badge in the corner of the card so users know they can tap to see the comparison. On the post detail page, show the full slider.

### Storage
B&A posts upload two images to Supabase Storage. Same path convention as existing: `post-images/{user_id}/{timestamp}-{nanoid}.{ext}`. Both images go in the same user folder.

---

## Change 2: Unified Weed of the Week Competition

### Summary
Replace the per-species weekly competition with a single unified "Weed of the Week" competition. The one weed post with the most votes by end of week wins. There is also a separate "B&A of the Week" competition for before & after posts.

Winners are awarded Gold (1st), Silver (2nd), and Bronze (3rd) for each category.

### Database Changes
- Restructure the `weekly_winners` table:
  - Add `post_type TEXT NOT NULL CHECK (post_type IN ('weed', 'before_after'))`
  - Add `place INTEGER NOT NULL CHECK (place IN (1, 2, 3))`
  - Change unique constraint to `UNIQUE(week_year, post_type, place)`
  - Remove any existing per-species unique constraints
  - Keep `vote_count` column

### Winner Calculation (Edge Function)
Update the existing weekly winner Edge Function. It should run Monday 00:05 AEST and for each `post_type`:
1. Query all posts of that type from the completed week, ordered by vote count descending.
2. **Tiebreaker: if two posts have the same vote count, the post with the FEWER `view_count` wins.** This rewards underdogs — a post that got the same number of votes with less exposure is arguably more impressive. If still tied after that, earlier `created_at` wins.
3. Take the top 3 and insert into `weekly_winners` with `place` 1, 2, 3.
4. Increment `crown_count` on the gold winner's profile (place 1 only).

### Crown System
- Only gold (1st place) winners earn a crown increment on their profile.
- The CrownBadge component stays as-is — it shows crown count next to the user's name.

---

## Change 3: Voting Changes

### Summary
Users can now vote (like) as many posts as they want. Remove the one-vote-per-species-per-week constraint.

### Database Changes
- Drop the `UNIQUE(user_id, species_id, week_year)` constraint from the `votes` table.
- Keep the `UNIQUE(user_id, post_id)` constraint — users still can't like the same post twice.
- The `species_id` column on the `votes` table is no longer needed for constraint purposes. It can be dropped or kept for analytics — use your judgment, but it's no longer functionally required.

### Vote UI
- The VoteButton (heart icon) works the same as now — tap to like, tap again to unlike. No changes to the component behavior, just the removal of the "move your vote" confirmation flow since users are no longer limited.
- Remove any UI messaging about "You've already voted for another post this week" or vote-moving confirmations.

### View Count Tracking
Add a mechanism to increment `view_count` on the `posts` table:
- When a user loads a post's detail page (`/post/[postId]`), fire a Supabase RPC or direct update to increment `view_count` by 1.
- This should NOT increment on the feed/grid view — only when someone taps through to the full post detail.
- To avoid abuse/inflation, consider a lightweight debounce: don't increment if the same user viewed the same post in the last hour. This can be done with a simple `post_views` table (`user_id, post_id, viewed_at`) and checking before incrementing, OR a simpler approach of just incrementing every time and accepting some inflation. Use the simpler approach for now — exact precision isn't critical since view_count is only a tiebreaker.
- Unauthenticated views should also count (use session or just always increment).

---

## Change 4: Homepage Changes

### Summary
Add filter toggles to the homepage feed.

### Implementation
At the top of the post feed, add two toggle groups:

**Left-aligned — Post type filter:**
```
[All] [Weeds] [Before & After]
```
Pill-style toggles. Active state: `bg-eucalypt text-white`. Inactive: `border border-grey-200 text-carbon`. Default: "All".

**Right-aligned — Sort order:**
```
[Top] [Newest]
```
Same pill styling. Default: "Top".

Both toggle groups should sit on one line on all screen sizes. If "Before & After" is too long on small screens, abbreviate to "B&A" at the `sm` breakpoint and below.

**Query logic:**
- "All" shows both post types. "Weeds" filters to `post_type = 'weed'`. "Before & After" filters to `post_type = 'before_after'`.
- "Top" sorts by vote count descending (current week only), then `created_at` descending.
- "Newest" sorts by `created_at` descending regardless of week.
- Use URL search params to persist filter state: `/?type=all&sort=top`. This way filters survive page refreshes and are shareable.

### Last Week's Winners Box
At the top of the homepage (above the filters), display a "Last Week's Winners" section showing the two gold winners side by side:
- Left: Weed of the Week winner (place 1, post_type weed)
- Right: B&A of the Week winner (place 1, post_type before_after)

Each winner card shows: thumbnail image, crown icon, species name or site description, winner's display name. Tapping navigates to the full post.

Layout: two cards in a row, evenly spaced, on all screen sizes. On very narrow mobile screens (<360px), stack vertically if needed but side-by-side should work for most phones.

If there is no winner for a category (e.g., no B&A posts existed that week), show only the one that exists. If no winners at all (first week), hide the section entirely.

---

## Change 5: Winners Page Changes

### Summary
The Winners page becomes a scrollable archive of weekly winners, showing Gold, Silver, and Bronze for each category.

### Implementation

**Category toggle at top of page:**
```
[Weed of the Week] [B&A of the Week]
```
Pill-style, same styling as homepage toggles. Default: "Weed of the Week".

**Content below the toggle:**
A vertically scrolling list of weeks, most recent first. Each week is a section with:

**Week header:**
```
Week 11, 2026 · [X] posts · [Y] total votes
```
Style: `text-sm text-grey-500 font-medium`, with a subtle bottom border or divider below. The post count and vote count should be for that post_type in that week.

**Winner cards below the header:**

Gold card: full width on mobile, prominent. Show the post image large, crown icon (gold colored), winner's display name, species name (italic) or site description, vote count. For B&A posts, show the after image as the card thumbnail with the B&A badge.

Silver and Bronze cards: two columns below the gold card. Same info, smaller. Silver gets a silver-toned accent, bronze gets a bronze-toned accent. Keep this subtle — a small colored badge or icon tint, not a full card color change.

```
┌─────────────────────────┐
│  🥇  Gold Winner         │
│  [large image]           │
│  Species · Username · Xv │
└─────────────────────────┘
┌───────────┐ ┌───────────┐
│ 🥈 Silver  │ │ 🥉 Bronze  │
│ [image]    │ │ [image]    │
│ info       │ │ info       │
└───────────┘ └───────────┘

--- Week 10, 2026 · 12 posts · 34 total votes ---

┌─────────────────────────┐
│  🥇  Gold Winner         │
│  ...                     │
└─────────────────────────┘
... and so on
```

If a week had fewer than 3 posts for a category, show only as many winners as there were posts (e.g., if only 2 weed posts that week, show gold and silver only).

**Loading:** Load the most recent 4 weeks initially. Add a "Load more" button at the bottom to fetch older weeks. Don't use infinite scroll — explicit load-more is better for an archive page.

---

## Change 6: Mobile Navigation Changes

### Summary
Replace the current mobile navigation with a fixed bottom nav bar and simplify the top header.

### Bottom Navigation Bar (mobile only, hidden on `md` and above)
Fixed to bottom of screen. Background: `bg-eucalypt-dark` (same green as the header). Text/icons: white, with the active tab having a slightly brighter or highlighted state.

**Safe area:** Add `pb-[env(safe-area-inset-bottom)]` or equivalent to account for phones with home indicators (iPhone notch-era devices).

**Four tabs:**
| Icon | Label | Route | Lucide Icon |
|------|-------|-------|-------------|
| Home | Home | `/` | `Home` |
| Upload | Upload | (opens popover) | `Plus` or `PlusCircle` |
| Winners | Winners | `/winners` | `Crown` |
| Species | Species | `/species` | `Leaf` |

**Upload popover behavior:**
When the user taps the Upload ("+") icon in the bottom nav:
- A small popover/tooltip appears directly above the Upload icon.
- It contains two options side by side:
  - Left: "Weed" — tapping navigates to `/upload?type=weed`
  - Right: "Before & After" — tapping navigates to `/upload?type=before_after`
- Style: `bg-white rounded-lg shadow-lg border border-grey-200 p-2`. Each option is a tappable area with sufficient size (minimum 44px height). Text: `text-sm font-medium text-carbon`.
- Dismiss: tapping outside the popover, tapping the "+" icon again, or tapping either option (which navigates away).
- A small triangle/caret pointing down toward the Upload icon to visually anchor the popover.
- The popover should appear with a quick fade/scale animation (150ms).

**Active tab indicator:** The active tab should have `text-white` with full opacity. Inactive tabs should be `text-white/60` (60% opacity). No background highlight on active — just the opacity change.

**Hide on desktop:** The bottom nav only appears below the `md` breakpoint. On `md` and above, the existing top navigation handles everything. Make sure the upload popover logic still works on desktop via the top nav — either the same popover behavior on a top nav "Upload" button, or a simple dropdown.

### Top Header Changes (mobile)
- Remove the hamburger menu icon.
- Left: WeedZilla logo/wordmark.
- Right: User's avatar (circular, small — 32px). If not logged in, show a generic user icon or "Log in" text link.
- Tapping the avatar opens a dropdown menu with:
  - "Profile" → `/profile`
  - "About" → `/about`
  - "Log out" (if logged in) / "Log in" | "Sign up" (if logged out)
- Style the dropdown: `bg-white rounded-lg shadow-lg border border-grey-200`, appearing below the avatar, right-aligned.

### Desktop Navigation
On `md` and above, keep the top nav bar as the primary navigation. Add the same links that are in the mobile bottom nav (Home, Upload, Winners, Species) to the desktop top nav if not already present. The avatar dropdown should also exist on desktop.

### About Page
Create a new `/about` page. For now, placeholder content is fine — heading "About WeedZilla", a short paragraph explaining the app's purpose, and maybe a link to contact/feedback. This can be fleshed out later.

---

## Change 7: Species Page Enhancements

### Summary
Add post counts to species cards and a sorting toggle.

### Implementation

**Species cards:** Each species card in the grid should now display the number of posts tagged with that species. Show this as a small count below or beside the species name: e.g., "12 posts" in `text-sm text-grey-500`. This count should include both weed AND B&A posts tagged with that species.

Query this efficiently — either a materialized count on the species table (updated periodically), or a live count via a subquery/join. For a small-to-medium dataset, a live count in the query is fine. If performance becomes an issue later, add a `post_count` column and update it via trigger.

**Sorting toggle at top of page:**
```
[All] [Most Common]
```
Pill-style toggles, same styling as elsewhere. Default: "All" (alphabetical by scientific name). "Most Common" sorts by post count descending — species with the most posts appear first. This helps users discover which weeds the community is most actively targeting.

---

## General Notes

- **Maintain existing design system.** All new components should follow the existing color palette (eucalypt, red, carbon, white, grey, gold), Inter font, and the minimal/sleek style established in Phases 1–3.
- **Mobile-first.** Design and test all changes at mobile viewport first, then scale up.
- **Accessibility.** New interactive elements (popovers, sliders, toggles) need keyboard support and appropriate ARIA labels.
- **URL state.** Use search params for filter/toggle state where noted, so filters survive refreshes and are shareable.
- **Toasts for feedback.** Use the existing toast system for success/error messages on upload, voting, etc.
- **B&A badge accent color.** Use a muted blue or teal to differentiate from the green weed badge, so B&A posts are visually distinct in mixed feeds. Choose something that fits the existing palette.
- Review all existing pages and components for compatibility with the new `post_type` field. Any query that fetches posts needs to handle both types correctly.
