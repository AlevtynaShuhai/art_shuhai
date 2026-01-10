'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Event } from '@/lib/strapi';
import { trackBeginCheckout, trackFormSubmit } from '@/lib/analytics';
import { trackFBInitiateCheckout } from '@/components/Analytics/FacebookPixel';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().optional(),
  isSubscribed: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface OrderModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  cancellationPolicy?: string;
}

export default function OrderModal({
  event,
  isOpen,
  onClose,
  cancellationPolicy,
}: OrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);

  // Calculate available seats and max participants
  const availableSeats = event?.capacity != null
    ? event.capacity - (event.bookedSeats || 0)
    : null;
  const maxParticipants = availableSeats !== null ? Math.max(1, availableSeats) : 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isSubscribed: false,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimeDisplay = () => {
    if (!event) return '';
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

  const onSubmit = async (data: FormData) => {
    if (!event) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use discount price if available and lower than regular price
      const actualPrice = (event.discount && Number(event.discount) < Number(event.price))
        ? Number(event.discount)
        : Number(event.price);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          eventId: event.documentId,
          eventName: event.title,
          eventDate: formatDate(event.date),
          eventTime: getTimeDisplay(),
          eventPrice: actualPrice,
          eventLocation: event.location,
          participants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Track checkout initiation
      const totalPrice = actualPrice * participants;
      trackBeginCheckout([{
        id: event.documentId,
        name: event.title,
        price: totalPrice,
        quantity: participants,
      }]);
      trackFBInitiateCheckout(totalPrice);
      trackFormSubmit('order_form', { event_name: event.title });

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setParticipants(1);
    onClose();
  };

  if (!isOpen || !event) return null;

  const isRegularClass = event.eventType === 'regular';

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-[500px] lg:max-w-[900px] shadow-xl">
            {/* Header */}
            <div className="relative flex justify-center pt-[30px] lg:pt-[50px]">
              {/* Close Button - V1 style */}
              <button
                onClick={handleClose}
                className="absolute right-[27px] top-[27px] w-4 h-4 opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Close"
              >
                <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Title */}
              <h2 className="font-serif text-[26px] lg:text-[42px] font-normal leading-[115%] text-center mb-[15px] lg:mb-[25px] px-[20px] lg:px-[40px]">
                {isRegularClass ? 'Book regular classes' : 'Book art class'}
              </h2>
            </div>

            {/* Body - Two columns on desktop */}
            <div className="px-[15px] lg:px-[40px] pb-[40px] lg:pb-[50px]">
              <div className="flex flex-col lg:flex-row lg:gap-[40px]">
                {/* Left Column - Event Info */}
                <div className="lg:w-1/2">
                  {/* Description */}
                  {event.modalDescription && (
                    <div
                      className="text-[15px] leading-[150%] mb-4"
                      dangerouslySetInnerHTML={{ __html: event.modalDescription }}
                    />
                  )}

                  {/* Event Information */}
                  <div className="flex items-center gap-2 text-[15px] leading-[150%] mb-[7px]">
                    <img src="/assets/img/icon-date.svg" alt="" />
                    Date: {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2 text-[15px] leading-[150%] mb-[7px]">
                    <img src="/assets/img/icon_time.svg" alt="" />
                    Time: {getTimeDisplay()}
                  </div>
                  <div className="flex items-center gap-2 text-[15px] leading-[150%] mb-0">
                    <img src="/assets/img/icon-location.svg" alt="" />
                    Location: {event.location}
                  </div>

                  {/* What's Included */}
                  <div className="text-[18px] font-medium leading-[150%] mt-[20px] mb-[10px]">
                    What&apos;s Included:
                  </div>
                  <div className="text-[15px] leading-[150%] mb-[15px]">
                    All painting supplies provided {!isRegularClass && '+ snacks and drinks'} for absolute relaxation and immersion in
                    the friendly atmosphere of creativity
                  </div>

                  {/* Price per person */}
                  <div className="flex items-center gap-2 text-[15px] leading-[150%] mb-[10px] flex-wrap">
                    <img src="/assets/img/icon-price.svg" alt="" />
                    <span>Price per person:</span>
                    {event.discount && event.discount < event.price ? (
                      <>
                        <span className="line-through text-gray-400">${event.price}</span>
                        <span className="font-bold text-[#0D882B]">${event.discount}</span>
                        <span className="bg-red-100 text-red-600 text-[12px] px-2 py-0.5 rounded-full font-medium">
                          SALE
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">${event.price}</span>
                    )}
                    {event.priceLabel && (
                      <span className="bg-primary/20 text-primary-dark text-[12px] px-2 py-0.5 rounded-full">
                        {event.priceLabel}
                      </span>
                    )}
                  </div>

                  {/* Available Seats */}
                  {event.capacity != null && (
                    <div className={`flex items-center gap-2 text-[15px] leading-[150%] mb-[10px] ${
                      event.capacity - (event.bookedSeats || 0) <= 5 ? 'text-orange-600 font-medium' : ''
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Available spots: {event.capacity - (event.bookedSeats || 0)} of {event.capacity}
                    </div>
                  )}

                  {/* Participants Selector */}
                  <div className="flex items-center gap-3 text-[15px] leading-[150%] mb-[10px]">
                    <span className="font-medium">Participants:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setParticipants(p => Math.max(1, p - 1))}
                        disabled={participants <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-lg">{participants}</span>
                      <button
                        type="button"
                        onClick={() => setParticipants(p => Math.min(maxParticipants, p + 1))}
                        disabled={participants >= maxParticipants}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    {availableSeats !== null && participants >= maxParticipants && (
                      <span className="text-[13px] text-orange-600">Max available</span>
                    )}
                  </div>

                  {/* Total Price */}
                  {(() => {
                    const unitPrice = (event.discount && event.discount < event.price) ? event.discount : event.price;
                    const totalPrice = unitPrice * participants;
                    return (
                      <div className="flex items-center gap-2 text-[18px] leading-[150%] mb-[20px] lg:mb-0 font-semibold">
                        <span>Total:</span>
                        <span className="text-[#0D882B]">${totalPrice}</span>
                        {participants > 1 && (
                          <span className="text-[13px] font-normal text-gray-500">
                            (${unitPrice} × {participants})
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Right Column - Form */}
                <div className="lg:w-1/2 mt-[30px] lg:mt-0">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex flex-col">
                      <label htmlFor="name" className="text-[14px] font-semibold leading-[17px] mb-[10px]">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name')}
                        className="border border-[#B9B9B9] rounded-[50px] h-[50px] px-[20px] mb-[15px] outline-none focus:border-primary"
                      />
                      {errors.name && (
                        <p className="-mt-[10px] mb-[10px] text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col">
                      <label htmlFor="phone" className="text-[14px] font-semibold leading-[17px] mb-[10px]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone')}
                        className="border border-[#B9B9B9] rounded-[50px] h-[50px] px-[20px] mb-[15px] outline-none focus:border-primary"
                      />
                    </div>

                    {/* Email */}
                    <label htmlFor="email" className="text-[14px] font-semibold leading-[17px] mb-[10px] block">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className="w-full border border-[#B9B9B9] rounded-[50px] h-[50px] px-[20px] mb-[15px] outline-none focus:border-primary"
                    />
                    {errors.email && (
                      <p className="-mt-[10px] mb-[10px] text-sm text-red-500">{errors.email.message}</p>
                    )}

                    {/* Message */}
                    <label htmlFor="message" className="text-[14px] font-semibold leading-[17px] mb-[10px] block">
                      Add Your Message
                    </label>
                    <textarea
                      id="message"
                      {...register('message')}
                      placeholder="Any questions or special requests?"
                      className="w-full border border-[#B9B9B9] rounded-[25px] h-[80px] p-[12px_20px] mb-[15px] outline-none focus:border-primary resize-none"
                    />

                    {/* Subscribe Checkbox */}
                    <div className="flex items-center gap-[12px] mb-[20px]">
                      <input
                        type="checkbox"
                        id="subscribe"
                        {...register('isSubscribed')}
                        className="w-[18px] h-[18px] rounded-[5px] border border-[#999] cursor-pointer accent-primary"
                      />
                      <label htmlFor="subscribe" className="text-[14px] cursor-pointer">
                        Subscribe to updates and new events
                      </label>
                    </div>

                    {/* Submit Button & Cancellation Policy */}
                    <div className="flex flex-col items-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="main-button !w-full disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Proceed to check out'}
                      </button>

                      {/* Cancellation Policy */}
                      <div className="relative mt-3 group">
                        <button
                          type="button"
                          className="text-[14px] font-medium text-[#007bff] hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Cancellation Policy
                        </button>
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-full min-w-[288px] max-w-[400px] bg-white border border-[#ddd] rounded-[12px] p-[15px] text-[13px] leading-[1.5] shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[100] mb-2">
                          {cancellationPolicy ? (
                            <div dangerouslySetInnerHTML={{ __html: cancellationPolicy }} />
                          ) : (
                            <>
                              <p>
                                At Shuhai Art Studio, we strive to create a welcoming and well-prepared
                                experience for every participant.
                              </p>
                              <ul className="list-disc pl-5 my-2">
                                <li>Cancellations 2+ days before – refund minus 20%</li>
                                <li>Cancellations 24h before – 50% retained</li>
                                <li>Same-day/no-shows – non-refundable</li>
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
