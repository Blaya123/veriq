# Design Tokens

## Purpose
The atomic values that define VERIQ's visual language.

---

## Colors

### Brand
| Token | Value | Usage |
|-------|-------|-------|
| color-brand-50 | #EEF2FF | Brand backgrounds, very light |
| color-brand-100 | #E0E7FF | Hover backgrounds, light |
| color-brand-200 | #C7D2FE | Selected backgrounds |
| color-brand-300 | #A5B4FC | Borders, decorative elements |
| color-brand-400 | #818CF8 | Active states, pressed |
| color-brand-500 | #6366F1 | Primary brand color |
| color-brand-600 | #4F46E5 | Buttons, links (primary) |
| color-brand-700 | #4338CA | Hover states |
| color-brand-800 | #3730A3 | Active text |
| color-brand-900 | #312E81 | Heavy emphasis |

### Neutral
| Token | Value | Usage |
|-------|-------|-------|
| color-neutral-50 | #F8FAFC | Page background |
| color-neutral-100 | #F1F5F9 | Card background, sidebar |
| color-neutral-200 | #E2E8F0 | Borders, dividers |
| color-neutral-300 | #CBD5E1 | Disabled elements |
| color-neutral-400 | #94A3B8 | Placeholder text, secondary icons |
| color-neutral-500 | #64748B | Secondary text |
| color-neutral-600 | #475569 | Muted body text |
| color-neutral-700 | #334155 | Body text |
| color-neutral-800 | #1E293B | Headings |
| color-neutral-900 | #0F172A | Primary text |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| color-success-50 | #F0FDF4 | Success background |
| color-success-500 | #10B981 | Success icon, badge |
| color-success-700 | #047857 | Success text |
| color-warning-50 | #FFFBEB | Warning background |
| color-warning-500 | #F59E0B | Warning icon, badge |
| color-warning-700 | #B45309 | Warning text |
| color-error-50 | #FEF2F2 | Error background |
| color-error-500 | #EF4444 | Error icon, badge |
| color-error-700 | #B91C1C | Error text |
| color-info-50 | #EFF6FF | Info background |
| color-info-500 | #3B82F6 | Info icon, badge |
| color-info-700 | #1D4ED8 | Info text |

---

## Typography

### Font Families
| Token | Value | Usage |
|-------|-------|-------|
| font-family-sans | 'Inter', system-ui, -apple-system, sans-serif | UI text |
| font-family-mono | 'JetBrains Mono', 'Fira Code', monospace | Code, numbers |

### Font Sizes
| Token | Value | Line Height | Usage |
|-------|-------|-------------|-------|
| font-xs | 0.75rem (12px) | 1rem (16px) | Captions, metadata |
| font-sm | 0.875rem (14px) | 1.25rem (20px) | Secondary text |
| font-base | 1rem (16px) | 1.5rem (24px) | Body text |
| font-lg | 1.125rem (18px) | 1.75rem (28px) | Large body |
| font-xl | 1.25rem (20px) | 1.75rem (28px) | Subheadings |
| font-2xl | 1.5rem (24px) | 2rem (32px) | Section headings |
| font-3xl | 1.875rem (30px) | 2.25rem (36px) | Page headings |
| font-4xl | 2.25rem (36px) | 2.5rem (40px) | Display headings |
| font-5xl | 3rem (48px) | 1.1 | Hero text |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| font-normal | 400 | Body text |
| font-medium | 500 | Emphasized text |
| font-semibold | 600 | Subheadings, buttons |
| font-bold | 700 | Headings |

---

## Spacing
| Token | Value | Rem |
|-------|-------|-----|
| space-0 | 0px | 0 |
| space-1 | 4px | 0.25 |
| space-2 | 8px | 0.5 |
| space-3 | 12px | 0.75 |
| space-4 | 16px | 1 |
| space-5 | 20px | 1.25 |
| space-6 | 24px | 1.5 |
| space-7 | 28px | 1.75 |
| space-8 | 32px | 2 |
| space-9 | 36px | 2.25 |
| space-10 | 40px | 2.5 |
| space-12 | 48px | 3 |
| space-16 | 64px | 4 |
| space-20 | 80px | 5 |
| space-24 | 96px | 6 |

---

## Shadows
| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Card default |
| shadow-base | 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) | Elevated cards |
| shadow-md | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | Dropdowns, popovers |
| shadow-lg | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) | Modals |
| shadow-xl | 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) | Side panels |
| shadow-2xl | 0 25px 50px -12px rgb(0 0 0 / 0.25) | Notification toasts |

---

## Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Inputs, small components |
| radius-md | 6px | Buttons, cards |
| radius-lg | 8px | Modals, panels |
| radius-xl | 12px | Large containers |
| radius-2xl | 16px | Page-level containers |
| radius-full | 9999px | Avatars, badges, pills |

---

## Breakpoints
| Token | Width | Device |
|-------|-------|--------|
| bp-sm | 640px | Mobile landscape |
| bp-md | 768px | Tablet |
| bp-lg | 1024px | Desktop |
| bp-xl | 1280px | Wide desktop |
| bp-2xl | 1536px | Ultra-wide |
