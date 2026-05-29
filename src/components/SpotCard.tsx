import { useEffect, useRef } from 'react';
import { spotsData } from '../data/spots';

declare const lightGallery: (element: HTMLElement, options?: Record<string, unknown>) => {
  openGallery: (index?: number) => void;
  destroy: () => void;
};

interface SpotCardProps {
  spotName: string;
}

export default function SpotCard({ spotName }: SpotCardProps) {
  const spot = spotsData[spotName];
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightGalleryInstance = useRef<{ openGallery: (index?: number) => void; destroy: () => void } | null>(null);

  useEffect(() => {
    if (galleryRef.current && typeof lightGallery !== 'undefined') {
      lightGalleryInstance.current = lightGallery(galleryRef.current, {
        plugins: [window.lgThumbnail, window.lgZoom, window.lgFullscreen],
        thumbnail: true,
        zoom: true,
        fullscreen: true,
        selector: 'a',
      });
    }

    return () => {
      if (lightGalleryInstance.current) {
        lightGalleryInstance.current.destroy();
      }
    };
  }, []);

  if (!spot) return null;

  const totalImages = spot.imageCount;

  const getImageSrc = (index: number) => {
    return `/imgs/${encodeURIComponent(spot.folder)}/xhs_image_${index + 1}.jpg`;
  };

  const openGallery = (index = 0) => {
    if (lightGalleryInstance.current) {
      lightGalleryInstance.current.openGallery(index);
    }
  };

  return (
    <div className="spot-card bg-white rounded-[16px] overflow-hidden shadow-md border border-sky-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="spot-card-images relative flex flex-col h-[220px]">
        <div className="spot-image-main flex-1 overflow-hidden">
          <img
            src={getImageSrc(0)}
            alt={spotName}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-103"
            onClick={() => openGallery(0)}
          />
        </div>
        <div className="spot-image-grid grid grid-cols-4 gap-[2px] p-[2px] bg-black/5">
          {Array.from({ length: Math.min(4, totalImages) }).map((_, index) => (
            <img
              key={index}
              src={getImageSrc(index + 1)}
              alt={`${spotName} ${index + 1}`}
              className="w-full h-[60px] object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => openGallery(index + 1)}
            />
          ))}
        </div>
        <div className="spot-image-badge absolute bottom-[68px] right-2 flex items-center gap-1 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-bold">
          <i className="fas fa-images" /> {totalImages}张
        </div>
      </div>
      <div className="spot-card-info p-4">
        <div className="spot-card-title font-bold text-base text-text mb-2 flex items-center gap-2">
          <i className={`fas ${spot.icon} text-primary`} />
          {spotName}
        </div>
        <div className="spot-card-desc text-textLight text-sm mb-3">
          {spot.description}
        </div>
        <div className="spot-card-actions flex gap-2.5">
          <a
            href={spot.xhsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="spot-card-link flex items-center gap-1.5 text-secondary bg-secondary/10 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-secondary/20 transition-colors"
          >
            <i className="fab fa-x-twitter" />
            小红书攻略
          </a>
          <button
            onClick={() => openGallery(0)}
            className="spot-card-gallery-btn flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <i className="fas fa-eye" />
            查看图片
          </button>
        </div>
      </div>

      <div ref={galleryRef} className="spot-lightgallery" data-spot={spotName}>
        {Array.from({ length: totalImages }).map((_, index) => (
          <a key={index} href={getImageSrc(index)}>
            <img src={getImageSrc(index)} alt={spotName} />
          </a>
        ))}
      </div>
    </div>
  );
}
