// components/ImageBrowser.tsx
import React from 'react';
import Image from 'next/image';

interface ImageBrowserProps {
  onSelect: (url: string) => void;
}

const ImageBrowser: React.FC<ImageBrowserProps> = ({ onSelect }) => {
  const images = [
    '/images/image1.jpg',
    '/images/image2.jpg',
    // Add more images here
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {images.map((src, index) => (
        <div key={index} style={{ margin: '10px' }}>
          <Image 
            src={src}
            alt={`Image ${index + 1}`}
            width={100}
            height={100}
            layout="responsive"
            className="rounded-md mt-4"
            loading="lazy"
            onClick={() => onSelect(src)}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageBrowser;
