// components/ui/Avatar.tsx
import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, width = 50, height = 50 }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="rounded-full"
    />
  );
};

export default Avatar;
