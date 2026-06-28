# UX Bible

## Purpose
Define the user experience principles and patterns for VERIQ.

---

## Core UX Principles

### 1. Minimal Friction
Every extra click is a failure. Every unnecessary field is a bug. If a user can do something in 3 steps, never make them do it in 4. Question every interaction: "Can this be simpler?"

### 2. Predictable Patterns
Users should be able to predict what happens next. Buttons look like buttons. Links look like links. Dragging behaves like dragging. We follow platform conventions so users don't have to learn new patterns.

### 3. Instant Feedback
Every action produces an immediate, clear response:
- Click a button → visual feedback within 50ms
- Send a message → appears in timeline within 200ms
- Action completes → confirmation within 1 second
- Action fails → error within 1 second with clear resolution

### 4. Accessible by Default
- All interactive elements reachable via keyboard
- All images have alt text
- All color combinations meet WCAG 2.1 AA contrast ratios
- All animations respect `prefers-reduced-motion`
- All forms have clear labels and error states

---

## UX Patterns

### Navigation
| Pattern | Behavior |
|---------|----------|
| Sidebar | Primary navigation. Modules listed vertically. Active state highlighted. |
| Top bar | Global actions: search, notifications, profile, settings. |
| Breadcrumbs | Present for 3+ levels deep. Clickable for quick navigation. |
| Command palette | Cmd/Ctrl + K opens global search and command palette. |

### Inbox (Core Screen)
| Element | Behavior |
|---------|----------|
| Left panel | Channel list with unread counts. Channel selection filters inbox. |
| Center panel | Conversation list. Sorted by most recent message. Unread conversations highlighted. |
| Right panel | Active conversation. Messages in chronological timeline. |
| Compose | Reply box at bottom of active conversation. Supports text, emoji, attachments. |
| AI suggestion | Appears as editable draft above reply box. User can send, edit, or dismiss. |

### Forms
| Pattern | Guideline |
|---------|-----------|
| Labels | Always visible. Never placeholder-only. |
| Validation | Inline validation on blur. Never on every keystroke. |
| Errors | Clear error message below the field. Red border on field. |
| Submit | Disabled until required fields are valid. Loading state on submit. |

### Empty States
Every empty state should:
1. Show a clear illustration
2. Explain what belongs here
3. Provide a single, obvious action to add content
4. Never show raw "No data" or empty table

### Loading States
| Duration | Treatment |
|----------|-----------|
| < 100ms | No feedback needed |
| 100ms — 1s | Skeleton screen (preferred) or spinner |
| 1s — 5s | Skeleton screen + progress indicator |
| > 5s | Loading state + option to cancel or background notification |

---

## Microcopy Guidelines

| Context | Tone | Example |
|---------|------|---------|
| Success | Warm, celebratory | "You're all set! Your WhatsApp is connected." |
| Error | Helpful, not blaming | "Something went wrong. Try again or contact support." |
| Empty state | Encouraging, actionable | "No messages yet. Share your chat widget to get started." |
| AI suggestion | Confident, optional | "Reply: 'Yes, we have availability on Tuesday.' — Edit or Send" |
| Confirmation | Clear, specific | "Delete 3 conversations? This cannot be undone." |
