## Issue

The home page hero throws a React DOM validation error on every render:

```
Invalid DOM property `fetchpriority`. Did you mean `fetchPriority`?
```

Source: `src/routes/index.tsx:134` — the hero `<img>` spreads `{ fetchpriority: "high" }` (lowercase). React expects the camelCase `fetchPriority`. Because this throws during render on the first hero image, it can break hydration and leave the page in a bad state (blank/partial hero, other client interactivity broken).

## Fix

Change the attribute name to camelCase in `src/routes/index.tsx`:

```tsx
{...(i === slideIdx ? { fetchPriority: "high" as const } : {})}
```

## Verify

- Reload the home page and confirm the console no longer logs the `Invalid DOM property` error.
- Hero image renders and slider still auto-rotates.
