# UI Bible

## Purpose
Define the visual interface principles and component usage for VERIQ.

---

## UI Principles

### 1. Visual Hierarchy
Every screen has a clear focal point. The most important element is the most visually prominent. Secondary actions are de-emphasized. Destructive actions are distinct.

### 2. Consistent Spacing
Spacing follows an 8px grid system. All margins, paddings, and gaps are multiples of 8px (8, 16, 24, 32, 48, 64). This creates visual rhythm and predictability.

### 3. Focused Layouts
Each screen serves one primary purpose. Side panels and modals handle secondary tasks. Never cram multiple primary actions on one screen.

### 4. Informed Defaults
Settings come with smart defaults. A new user's workspace is immediately usable. Configuration is optional, not required.

---

## Component Usage

### Buttons

| Variant | Usage | Priority |
|---------|-------|----------|
| Primary | Main action on screen | One per view |
| Secondary | Alternative action | Multiple allowed |
| Tertiary / Ghost | Low-emphasis action | Navigation, dismiss |
| Destructive | Irreversible actions | Red text, warning |
| Icon-only | Familiar actions (close, search, settings) | With tooltip |

### Inputs

| Type | Usage |
|------|-------|
| Text Input | Single-line text entry |
| Textarea | Multi-line text (messages, descriptions) |
| Select | 5+ options, or options with categories |
| Combo Box | Searchable select with custom entry |
| Toggle | Binary settings (on/off) |
| Radio | 2-5 mutually exclusive options |
| Checkbox | Multiple selection from a group |
| Date Picker | Date and date-range selection |

### Cards

| Type | Usage | Elevation |
|------|-------|-----------|
| Default | Content containers in lists | 1 |
| Interactive | Clickable cards | 1 (hover: 2) |
| Highlighted | Featured or important content | 2 |

### Modals

| Type | Usage | Width | Close |
|------|-------|-------|-------|
| Alert | Confirmation, warning | 400px | Must action |
| Dialog | Forms, details | 600px | X + Escape |
| Side Panel | Extended content | 480px | X + Escape + click outside |

### Lists

| Type | Usage |
|------|-------|
| Simple List | Text-only items (channels, contacts) |
| Complex List | Items with avatars, status, metadata (conversations) |
| Data Table | Structured data with sortable columns (reports) |

---

## Spacing Rules

| Token | Value | Usage |
|-------|-------|-------|
| space-xs | 4px | Tiny gaps between related elements |
| space-sm | 8px | Tight padding, icon spacing |
| space-md | 16px | Standard padding, card gaps |
| space-lg | 24px | Section padding, modal padding |
| space-xl | 32px | Large section separation |
| space-2xl | 48px | Page sections |
| space-3xl | 64px | Major layout breaks |

### Layout Widths
| Container | Max Width | Usage |
|-----------|-----------|-------|
| Narrow | 640px | Forms, settings, reading content |
| Medium | 960px | Detail views, profiles |
| Wide | 1280px | Inbox, dashboards, tables |
| Full | 100% | Immersive views |

---

## Animation Guidelines

| Duration | Context |
|----------|---------|
| 150ms | Micro-interactions (hover, click feedback) |
| 200ms | UI transitions (panels, modals opening) |
| 300ms | Page transitions, element appear/disappear |
| 500ms | Emphasis animations (celebrations, alerts) |

**Easing:** Use `cubic-bezier(0.16, 1, 0.3, 1)` for enter animations and `cubic-bezier(0.4, 0, 1, 1)` for exit animations.
