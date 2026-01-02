'use client';

import { useState } from 'react';
import { FAQ as FAQType } from '@/lib/strapi';

interface FAQProps {
  faqs: FAQType[];
}

export default function FAQ({ faqs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className="border border-gray-200 rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-base sm:text-lg font-medium text-gray-800 pr-4">
              {faq.question}
            </span>
            <svg
              className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div
              className="px-6 pb-4 text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
