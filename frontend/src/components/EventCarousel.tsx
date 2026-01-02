'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import EventCard from './EventCard';
import { Event } from '@/lib/strapi';

import 'swiper/css';
import 'swiper/css/pagination';

interface EventCarouselProps {
  events: Event[];
  onSignUp: (event: Event) => void;
}

export default function EventCarousel({ events, onSignUp }: EventCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No upcoming events at the moment. Check back soon!
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Custom Prev Button - V1 style: circular, shadow, hidden on < 1110px */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="hidden min-[1110px]:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[85px] z-10
                   w-[45px] h-[45px] items-center justify-center
                   bg-white rounded-full shadow-[0_4px_20px_0_rgba(0,0,0,0.1)]
                   hover:shadow-[0_4px_25px_0_rgba(0,0,0,0.15)] transition-shadow cursor-pointer"
        aria-label="Previous slide"
      >
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 1L1 9L9 17" stroke="#18222F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Custom Next Button - V1 style: circular, shadow, hidden on < 1110px */}
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="hidden min-[1110px]:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[85px] z-10
                   w-[45px] h-[45px] items-center justify-center
                   bg-white rounded-full shadow-[0_4px_20px_0_rgba(0,0,0,0.1)]
                   hover:shadow-[0_4px_25px_0_rgba(0,0,0,0.15)] transition-shadow cursor-pointer"
        aria-label="Next slide"
      >
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L9 9L1 17" stroke="#18222F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          992: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
        }}
        className="pb-16"
      >
        {events.map((event) => (
          <SwiperSlide key={event.id} className="h-auto">
            <EventCard event={event} onSignUp={onSignUp} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
