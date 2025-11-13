# 🖼️ Next.js Image Domain Configuration Fix

## ⚠️ Issue

When uploading menu item images, you got this error:

```
Invalid src prop (https://jkgbhwdgxulhsbjduztn.supabase.co/storage/v1/object/public/menu-images/...)
on `next/image`, hostname "jkgbhwdgxulhsbjduztn.supabase.co" is not configured 
under images in your `next.config.js`
```

## 🔍 Root Cause

Next.js `<Image>` component requires you to explicitly configure external domains for security reasons. Supabase Storage URLs were not whitelisted.

## ✅ Solution

Added Supabase Storage domain to Next.js configuration.

### File Modified

**`next.config.ts`**

### Before (Broken)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

### After (Fixed)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jkgbhwdgxulhsbjduztn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

## 🔑 Configuration Breakdown

### `remotePatterns` (Recommended)

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',           // Only HTTPS allowed
      hostname: 'your-project.supabase.co',
      port: '',                    // Empty = default port
      pathname: '/storage/v1/object/public/**',  // Public storage only
    },
  ],
}
```

**Why use `remotePatterns`?**
- ✅ More secure (limits to specific paths)
- ✅ Supports wildcards
- ✅ Can restrict protocols and ports
- ✅ Recommended by Next.js

### Alternative: `domains` (Legacy)

```typescript
images: {
  domains: ['jkgbhwdgxulhsbjduztn.supabase.co'],
}
```

**Why NOT to use `domains`:**
- ⚠️ Less secure (allows any path)
- ⚠️ Being deprecated
- ⚠️ Less control

## 🚀 How to Apply

### Step 1: Update Config

Edit `next.config.ts` with the configuration above.

### Step 2: Restart Dev Server

**IMPORTANT**: Changes to `next.config.ts` require a full restart!

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test Image Upload

1. Go to `/dashboard/menus`
2. Select a restaurant
3. Click "Manage Items" on a menu
4. Click "Add Item"
5. Upload an image (JPG/PNG, <5MB)
6. Fill in other details
7. Click "Save"
8. ✅ Image should display without errors!

## 🧪 Verification

### Test 1: Upload New Image
- [ ] Upload image in menu item form
- [ ] ✅ Upload succeeds
- [ ] ✅ Preview shows immediately
- [ ] ✅ Image saves correctly

### Test 2: View Existing Images
- [ ] View menu items with images
- [ ] ✅ Images display correctly
- [ ] ✅ No console errors
- [ ] ✅ Images are optimized by Next.js

### Test 3: Edit Item with Image
- [ ] Edit item that has an image
- [ ] ✅ Image shows in edit form
- [ ] ✅ Can change image
- [ ] ✅ Can remove image

## 🔒 Security Considerations

### What This Allows

✅ **Allowed:**
- Images from `https://jkgbhwdgxulhsbjduztn.supabase.co`
- Only paths starting with `/storage/v1/object/public/`
- Only HTTPS protocol

❌ **Blocked:**
- Images from other domains
- Non-public storage paths
- HTTP (insecure) connections
- Different ports

### Why This Is Safe

1. **Specific Hostname**: Only your Supabase project
2. **Public Storage Only**: Can't access private buckets
3. **HTTPS Only**: Encrypted connections required
4. **Path Restrictions**: Limited to storage API

## 💡 For Multiple Projects

If you have multiple Supabase projects or other image sources:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'project1.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
    {
      protocol: 'https',
      hostname: 'project2.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
    {
      protocol: 'https',
      hostname: 'cdn.example.com',
      pathname: '/images/**',
    },
  ],
}
```

## 🎨 Image Optimization

With domain configured, Next.js will automatically:

- ✅ Optimize images (WebP/AVIF)
- ✅ Resize based on screen size
- ✅ Lazy load images
- ✅ Prevent layout shift
- ✅ Cache efficiently

### Before (Without Optimization)

```jsx
<img src={imageUrl} alt="Item" /> 
// ❌ No optimization, no lazy loading
```

### After (With Optimization)

```jsx
<Image src={imageUrl} alt="Item" width={200} height={200} />
// ✅ Optimized, lazy loaded, responsive
```

## 📊 Performance Benefits

| Feature | Regular `<img>` | Next.js `<Image>` |
|---------|----------------|-------------------|
| Format Optimization | ❌ | ✅ WebP/AVIF |
| Responsive Sizes | ❌ | ✅ Auto srcset |
| Lazy Loading | Manual | ✅ Automatic |
| Layout Shift | ⚠️ Risk | ✅ Prevented |
| Cache Control | Basic | ✅ Optimized |
| Size Reduction | 0% | ⬇️ 30-60% |

## 🔄 Dynamic Configuration

For environment-specific domains:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
```

## 🐛 Common Issues

### Issue: "Server restart required"

**Solution**: Config changes need full restart
```bash
Ctrl+C
npm run dev
```

### Issue: "Image still not showing"

**Checklist:**
- [ ] Config file saved?
- [ ] Server restarted?
- [ ] Correct domain?
- [ ] Image URL is public?
- [ ] Using `<Image>` not `<img>`?

### Issue: "Different Supabase project"

**Solution**: Update hostname to match your project
```typescript
hostname: 'YOUR-PROJECT-ID.supabase.co'
```

Find your project ID in Supabase dashboard URL:
`https://app.supabase.com/project/YOUR-PROJECT-ID`

## 📚 Official Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Remote Patterns Configuration](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## 🎯 Summary

### What Changed
- Added `images.remotePatterns` to `next.config.ts`
- Whitelisted Supabase Storage domain
- Restricted to public paths only

### What This Fixes
- ✅ Menu item images now display
- ✅ Image uploads work correctly
- ✅ No more domain errors
- ✅ Images are optimized

### What You Need to Do
1. ✅ Config already updated
2. ⚠️ **Restart dev server** (Ctrl+C, then `npm run dev`)
3. ✅ Test image upload
4. ✅ Enjoy optimized images!

---

**Status**: ✅ Fixed  
**Action Required**: ⚠️ Restart dev server  
**Build Impact**: None (runtime config only)

Your menu item images will now load and display perfectly! 🖼️✨
