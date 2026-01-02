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
      {/* Hero Section - V1 Banner Style */}
      <section className="banner h-[520px] lg:h-[700px] mb-[80px] lg:mb-[200px]">
        <div className="container mx-auto px-[15px] flex flex-col items-center">
          <div className="text-white font-serif text-[38px] lg:text-[72px] font-bold leading-[100%] text-center uppercase italic mt-[115px] lg:mt-[177px] mb-[15px] lg:mb-[21px]">
            "Art washes away from the<br />soul the dust<br />of everyday life"
          </div>
          <div className="text-white text-[18px] lg:text-[30px] font-normal leading-[120%] mb-[30px] lg:mb-[40px]">
            Pablo Picasso
          </div>
          <a href="#events" className="main-button">
            View events
          </a>
        </div>
      </section>

      {/* Why Choose Us Section - V1 Style */}
      <section className="section-spacing">
        <div className="container mx-auto px-[15px] flex flex-col items-center">
          <h2 className="main-title">
            Let&apos;s get creative!<br />Art classes for all
          </h2>

          <div className="flex flex-col lg:flex-row lg:items-stretch mt-[30px] lg:mt-[50px]">
            {/* Block 1: Visual arts & creative classes */}
            <div className="bg-white rounded-[40px] lg:rounded-[50px] shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                          p-[35px_20px] lg:p-[40px_30px] mr-0 lg:mr-[40px] mb-[25px] lg:mb-0 flex-1">
              <div className="text-[18px] lg:text-[20px] font-semibold mb-[20px] lg:mb-[25px]">
                Visual arts & creative classes
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                individual lessons
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                group workshops for children and adults
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                corporate events
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-0 leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                courses in the visual arts for all levels of training and much more
              </div>
            </div>

            {/* Block 2: Why me? */}
            <div className="bg-white rounded-[40px] lg:rounded-[50px] shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                          p-[35px_20px] lg:p-[40px_30px] flex-1">
              <div className="text-[18px] lg:text-[20px] font-semibold mb-[20px] lg:mb-[25px]">
                Why me?
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                professional experience teaching fine arts for over 12 years
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                friendly and inspiring atmosphere at the classes
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                provision of high quality materials
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                individual approach to each student
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-[12px] lg:mb-[15px] leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                flexible schedule
              </div>
              <div className="flex items-start gap-[6px] lg:gap-[10px] text-[16px] lg:text-[20px] mb-0 leading-[150%]">
                <img src="/assets/img/icon-checkmark.png" alt="" className="w-6 h-6 lg:w-auto lg:h-auto mt-1" />
                convenient location
              </div>
            </div>
          </div>

          <a href="#contact" className="main-button mt-[30px]">Contact us</a>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="section-spacing">
        <div className="container mx-auto px-[15px]">
          <h2 className="main-title mb-[30px] lg:mb-[50px]">
            Upcoming events
          </h2>
          <EventCarousel events={events} onSignUp={handleSignUp} />
        </div>
      </section>

      {/* Regular Classes Section */}
      {regularEvents.length > 0 && (
        <section className="section-spacing">
          <div className="container mx-auto px-[15px]">
            <h2 className="main-title mb-[30px] lg:mb-[50px]">
              REGULAR ART CLASSES
            </h2>
            <EventCarousel events={regularEvents} onSignUp={handleSignUp} />
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="section-spacing">
        <div className="container mx-auto px-[15px] flex flex-col items-center">
          <h2 className="main-title">GALLERY</h2>
          <Gallery
            studentArtworks={studentArtworks}
            instructorArtworks={instructorArtworks}
          />
        </div>
      </section>

      {/* About Section - V1 Style (text left, image right) */}
      <section className="section-spacing">
        <div className="container mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text Left */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h2 className="main-title text-center lg:text-left mb-[30px]">
                {homepage?.aboutTitle || 'About me'}
              </h2>
              {homepage?.aboutText && (
                <div
                  className="text-[16px] lg:text-[17px] leading-[150%] [&>p]:mb-[12px] lg:[&>p]:mb-[15px]"
                  dangerouslySetInnerHTML={{ __html: homepage.aboutText }}
                />
              )}
            </div>
            {/* Image Right */}
            {homepage?.aboutImage && (
              <div className="order-1 lg:order-2">
                <Image
                  src={getStrapiMediaUrl(homepage.aboutImage)}
                  alt="About"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subscribe CTA Section - V1 */}
      <section
        className="section-spacing h-[227px] flex items-center"
        style={{
          background: 'url(/assets/img/subscribe-to-the-newsletter.png) center no-repeat',
          backgroundSize: 'cover'
        }}
      >
        <div className="container mx-auto px-[15px]">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-3/4 text-center lg:text-left mb-3 lg:mb-0">
              <span className="font-serif text-[38px] lg:text-[47px] font-bold leading-[90%]">
                &ldquo;Escape the Ordinary – Paint Your Dreams!&rdquo;
              </span>
            </div>
            <div className="lg:w-1/4 flex justify-center">
              <a href="#events" className="main-button" style={{ width: '250px', height: '50px' }}>Events</a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - V1 Style (image left, form right) */}
      <section className="section-spacing" id="contact">
        <div className="container mx-auto px-[15px]">
          <ContactForm />
        </div>
      </section>

      {/* FAQ Section - V1 Style (title left, accordion right) */}
      {faqs.length > 0 && (
        <section className="section-spacing">
          <div className="container mx-auto px-[15px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Title Left */}
              <div>
                <h2 className="main-title !text-left mb-4 lg:mb-0">
                  Frequently asked questions
                </h2>
              </div>
              {/* Accordion Right */}
              <div>
                <FAQ faqs={faqs} />
              </div>
            </div>
          </div>
        </section>
      )}

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
