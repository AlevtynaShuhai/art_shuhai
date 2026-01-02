'use client';

import { useState } from 'react';
import { FAQ as FAQType } from '@/lib/strapi';

interface FAQProps {
  faqs: FAQType[];
}

export default function FAQ({ faqs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-[25px] lg:space-y-[30px]">
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className={`rounded-[40px] overflow-hidden transition-all duration-300
            ${openIndex === index
              ? 'bg-[#FFB785]'
              : 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]'}`}
        >
          <button
            onClick={() => toggleFAQ(index)}
            className={`w-full text-left font-serif text-[26px] lg:text-[34px] font-normal leading-[100%] transition-all
              ${openIndex === index ? 'p-[30px_25px_0] lg:p-[40px_35px_0]' : 'p-[30px_25px] lg:p-[40px_35px]'}`}
          >
            {faq.question}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div
              className="p-[20px_25px_30px] lg:p-[30px_35px_40px] text-[15px] lg:text-[17px] leading-[140%]"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
