'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSuccess(true);
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 items-center">
      {/* Image Left - V1 Style */}
      <div className="w-full lg:w-1/2">
        <Image
          src="/assets/img/paint-photo.webp"
          alt="Art supplies"
          width={600}
          height={600}
          className="w-full h-auto"
        />
      </div>

      {/* Form Right - V1 Style */}
      <div className="w-full lg:w-5/12 mb-5 lg:mb-0">
        <h2 className="main-title text-center lg:text-left mb-[20px] lg:mb-[30px]">
          Let&apos;s get in touch
        </h2>

        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
            Thank you for your message! We&apos;ll get back to you soon.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          {/* Name */}
          <label className="text-[14px] font-semibold mb-[10px]">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            className="border border-[#B9B9B9] rounded-[50px] h-[50px] px-5 mb-2 outline-none focus:border-[#FFB785] transition-colors"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mb-3 text-sm text-red-500">{errors.name.message}</p>
          )}
          {!errors.name && <div className="mb-5" />}

          {/* Email */}
          <label className="text-[14px] font-semibold mb-[10px]">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            className="border border-[#B9B9B9] rounded-[50px] h-[50px] px-5 mb-2 outline-none focus:border-[#FFB785] transition-colors"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mb-3 text-sm text-red-500">{errors.email.message}</p>
          )}
          {!errors.email && <div className="mb-5" />}

          {/* Message */}
          <label className="text-[14px] font-semibold mb-[10px]">
            Add Your Message<span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('message')}
            rows={4}
            className="border border-[#B9B9B9] rounded-[35px] p-[15px_20px] mb-2 resize-none outline-none focus:border-[#FFB785] transition-colors"
            placeholder="How can we help you?"
          />
          {errors.message && (
            <p className="mb-5 text-sm text-red-500">{errors.message.message}</p>
          )}
          {!errors.message && <div className="mb-[30px]" />}

          {/* Submit Button */}
          <div className="flex justify-center lg:justify-start">
            <button
              type="submit"
              disabled={isLoading}
              className="main-button"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
