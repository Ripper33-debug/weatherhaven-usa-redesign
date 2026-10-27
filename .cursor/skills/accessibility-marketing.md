# Accessibility: Marketing & Platform

## When to use

Use this skill when adding UI components, motion effects, forms, overlays, or navigation — especially on marketing pages where cinematic effects can conflict with accessibility.

## Existing accessibility features

| Feature | Location |
|---------|----------|
| Skip to main content | `src/components/navigation/SkipToContent.tsx` → `#main-content` |
| Main landmark | `SiteChrome.tsx` wraps content with `id="main-content"` |
| Reduced motion | `src/lib/effects/media.ts` → `prefersReducedMotion()`, `effectsEnabled()` |
| Accordion ARIA | `MissionSolutionBuilder.tsx` — `aria-expanded` |
| Filter bar ARIA | `ProductFilterBar.tsx` — `aria-expanded` |
| Map controls ARIA | `TacticalMapClient.tsx` — mobile panel `aria-expanded` |
| Form labels | Contact, request access, login forms use associated labels |
| Email plain text | Multipart emails in `shield-email-text.ts` |
| Loading skeletons | `aria-hidden` on decorative loading states |

## Motion & effects policy

```typescript
// src/lib/effects/media.ts
prefersReducedMotion()  // OS setting
effectsEnabled()        // !reducedMotion && !mobileViewport
```

When reduced motion is active:

- Skip platform boot screen (`InitialLoadScreen.tsx`)
- Disable magnetic buttons and card tilt (`dom-enhancements.ts`)
- Disable custom cursor (`SiteEnhancements.tsx`)
- Use simpler page transitions (`PageTransition.tsx`)

**Marketing pages** never get DOM enhancements regardless of motion preference (separate gate in `dom-enhancements.ts`).

## Key files

- `src/components/navigation/SkipToContent.tsx`
- `src/components/site/SiteChrome.tsx`
- `src/lib/effects/media.ts`
- `src/lib/effects/dom-enhancements.ts`
- `src/components/effects/InitialLoadScreen.tsx`
- `src/components/PageTransition.tsx`
- `src/components/CustomCursor.tsx`
- `src/components/site/SiteEnhancements.tsx`

## Custom cursor considerations

- Hidden on marketing, light portal, and map routes
- Pointer-based — no keyboard equivalent (acceptable because it's decorative)
- Must not be the only way to indicate interactivity

## Form accessibility checklist

- [ ] Every input has a visible `<label>` or `aria-label`
- [ ] Error messages linked via `aria-describedby` or announced near field
- [ ] Submit button disabled state communicated (not color-only)
- [ ] Focus visible on all interactive elements (Tailwind `focus:` styles)
- [ ] CSRF failures show user-readable error, not silent failure

## Overlay & modal checklist

- [ ] Focus trap or return focus on close (compare overlay, map context menu)
- [ ] Escape key closes dismissible overlays where appropriate
- [ ] `aria-modal="true"` and `role="dialog"` for true modals
- [ ] Background scroll locked intentionally (compare overlay pattern)
- [ ] Decorative layers marked `aria-hidden`

## Accordion / disclosure pattern

Follow `MissionSolutionBuilder.tsx`:

```tsx
<button
  type="button"
  aria-expanded={open}
  aria-controls={`panel-${id}`}
  onClick={() => setOpen(!open)}
>
  …
</button>
<div id={`panel-${id}`} hidden={!open}>…</div>
```

## Color & contrast

- Shield marketing uses dark bg (`#080a0c`) with light text — maintain WCAG AA contrast for body text and CTAs
- Muted text (`#8a9099`) is for secondary info only, not critical actions
- Do not rely on color alone for status (admin tables use text labels)

## Video & 3D

- Hero video: provide poster image as fallback
- Three.js panel: mobile gets `InteractiveShelterVisual` (non-WebGL) fallback
- Loading states use `aria-hidden` skeletons — ensure meaningful content follows
- Respect reduced motion for autoplay animations

## Testing checklist

- [ ] Tab through page — logical focus order, visible focus ring
- [ ] Skip link appears on first Tab, jumps to `#main-content`
- [ ] Test with `prefers-reduced-motion: reduce` in DevTools
- [ ] Test at 320px width — no horizontal scroll, touch targets ≥ 44px where possible
- [ ] Screen reader: form labels, button names, heading hierarchy (h1 → h2)
- [ ] Compare overlay / map menu: keyboard operable or documented limitation

## Invariants (do not break)

1. `#main-content` landmark must exist on every page layout.
2. Skip link must remain first focusable element in tab order.
3. New motion effects must check `effectsEnabled()` or `prefersReducedMotion()`.
4. Decorative 3D/video/animation containers use `aria-hidden` when no semantic content.
5. Do not remove focus outlines without replacement visible focus styles.

## Common mistakes

- Adding magnetic/tilt effects without reduced-motion guard
- Icon-only buttons without `aria-label`
- Compare overlay that traps focus permanently
- Using `div` click handlers instead of `<button>` for actions
- Autoplay video without poster or reduced-motion fallback
- Custom cursor breaking focus visibility on platform pages

## Future improvements (not yet implemented)

- Centralized focus trap hook for overlays
- `aria-live` regions for form submit success/error toasts
- Systematic heading audit across marketing pages
- JSON-LD / semantic HTML for product pages

When implementing these, extend this skill rather than creating parallel a11y docs.
