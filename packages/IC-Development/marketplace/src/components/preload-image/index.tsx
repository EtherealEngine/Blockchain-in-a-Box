import React, { useEffect, useMemo, useState } from 'react';

export interface PreloadImageProps {
  src: string;
  onLoad: () => void;
}

export const PreloadImage: React.FC<PreloadImageProps> = ({ src, onLoad }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useMemo(() => {
    setIsLoading(true);
    const image = new Image();
    image.src = src;
    image.onload = onLoad;
  }, [src, onLoad]);

  if (!isLoading) {
    return;
  }

  return (
    <img
      src={src}
      alt="preload-image"
      style={{ width: 0, height: 0, opacity: 0 }}
    />
  );
};
