'use client';

import { useState } from 'react';
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

  const currentArtworks = activeTab === 'student' ? studentArtworks : instructorArtworks;

  const slides = currentArtworks.map((artwork) => ({
    src: getStrapiMediaUrl(artwork.image),
    alt: artwork.title || 'Artwork',
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('student')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeTab === 'student'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Student Artworks
        </button>
        <button
          onClick={() => setActiveTab('instructor')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeTab === 'instructor'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Instructor Artworks
        </button>
      </div>

      {/* Gallery Grid */}
      {currentArtworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentArtworks.map((artwork, index) => (
            <div
              key={artwork.id}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={getStrapiMediaUrl(artwork.image)}
                alt={artwork.title || 'Artwork'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
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
