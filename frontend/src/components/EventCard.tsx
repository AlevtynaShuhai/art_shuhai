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
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimeDisplay = () => {
    if (event.flexibleSchedule) {
      return 'Flexible schedule';
    }
    if (event.startTime && event.endTime) {
      return `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
    }
    if (event.startTime) {
      return formatTime(event.startTime);
    }
    if (event.time) {
      return event.time;
    }
    return 'Time TBD';
  };

  // Calculate available seats
  const availableSeats = event.capacity != null
    ? event.capacity - (event.bookedSeats || 0)
    : null;
  const isSoldOut = availableSeats !== null && availableSeats <= 0;
  const isLimitedSeats = availableSeats !== null && availableSeats > 0 && availableSeats <= 5;

  return (
    <div className="rounded-[40px] lg:rounded-[50px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white overflow-hidden h-full flex flex-col">
      {/* Image - responsive height */}
      <div className="relative h-[280px] lg:h-[400px] overflow-hidden rounded-t-[40px] lg:rounded-t-[50px] bg-gray-200">
        {event.image ? (
          <Image
            src={getStrapiMediaUrl(event.image)}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Left badge - spots available */}
        {availableSeats !== null && !isSoldOut && (
          <div className={`absolute top-4 left-4 text-white text-sm font-medium px-3 py-1 rounded-full ${
            isLimitedSeats ? 'bg-orange-500' : 'bg-[#0D882B]'
          }`}>
            {availableSeats} spots left
          </div>
        )}

        {/* Right top badge - status */}
        {isSoldOut ? (
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded-full">
            Sold out
          </div>
        ) : event.discount && event.discount < event.price ? (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
            SALE
          </div>
        ) : null}

        {/* Right bottom badge - priceLabel */}
        {event.priceLabel && (
          <div className="absolute bottom-4 right-4 bg-primary text-black text-sm font-medium px-3 py-1 rounded-full shadow-md">
            {event.priceLabel}
          </div>
        )}
      </div>

      {/* Content - V1 style padding */}
      <div className="p-[20px_15px_35px] lg:p-[30px_30px_40px] flex flex-col flex-grow">
        <h3 className="font-serif text-[26px] lg:text-[36px] font-normal leading-[115%] mb-[15px] lg:mb-[20px]">
          {event.title}
        </h3>

        <div className="flex-grow">
          {/* Date & Time */}
          <div className="flex items-center text-[15px] leading-[150%] mb-[7px]">
            <img src="/assets/img/icon-date.svg" alt="" className="mr-[8px]" />
            <span>{formatDate(event.date)}, {getTimeDisplay()}</span>
          </div>

          {/* Price */}
          <div className="flex items-center text-[15px] leading-[150%] mb-[7px]">
            <img src="/assets/img/icon-price.svg" alt="" className="mr-[8px]" />
            <div className="flex items-center gap-2 flex-wrap">
              {event.discount && event.discount < event.price ? (
                <>
                  <span className="line-through text-gray-400">${event.price}</span>
                  <span className="font-bold text-[#0D882B]">${event.discount}</span>
                </>
              ) : (
                <span className="font-semibold">${event.price}</span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-[15px] leading-[150%] mb-0">
            <img src="/assets/img/icon-location.svg" alt="" className="mr-[8px]" />
            <span>{event.location}</span>
          </div>


          {/* Description */}
          {event.shortDescription && (
            <div className="text-[15px] mt-[15px] mb-[30px] leading-[150%]">
              {event.shortDescription}
            </div>
          )}
        </div>

        {/* Buy Button - V1 main-button style, full width */}
        <button
          onClick={() => onSignUp(event)}
          disabled={isSoldOut}
          className={`main-button !w-full ${isSoldOut ? '!bg-gray-400 !cursor-not-allowed' : ''}`}
        >
          {isSoldOut ? 'Sold out' : 'Buy'}
        </button>
      </div>
    </div>
  );
}
