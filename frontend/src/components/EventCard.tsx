'use client';

import Image from 'next/image';
import { Event, getStrapiMediaUrl } from '@/lib/strapi';

interface EventCardProps {
  event: Event;
  onSignUp: (event: Event) => void;
}

export default function EventCard({ event, onSignUp }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="card bg-white rounded-3xl overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <Image
          src={getStrapiMediaUrl(event.image)}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {event.discount && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
            {event.discount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl sm:text-2xl font-serif text-gray-800 mb-4 line-clamp-2 min-h-[3.5rem]">
          {event.title}
        </h3>

        <div className="space-y-2 mb-6">
          {/* Date */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{event.time}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm truncate">{event.location}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg sm:text-xl font-semibold text-gray-800">${event.price}</span>
            <span className="text-gray-500 text-sm">per person</span>
          </div>
        </div>

        {/* Sign Up Button */}
        <button
          onClick={() => onSignUp(event)}
          className="w-full btn-primary text-center"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
