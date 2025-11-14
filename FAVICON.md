# Client Portal Favicon Strategy

## ⚠️ IMPORTANT: Do NOT Create Random Files in `/public`

**Current Status:**
- No favicon file exists (intentionally removed)
- The client portal uses `lucide-react` Handshake icon **inline in UI components** only
- Browser tab will show default browser icon (this is OK)

## How Icons Are Used in This App

### ✅ Correct Usage: Inline in React Components
The Handshake icon is used directly from `lucide-react` in UI:
```jsx
import { Handshake } from 'lucide-react';

<Handshake className="h-24 w-24 text-gray-300" strokeWidth={2} />
```

**Where it's used:**
- `/app/splash/page.jsx` - Centered handshake icon
- `/app/login/page.jsx` - Login form icon
- `/app/set-password/page.jsx` - Password form icon
- `/app/activate/page.jsx` - Activation page icon

### ❌ Do NOT: Create Static Favicon Files
- **Do NOT** create `/public/favicon.svg` manually
- **Do NOT** copy SVG paths from lucide and paste into a file
- **Do NOT** download SVGs and put them in public folder
- Favicon is **optional** - browser default is fine

## Why No Static Favicon?

1. **Source of Truth**: Icons come from `lucide-react` package
   - Single source: npm package `lucide-react`
   - Version controlled via `package.json`
   - Can update all icons at once by updating the package

2. **Avoiding Duplication**: 
   - Don't duplicate SVG code in static files
   - Don't maintain two sources (package + static file)
   - Don't risk drift between inline usage and favicon

3. **Simpler Maintenance**:
   - Icons are managed by the lucide-react package
   - No manual file management needed
   - Consistent across all UI components

## If You Need a Browser Tab Favicon Later

**The Correct Way:**
1. Visit https://lucide.dev/icons/handshake
2. Click "Download SVG" to get official SVG
3. **Only then** create `/public/favicon.svg` with that official file
4. Update `app/layout.jsx` metadata to reference it

**Never:**
- Manually type SVG paths
- Copy/paste from React component output
- Create "custom" versions of the icon

## Current Layout Configuration

`app/layout.jsx` has **no favicon metadata** (by design):
```javascript
export const metadata = {
  title: 'Ignite Client Portal',
  description: 'Your engagement hub for proposals and deliverables',
  // No icons metadata - browser default is fine
};
```

## Summary

- ✅ Use `lucide-react` Handshake component inline in UI
- ✅ No static favicon file needed
- ❌ Don't create random files in `/public`
- ❌ Don't duplicate SVG code
- ⚠️ Browser tab will show default icon (this is acceptable)

**Rule of thumb**: If it's not downloaded directly from lucide.dev, don't put it in `/public`.

