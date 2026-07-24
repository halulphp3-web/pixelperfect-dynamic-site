## Plan: Fix hero slider images not displaying

I checked the live page and database source for the home hero.

### What I found
- The home page has 2 active hero slides.
- Both slide image URLs are long-lived signed storage URLs.
- The slider DOM is rendering and rotating between slides.
- The app currently relies on `onError` fallback only; if signed URLs expire, get malformed, or the image fails before hydration, the hero can still show a blank/white area.

### Fix
1. **Make hero images resilient**
   - Add a small helper that normalizes hero image URLs before rendering.
   - Detect broken/empty storage URLs and fall back to the local hero image.
   - Keep the existing slider, arrows, dots, and auto-rotation unchanged.

2. **Prevent white hero area**
   - Add a guaranteed background image/color fallback behind the slider.
   - Keep the dark overlay so text remains readable even if one uploaded image fails.

3. **Improve admin upload safety**
   - Ensure banner uploads save a usable signed image URL consistently.
   - Keep the existing upload option in the Hero Slides admin page.

4. **Verify**
   - Check the live home page after the fix.
   - Confirm at least one hero image has real dimensions and the section no longer appears white when an uploaded banner fails.