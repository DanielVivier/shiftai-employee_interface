# ShiftAI v1 — Design Specification

This is the canonical design reference for ShiftAI v1. All frontend work should follow these specifications.

---

## Visual Identity

**Theme:** Dark only. No light mode. No system preference toggle.

**Palette (Nord-inspired):**

| Token | Hex | Use |
|-------|-----|-----|
| `--bg-0` | `#1a1d21` | Page background |
| `--bg-1` | `#21252b` | Panel background, cards |
| `--bg-2` | `#282c34` | Surfaces, inputs, bubbles |
| `--bg-3` | `#2e3340` | Hover states |
| `--border` | `#3b4048` | Borders |
| `--text-primary` | `#e8eaf0` | Main text |
| `--text-secondary` | `#8b92a1` | Supporting text |
| `--text-muted` | `#5c6370` | Labels, placeholders |
| `--accent` | `#5e81ac` | Primary action color (Nord blue) |
| `--accent-hover` | `#81a1c1` | Hover state |
| `--success` | `#a3be8c` | Online indicator, success states |
| `--error` | `#bf616a` | Error states |

**Avatar palette (8 colors, deterministic from employee.id hash):**
`#5E81AC`, `#88C0D0`, `#EBCB8B`, `#A3BE8C`, `#BF616A`, `#D08770`, `#B48EAD`, `#81A1C1`

---

## Typography

- **Font:** System sans-serif stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Base size:** 14px
- **Line height:** 1.5
- **Headings:** 16–22px, weight 600–700
- **Supporting text:** 12–13px, `--text-secondary`
- **Code/mono:** `SF Mono`, `Fira Code`, Menlo

---

## Layout

### Viewport requirement
**Desktop only. 1024px minimum.** On smaller viewports, a full-screen overlay replaces the UI with a "please use desktop browser" message. This is enforced in CSS via `@media (max-width: 1023px)`.

### Home screen
- Fixed top bar (56px) with logo + subtitle
- Employee grid: `repeat(auto-fill, minmax(280px, 1fr))`, 1.25rem gap
- Max-width 1200px, centered

### Employee view (3-panel)
- **Grid:** `240px 1fr 220px` (fixed columns)
- **Height:** 100vh, overflow hidden
- Identity panel (left): 240px, scrollable
- Chat panel (center): flex column, messages scroll, input fixed at bottom
- Quick actions panel (right): 220px, scrollable

---

## Components

### Employee card (home screen)
- Dark surface (`--bg-1`), 1px border
- Hover: border color changes to `--accent`, background to `--bg-2`
- 48px circular avatar (colored initials)
- Name, role, department in stacked text
- Arrow indicator, animates to accent color on hover

### Avatar
- Circle with 2-letter initials
- Color = deterministic hash of `employee.id` into the 8-color palette
- Sizes: 32px (chat), 48px (card), 80px (identity panel)

### Chat messages
- User messages: right-aligned, accent background, no avatar
- Assistant messages: left-aligned, `--bg-2` background, 1px border, avatar
- Typing indicator: 3 animated dots in a bubble
- Max-width: 75% of panel width

### Quick actions
- Stacked button list in right panel
- Tap sends a pre-configured prompt as if the user typed it
- Buttons disabled while a response is streaming

### Input
- Controlled text input with send button
- Disabled state while loading
- Focus ring: `--accent` border

---

## Spacing system
- `--radius-sm`: 6px (inputs, buttons)
- `--radius-md`: 10px (cards, bubbles)
- `--radius-lg`: 16px (modal-scale containers like login card)
- Base unit: 4px. Use 4, 6, 8, 12, 16, 20, 24, 32, 48px increments.

---

## Interaction states

| State | Visual |
|-------|--------|
| Hover (interactive) | border → `--accent`, bg → next-darker bg level |
| Focus | `--accent` border outline |
| Disabled | 40–50% opacity, `cursor: not-allowed` |
| Loading | Spinner or disabled state; typing indicator in chat |
| Error | `--error` color text below the affected element |

---

## What NOT to add (v1 scope)
- Light mode
- Mobile layout (v2 — requires full redesign)
- Conversation history browser
- Multi-language support
- Custom themes per client
- Markdown rendering in chat (deferred — adds complexity, low v1 priority)
