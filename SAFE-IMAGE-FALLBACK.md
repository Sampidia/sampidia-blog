# SafeImage: Client-Side Fallback for Next.js Image Optimization

This document explains the problem, design pattern, and implementation details of the `SafeImage` wrapper component. You can refer to this guide to implement similar dynamic image optimization fallbacks in other Next.js projects deployed on Vercel.

---

## 1. The Problem
Next.js provides an excellent built-in `next/image` component that optimizes and compresses images on the fly. However, when hosting on Vercel's Hobby/Free tier:
* You are limited to **1,000 source images** per month.
* When this quota is exhausted, requests to optimized images (e.g., `/_next/image?url=...`) return a **402 Payment Required** or **400 Bad Request** error, resulting in broken images on the frontend.

## 2. The Solution (Dynamic Fallback)
Instead of disabling Next.js Image Optimization globally (which hurts site performance when quota is available), we use a **dynamic client-side fallback component**. 

The component:
1. Attempts to load the optimized image using the default `next/image` component.
2. Intercepts loading failures using Next.js's `onError` prop.
3. If an error occurs (such as Vercel optimization quota exhaustion), it switches state to render a native HTML `<img>` tag that fetches the original unoptimized image directly.

---

## 3. Implementation Code

Save this component as `SafeImage.tsx` (e.g. under `src/components/SafeImage.tsx`):

```tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

export default function SafeImage({
  src,
  alt,
  fill,
  quality,
  priority,
  placeholder,
  blurDataURL,
  unoptimized,
  className,
  style,
  sizes,
  ...restProps
}: ImageProps) {
  const [hasError, setHasError] = useState(false);

  // If loading via Vercel Image Optimization fails:
  if (hasError) {
    const srcStr = typeof src === 'string' ? src : (src as any)?.src || '';
    
    // Mimic the Next.js `fill` behavior to prevent layout shift
    const imgStyle = fill
      ? {
          position: 'absolute' as const,
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          // Re-apply object-fit if Tailwind class was used
          objectFit: className?.includes('object-cover') ? ('cover' as const) : undefined,
          ...style,
        }
      : style;

    return (
      <img
        src={srcStr}
        alt={alt || ''}
        className={className}
        style={imgStyle}
        sizes={sizes}
        {...(restProps as any)}
      />
    );
  }

  // Attempt to use Next.js default optimized Image component first
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      quality={quality}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={unoptimized}
      className={className}
      style={style}
      sizes={sizes}
      onError={() => setHasError(true)}
      {...restProps}
    />
  );
}
```

---

## 4. How It Works (Key Details)

### A. Intercepting Errors
The `onError` callback on Next.js's `<Image>` executes if the optimization endpoint fails. By updating `hasError` state to `true`, the component re-renders and switches to standard HTML `<img>`.

### B. Mimicking `fill` Layouts
In Next.js, using the `fill` prop makes the image absolute and expands it to fit its parent container. If we fallback to a native `<img>` tag, we lose this styling. To prevent visual layout shifts during fallback, we programmatically re-apply the layout styles:
```typescript
position: 'absolute',
height: '100%',
width: '100%',
left: 0,
top: 0,
right: 0,
bottom: 0,
```

### C. Restoring `object-fit`
When using `fill` on `<Image>`, developers commonly add the Tailwind class `object-cover`. Since the HTML `<img>` tag does not naturally translate classes to its intrinsic properties on fallback, we scan the `className` string for `'object-cover'` and apply `objectFit: 'cover'` inline.

### D. Destructuring and TypeScript Types
To avoid TypeScript compiler errors and React DOM warnings (from passing Next.js-specific parameters like `quality`, `priority`, etc. to a standard `<img>` element), we destructure them from `ImageProps` and only forward valid properties using `{...restProps}`.

---

## 5. Referencing in Other Projects

1. **Copy the file** into your other project's component folder (e.g. `@/components/SafeImage.tsx`).
2. **Replace imports** in pages or layout files:
   * Remove: `import Image from 'next/image';`
   * Add: `import Image from '@/components/SafeImage';`
3. Enjoy seamless fallback where your images will remain visible even if your Vercel Image Optimization limits are exceeded!
