'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Settings, getStrapiMediaUrl } from '@/lib/strapi';

interface HeaderProps {
  settings?: Settings;
}

export default function Header({ settings }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 pt-5">
      <div className="container mx-auto px-[15px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {settings?.logoDesktop ? (
              <Image
                src={getStrapiMediaUrl(settings.logoDesktop)}
                alt={settings.siteName || 'Art Classes'}
                width={131}
                height={80}
                className="h-[80px] w-auto hidden lg:block"
              />
            ) : (
              <span className="text-2xl font-serif text-white">
                Art Classes with Alevtyna
              </span>
            )}
            {settings?.logoMobile ? (
              <Image
                src={getStrapiMediaUrl(settings.logoMobile)}
                alt={settings.siteName || 'Art Classes'}
                width={90}
                height={55}
                className="h-[55px] w-auto lg:hidden"
              />
            ) : (
              <span className="text-xl font-serif text-white lg:hidden">
                Art Classes
              </span>
            )}
          </Link>

          {/* Social Links */}
          <div className="flex items-center gap-[20px]">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <img
                  src="/assets/img/icon-instagram-white.svg"
                  alt="Instagram"
                  width={28}
                  height={28}
                />
              </a>
            )}
            {settings?.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <img
                  src="/assets/img/icon-facebook-white.svg"
                  alt="Facebook"
                  width={28}
                  height={28}
                />
              </a>
            )}
            <span className="text-white text-[16px] font-medium hidden lg:inline">
              follow us on social media
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
