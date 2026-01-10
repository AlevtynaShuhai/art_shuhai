'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Artwork, getStrapiMediaUrl } from '@/lib/strapi';

interface GalleryProps {
  studentArtworks: Artwork[];
  instructorArtworks: Artwork[];
}

export default function Gallery({ studentArtworks, instructorArtworks }: GalleryProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // For rotation: track which indices are displayed in each of 4 positions
  const [displayedIndices, setDisplayedIndices] = useState<number[]>([0, 1, 2, 3]);
  // Track which position is currently animating (fading out/in)
  const [animatingPosition, setAnimatingPosition] = useState<number | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentArtworks = (activeTab === 'student' ? studentArtworks : instructorArtworks)
    .filter(artwork => artwork.image);

  const hasMoreThanFour = currentArtworks.length > 4;

  // Reset displayed indices when tab changes or artworks change
  useEffect(() => {
    setDisplayedIndices([0, 1, 2, 3].filter(i => i < currentArtworks.length));
    setAnimatingPosition(null);
    setIsFadingOut(false);
  }, [activeTab, currentArtworks.length]);

  // Trigger animation on tab change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Rotation logic
  const rotateImage = useCallback(() => {
    if (!hasMoreThanFour || currentArtworks.length <= 4) return;

    // Get indices not currently displayed
    const hiddenIndices = Array.from({ length: currentArtworks.length }, (_, i) => i)
      .filter(i => !displayedIndices.includes(i));

    if (hiddenIndices.length === 0) return;

    // Pick random position to replace (0-3)
    const positionToReplace = Math.floor(Math.random() * Math.min(4, displayedIndices.length));
    // Pick random hidden image to show
    const newImageIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];

    // Start fade out animation
    setAnimatingPosition(positionToReplace);
    setIsFadingOut(true);

    // After fade out, swap the image and fade in
    setTimeout(() => {
      setDisplayedIndices(prev => {
        const newIndices = [...prev];
        newIndices[positionToReplace] = newImageIndex;
        return newIndices;
      });
      setIsFadingOut(false);

      // Clear animating state after fade in
      setTimeout(() => {
        setAnimatingPosition(null);
      }, 500);
    }, 500);
  }, [currentArtworks.length, displayedIndices, hasMoreThanFour]);

  // Set up rotation interval
  useEffect(() => {
    if (hasMoreThanFour && !lightboxOpen) {
      rotationTimerRef.current = setInterval(rotateImage, 3500);
    }

    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [hasMoreThanFour, rotateImage, lightboxOpen]);

  const slides = currentArtworks.map((artwork) => ({
    src: getStrapiMediaUrl(artwork.image),
    alt: artwork.title || 'Artwork',
  }));

  const openLightbox = (artworkIndex: number) => {
    setLightboxIndex(artworkIndex);
    setLightboxOpen(true);
  };

  // Get artworks to display based on displayedIndices
  const getDisplayedArtwork = (position: number) => {
    const index = displayedIndices[position];
    if (index === undefined || index >= currentArtworks.length) return null;
    return { artwork: currentArtworks[index], originalIndex: index };
  };

  // Animation class for rotation
  const getRotationClass = (position: number) => {
    if (animatingPosition === position) {
      return isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100';
    }
    return 'opacity-100 scale-100';
  };

  return (
    <div className="w-full">
      {/* Tab Buttons - V1 Style */}
      <div className="flex flex-col lg:flex-row justify-center items-center mt-[30px] lg:mt-[50px] mb-[30px] px-4 lg:px-0">
        <button
          onClick={() => setActiveTab('student')}
          className={`w-full max-w-[290px] lg:w-[239px] h-[45px] border border-[#FFC98B]
                      rounded-[90px] lg:rounded-l-[90px] lg:rounded-r-none
                      text-[18px] lg:text-[22px] font-normal mb-3 lg:mb-0 transition-all
                      ${activeTab === 'student' ? 'bg-[#FFC98B] border-[#FFC98B]' : 'bg-transparent hover:bg-[#FFC98B]/20'}`}
        >
          student artwork
        </button>
        <button
          onClick={() => setActiveTab('instructor')}
          className={`w-full max-w-[290px] lg:w-[239px] h-[45px] border border-[#FFC98B]
                      rounded-[90px] lg:rounded-r-[90px] lg:rounded-l-none
                      text-[18px] lg:text-[22px] font-normal transition-all
                      ${activeTab === 'instructor' ? 'bg-[#FFC98B] border-[#FFC98B]' : 'bg-transparent hover:bg-[#FFC98B]/20'}`}
        >
          my artwork
        </button>
      </div>

      {/* Gallery Grid - V1 Asymmetric Layout */}
      {currentArtworks.length > 0 ? (
        <>
          {/* Desktop: Asymmetric grid */}
          <div className="hidden lg:grid gap-[25px]" style={{
            gridTemplateAreas: `
              "photo1 photo2 photo3"
              "photo4 photo4 photo3"
            `,
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '300px 300px'
          }}>
            {[0, 1, 2, 3].map((position) => {
              const data = getDisplayedArtwork(position);
              if (!data) return null;
              const { artwork, originalIndex } = data;
              const gridArea = ['photo1', 'photo2', 'photo3', 'photo4'][position];
              const animationDelay = ['', 'animation-delay-150', 'animation-delay-300', 'animation-delay-450'][position];

              return (
                <div
                  key={`pos-${position}-${originalIndex}`}
                  style={{ gridArea }}
                  className={`relative rounded-[20px] overflow-hidden cursor-pointer group ${
                    !isAnimating ? `animate-gallery-fade-in ${animationDelay}` : 'opacity-0'
                  }`}
                  onClick={() => openLightbox(originalIndex)}
                >
                  <div className={`absolute inset-0 transition-all duration-500 ${getRotationClass(position)}`}>
                    <Image
                      src={getStrapiMediaUrl(artwork.image)}
                      alt={artwork.title || 'Artwork'}
                      fill
                      priority={position === 0}
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet: 2x2 grid */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-[15px]">
            {[0, 1, 2, 3].map((position) => {
              const data = getDisplayedArtwork(position);
              if (!data) return null;
              const { artwork, originalIndex } = data;

              return (
                <div
                  key={`pos-${position}-${originalIndex}`}
                  className={`relative aspect-square rounded-[20px] overflow-hidden cursor-pointer group ${
                    !isAnimating ? `animate-gallery-fade-in animation-delay-${position * 150}` : 'opacity-0'
                  }`}
                  onClick={() => openLightbox(originalIndex)}
                >
                  <div className={`absolute inset-0 transition-all duration-500 ${getRotationClass(position)}`}>
                    <Image
                      src={getStrapiMediaUrl(artwork.image)}
                      alt={artwork.title || 'Artwork'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: Single column */}
          <div className="md:hidden flex flex-col gap-[15px]">
            {[0, 1, 2, 3].map((position) => {
              const data = getDisplayedArtwork(position);
              if (!data) return null;
              const { artwork, originalIndex } = data;

              return (
                <div
                  key={`pos-${position}-${originalIndex}`}
                  className={`relative aspect-[4/3] rounded-[20px] overflow-hidden cursor-pointer group ${
                    !isAnimating ? `animate-gallery-fade-in animation-delay-${position * 150}` : 'opacity-0'
                  }`}
                  onClick={() => openLightbox(originalIndex)}
                >
                  <div className={`absolute inset-0 transition-all duration-500 ${getRotationClass(position)}`}>
                    <Image
                      src={getStrapiMediaUrl(artwork.image)}
                      alt={artwork.title || 'Artwork'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No artworks available at the moment.
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />
    </div>
  );
}
