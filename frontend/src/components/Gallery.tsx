'use client';

import { useState, useEffect } from 'react';
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

  const currentArtworks = (activeTab === 'student' ? studentArtworks : instructorArtworks)
    .filter(artwork => artwork.image); // Filter out artworks without images

  // Trigger animation on tab change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const slides = currentArtworks.map((artwork) => ({
    src: getStrapiMediaUrl(artwork.image),
    alt: artwork.title || 'Artwork',
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Get first 4 artworks for the asymmetric grid (V1 style)
  const gridArtworks = currentArtworks.slice(0, 4);

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
            {gridArtworks[0] && (
              <div
                style={{ gridArea: 'photo1' }}
                className={`relative rounded-[20px] overflow-hidden cursor-pointer group ${
                  !isAnimating ? 'animate-gallery-fade-in' : 'opacity-0'
                }`}
                onClick={() => openLightbox(0)}
              >
                <Image
                  src={getStrapiMediaUrl(gridArtworks[0].image)}
                  alt={gridArtworks[0].title || 'Artwork'}
                  fill
                  priority
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            )}
            {gridArtworks[1] && (
              <div
                style={{ gridArea: 'photo2' }}
                className={`relative rounded-[20px] overflow-hidden cursor-pointer group ${
                  !isAnimating ? 'animate-gallery-fade-in animation-delay-150' : 'opacity-0'
                }`}
                onClick={() => openLightbox(1)}
              >
                <Image
                  src={getStrapiMediaUrl(gridArtworks[1].image)}
                  alt={gridArtworks[1].title || 'Artwork'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            )}
            {gridArtworks[2] && (
              <div
                style={{ gridArea: 'photo3' }}
                className={`relative rounded-[20px] overflow-hidden cursor-pointer group ${
                  !isAnimating ? 'animate-gallery-fade-in animation-delay-300' : 'opacity-0'
                }`}
                onClick={() => openLightbox(2)}
              >
                <Image
                  src={getStrapiMediaUrl(gridArtworks[2].image)}
                  alt={gridArtworks[2].title || 'Artwork'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            )}
            {gridArtworks[3] && (
              <div
                style={{ gridArea: 'photo4' }}
                className={`relative rounded-[20px] overflow-hidden cursor-pointer group ${
                  !isAnimating ? 'animate-gallery-fade-in animation-delay-450' : 'opacity-0'
                }`}
                onClick={() => openLightbox(3)}
              >
                <Image
                  src={getStrapiMediaUrl(gridArtworks[3].image)}
                  alt={gridArtworks[3].title || 'Artwork'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            )}
          </div>

          {/* Tablet: 2x2 grid */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-[15px]">
            {gridArtworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className={`relative aspect-square rounded-[20px] overflow-hidden cursor-pointer group ${
                  !isAnimating ? `animate-gallery-fade-in animation-delay-${index * 150}` : 'opacity-0'
                }`}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={getStrapiMediaUrl(artwork.image)}
                  alt={artwork.title || 'Artwork'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>

          {/* Mobile: Single column */}
          <div className="md:hidden flex flex-col gap-[15px]">
            {gridArtworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className={`relative aspect-[4/3] rounded-[20px] overflow-hidden cursor-pointer group ${
                  !isAnimating ? `animate-gallery-fade-in animation-delay-${index * 150}` : 'opacity-0'
                }`}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={getStrapiMediaUrl(artwork.image)}
                  alt={artwork.title || 'Artwork'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
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
