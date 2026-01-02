'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Event } from '@/lib/strapi';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Please add a message'),
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
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          eventId: event.id,
          eventName: event.title,
          eventDate: formatDate(event.date),
          eventTime: getTimeDisplay(),
          eventPrice: event.price,
          eventLocation: event.location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

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
          <div className="relative bg-white rounded-lg w-full max-w-[800px] shadow-xl">
            {/* Header */}
            <div className="relative flex justify-center pt-[50px] lg:pt-[50px]">
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
              <h2 className="font-serif text-[36px] lg:text-[42px] font-normal leading-[115%] text-center mb-[20px] lg:mb-[25px] px-[40px]">
                {isRegularClass ? 'Sign up for the regular classes' : 'Sign up for the art class'}
              </h2>
            </div>

            {/* Body */}
            <div className="px-[15px] lg:px-[40px] pb-[60px] lg:pb-[50px]">
              {/* Description */}
              {event.modalDescription && (
                <div
                  className="text-[16px] lg:text-[15px] leading-[150%] mb-4"
                  dangerouslySetInnerHTML={{ __html: event.modalDescription }}
                />
              )}

              {/* Event Information */}
              <div className="flex items-center gap-2 text-[16px] lg:text-[15px] leading-[150%] mb-[8px] lg:mb-[7px]">
                <img src="/assets/img/icon-date.svg" alt="" />
                Date: {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-2 text-[16px] lg:text-[15px] leading-[150%] mb-[8px] lg:mb-[7px]">
                <img src="/assets/img/icon_time.svg" alt="" />
                Time: {getTimeDisplay()}
              </div>
              <div className="flex items-center gap-2 text-[16px] lg:text-[15px] leading-[150%] mb-0">
                <img src="/assets/img/icon-location.svg" alt="" />
                Location: {event.location}
              </div>

              {/* What's Included */}
              <div className="text-[18px] lg:text-[20px] font-medium leading-[150%] mt-[20px] mb-[10px]">
                What&apos;s Included:
              </div>
              <div className="text-[16px] lg:text-[15px] leading-[150%] mb-[20px] lg:mb-[10px]">
                All painting supplies provided {!isRegularClass && '+ snacks and drinks'} for absolute relaxation and immersion in
                the friendly atmosphere of creativity
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 text-[16px] lg:text-[15px] leading-[150%] mb-[10px]">
                <img src="/assets/img/icon-price.svg" alt="" />
                Price: {event.price} $ per person {event.discount && `(${event.discount})`}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-[40px]">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Name & Phone Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-[20px]">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="text-[14px] font-semibold leading-[17px] mb-[10px]">
                      Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name')}
                      className="border border-[#B9B9B9] rounded-[50px] h-[50px] px-[20px] mb-[20px] outline-none focus:border-primary"
                    />
                    {errors.name && (
                      <p className="-mt-[15px] mb-[10px] text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="phone" className="text-[14px] font-semibold leading-[17px] mb-[10px]">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className="border border-[#B9B9B9] rounded-[50px] h-[50px] px-[20px] mb-[20px] outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Email */}
                <label htmlFor="email" className="text-[14px] font-semibold leading-[17px] mb-[10px] block">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="w-full border border-[#B9B9B9] rounded-[50px] h-[50px] px-[20px] mb-[20px] outline-none focus:border-primary"
                />
                {errors.email && (
                  <p className="-mt-[15px] mb-[10px] text-sm text-red-500">{errors.email.message}</p>
                )}

                {/* Message */}
                <label htmlFor="message" className="text-[14px] font-semibold leading-[17px] mb-[10px] block">
                  Add Your Message<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  className="w-full border border-[#B9B9B9] rounded-[35px] h-[100px] p-[15px_20px] mb-[20px] outline-none focus:border-primary resize-none"
                />
                {errors.message && (
                  <p className="-mt-[15px] mb-[10px] text-sm text-red-500">{errors.message.message}</p>
                )}

                {/* Subscribe Checkbox */}
                <div className="flex items-center gap-[16px] mb-[20px]">
                  <input
                    type="checkbox"
                    id="subscribe"
                    {...register('isSubscribed')}
                    className="w-[20px] h-[20px] rounded-[5px] border border-[#999] cursor-pointer accent-primary"
                  />
                  <label htmlFor="subscribe" className="text-[16px] cursor-pointer">
                    Subscribe to updates and new events
                  </label>
                </div>

                {/* Submit Button & Cancellation Policy */}
                <div className="flex flex-col items-center mt-[16px]">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="main-button disabled:opacity-50"
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
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-full min-w-[288px] max-w-[500px] bg-white border border-[#ddd] rounded-[12px] p-[15px] text-[14px] leading-[1.5] shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[100] mb-2">
                      {cancellationPolicy ? (
                        <div dangerouslySetInnerHTML={{ __html: cancellationPolicy }} />
                      ) : (
                        <>
                          <p>
                            At Shuhai Art Studio, we strive to create a welcoming and well-prepared
                            experience for every participant.
                            To ensure fairness and to cover the costs involved in preparing for each
                            class, we kindly ask you to review our cancellation terms:
                          </p>
                          <ul className="list-disc pl-5 my-2">
                            <li>Cancellations 2 or more days before the workshop – a refund will be
                              issued minus 20% to cover materials and administrative expenses.</li>
                            <li>For cancellations made 24 hours before the start of the workshop, 50% of
                              the payment will be retained, as materials and studio preparation have
                              already been arranged.
                            </li>
                            <li>Same-day cancellations or no-shows – the payment is non-refundable, as
                              your reserved spot and materials cannot be reassigned.</li>
                          </ul>
                          <p className="mb-0">We appreciate your understanding and continued support of our
                            studio.</p>
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
  );
}
