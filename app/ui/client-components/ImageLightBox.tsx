// components/ImageLightBox.tsx
import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

type ImageLightboxProps = {
  url?: string;
  alt: string;
};

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ url, alt }) => {
  return (
    <PhotoProvider>
      {url && (
        <PhotoView src={url}>
          <img src={url} alt={alt} className="cursor-pointer rounded shadow w-20 h-20 object-cover" />
        </PhotoView>
      )}
    </PhotoProvider>
  );
};
