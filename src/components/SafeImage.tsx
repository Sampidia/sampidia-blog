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

  if (hasError) {
    const srcStr = typeof src === 'string' ? src : (src as any)?.src || '';
    
    // Mimic the CSS behavior of fill if it was provided
    const imgStyle = fill
      ? {
          position: 'absolute' as const,
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          objectFit: restProps.className?.includes('object-cover') ? ('cover' as const) : undefined,
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
