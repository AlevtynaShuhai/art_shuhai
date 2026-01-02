import { Suspense } from 'react';
import { getEvents, getArtworks, getFAQs, getHomepage, getSettings, Event } from '@/lib/strapi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePageClient from './HomePageClient';

// Revalidate every 5 minutes
export const revalidate = 300;

async function getData() {
  try {
    const [eventsRes, studentArtworks, instructorArtworks, faqsRes, homepageRes, settingsRes] = await Promise.all([
      getEvents({ populate: '*', sort: ['date:asc'] }),
      getArtworks('student'),
      getArtworks('instructor'),
      getFAQs(),
      getHomepage(),
      getSettings(),
    ]);

    // Filter out past events
    const now = new Date();
    const activeEvents = eventsRes.data.filter((event: Event) => {
      const eventDate = new Date(event.date);
      return eventDate >= now && event.isActive;
    });

    return {
      events: activeEvents,
      regularEvents: eventsRes.data.filter((e: Event) => e.eventType === 'regular'),
      studentArtworks: studentArtworks.data,
      instructorArtworks: instructorArtworks.data,
      faqs: faqsRes.data,
      homepage: homepageRes.data,
      settings: settingsRes.data,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      events: [],
      regularEvents: [],
      studentArtworks: [],
      instructorArtworks: [],
      faqs: [],
      homepage: null,
      settings: null,
    };
  }
}

export default async function HomePage() {
  const data = await getData();

  return (
    <>
      <Header settings={data.settings || undefined} />

      <main>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <HomePageClient
            events={data.events}
            regularEvents={data.regularEvents}
            studentArtworks={data.studentArtworks}
            instructorArtworks={data.instructorArtworks}
            faqs={data.faqs}
            homepage={data.homepage}
            settings={data.settings}
          />
        </Suspense>
      </main>

      <Footer settings={data.settings || undefined} />
    </>
  );
}
