'use client';

import { Settings } from '@/lib/strapi';

interface FooterProps {
  settings?: Settings;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="relative">
      {/* Decorative paint effect on top - V1 Style */}
      <div
        className="absolute left-0 top-[-2px] w-full h-[66px] lg:h-[127px] z-10 pointer-events-none"
        style={{
          background: 'url(/assets/img/footer-bg.png) center bottom no-repeat',
          backgroundSize: 'cover'
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Contacts Right (on desktop) - V1 Style */}
        <div className="bg-[#FFB785] pt-[96px] lg:pt-[160px] pb-[30px] lg:pb-[40px] pl-[15px] lg:pl-[70px] pr-[15px] lg:pr-0 order-2 lg:order-2">
          <h3 className="font-serif text-[32px] lg:text-[50px] font-normal leading-[115%] mb-[24px] lg:mb-[36px]">
            Contacts
          </h3>

          {/* Email */}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center font-sans text-[16px] font-medium leading-[140%] mb-[13px] hover:opacity-70 transition-opacity"
            >
              <img src="/assets/img/icon-email.svg" alt="" className="mr-[8px]" />
              {settings.email}
            </a>
          )}

          {/* Address */}
          {settings?.address && (
            <div className="flex items-start font-sans text-[16px] font-medium leading-[140%] mb-0">
              <img src="/assets/img/icon-location-black.svg" alt="" className="mr-[8px] mt-1" />
              <span>{settings.address}</span>
            </div>
          )}

          {/* Social Links - V1 Style */}
          <div className="font-serif text-[22px] font-normal leading-[140%] mt-[22px] mb-[18px]">
            Follow us on social media
          </div>
          <div className="flex">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-[20px] hover:opacity-70 transition-opacity"
                aria-label="Instagram"
              >
                <img src="/assets/img/icon-instagram.svg" alt="Instagram" />
              </a>
            )}
            {settings?.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
                aria-label="Facebook"
              >
                <img src="/assets/img/icon-facebook.svg" alt="Facebook" />
              </a>
            )}
          </div>
        </div>

        {/* Map Left (on desktop) - V1 Style */}
        <div className="h-[320px] lg:h-auto order-1 lg:order-1 min-h-[400px]">
          {settings?.googleMapsEmbed ? (
            <div
              dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
            />
          ) : (
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2508.6876736788!2d-114.08194!3d51.0419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDAyJzMwLjgiTiAxMTTCsDA0JzU1LjAiVw!5e0!3m2!1sen!2sca!4v1635000000000!5m2!1sen!2sca"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </div>
    </footer>
  );
}
