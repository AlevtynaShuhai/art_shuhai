'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Event, Artwork, FAQ as FAQType, Homepage, Settings, getStrapiMediaUrl } from '@/lib/strapi';
import EventCarousel from '@/components/EventCarousel';
import OrderModal from '@/components/OrderModal';
import Gallery from '@/components/Gallery';
import ContactForm from '@/components/ContactForm';
import FAQ from '@/components/FAQ';

interface HomePageClientProps {
  events: Event[];
  regularEvents: Event[];
  studentArtworks: Artwork[];
  instructorArtworks: Artwork[];
  faqs: FAQType[];
  homepage: Homepage | null;
  settings: Settings | null;
}

export default function HomePageClient({
  events,
  regularEvents,
  studentArtworks,
  instructorArtworks,
  faqs,
  homepage,
  settings,
}: HomePageClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignUp = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        {homepage?.bannerImage && (
          <>
            <Image
              src={getStrapiMediaUrl(homepage.bannerImage)}
              alt="Hero background"
              fill
              className="object-cover hidden md:block"
              priority
            />
            {homepage.bannerImageMobile && (
              <Image
                src={getStrapiMediaUrl(homepage.bannerImageMobile)}
                alt="Hero background"
                fill
                className="object-cover md:hidden"
                priority
              />
            )}
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif mb-6 animate-fade-in">
            {homepage?.bannerTitle || 'Art Classes with Alevtyna'}
          </h1>
          {homepage?.bannerSubtitle && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {homepage.bannerSubtitle}
            </p>
          )}
          <a
            href="#events"
            className="inline-block btn-primary text-lg"
          >
            View Upcoming Classes
          </a>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(homepage?.whyChooseUsItems || defaultWhyItems).map((item, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="section">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4">
            Upcoming Classes
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Join our creative workshops and discover the artist within you
          </p>
          <EventCarousel events={events} onSignUp={handleSignUp} />
        </div>
      </section>

      {/* Regular Classes Section */}
      {regularEvents.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
              Regular Classes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {regularEvents.map((event) => (
                <div key={event.id} className="card p-6">
                  <h3 className="text-2xl font-serif mb-4">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${event.price}
                    </span>
                    <button
                      onClick={() => handleSignUp(event)}
                      className="btn-primary"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="section">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
            Gallery
          </h2>
          <Gallery
            studentArtworks={studentArtworks}
            instructorArtworks={instructorArtworks}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {homepage?.aboutImage && (
              <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
                <Image
                  src={getStrapiMediaUrl(homepage.aboutImage)}
                  alt="About"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-6">
                {homepage?.aboutTitle || 'About Me'}
              </h2>
              {homepage?.aboutText && (
                <div
                  className="prose prose-lg text-gray-600"
                  dangerouslySetInnerHTML={{ __html: homepage.aboutText }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="section">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
              Frequently Asked Questions
            </h2>
            <FAQ faqs={faqs} />
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="section bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4">
            Let&apos;s Get in Touch
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* Order Modal */}
      <OrderModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cancellationPolicy={homepage?.cancellationPolicy}
      />
    </>
  );
}

const defaultWhyItems = [
  {
    title: 'Professional Instruction',
    description: 'Learn from an experienced artist with years of teaching experience',
  },
  {
    title: 'All Materials Included',
    description: 'Everything you need is provided - just bring your creativity',
  },
  {
    title: 'Small Group Classes',
    description: 'Intimate setting ensures personalized attention for every student',
  },
];
