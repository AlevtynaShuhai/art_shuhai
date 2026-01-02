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
      {/* Custom Prev Button */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="hidden lg:flex absolute left-0 top-1/3 -translate-x-14 z-10 items-center justify-center text-7xl font-light text-[#CD7F32] hover:text-[#B8722D] hover:scale-125 transition-all cursor-pointer"
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* Custom Next Button */}
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="hidden lg:flex absolute right-0 top-1/3 translate-x-14 z-10 items-center justify-center text-7xl font-light text-[#CD7F32] hover:text-[#B8722D] hover:scale-125 transition-all cursor-pointer"
        aria-label="Next slide"
      >
        ›
      </button>

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1280: {
            slidesPerView: 4,
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
