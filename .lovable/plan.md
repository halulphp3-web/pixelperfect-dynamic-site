## Plan to fix site loading in browser

1. **Remove the crash source in the map popup**
   - Replace the TanStack `<Link>` inside `PropertyMap` Leaflet popup with a normal `/properties/{slug}` anchor.
   - Reason: Leaflet popup content is mounted with a separate React root, outside the app router provider, which matches the current browser error: `useRouter must be used inside a <RouterProvider>`.

2. **Keep current functionality unchanged**
   - Map markers, hover behavior, popup image/name/price, close icon, and navigation to property details will remain the same.
   - Only the popup link implementation changes so the page stops crashing.

3. **Verify in browser**
   - Open `/properties?search=&guests=0`.
   - Confirm the page loads, map renders, hovering/clicking marker popups does not show `This page didn't load`, and no router-provider error appears in console.

4. **Optional small cleanup if needed**
   - If any other isolated React root uses TanStack `<Link>` the same way, convert it too so the issue cannot repeat.