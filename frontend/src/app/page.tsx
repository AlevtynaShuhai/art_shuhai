import { Suspense } from 'react';
import { getEvents, getArtworks, getFAQs, getHomepage, getSettings, Event } from '@/lib/strapi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePageClient from './HomePageClient';

// Revalidate every 5 minutes
export const revalidate = 300;

async function getData() {
  const [eventsRes, studentArtworks, instructorArtworks, faqsRes, homepageRes, settingsRes] = await Promise.all([
    getEvents({ populate: '*', sort: ['date:asc'] }),
    getArtworks('student'),
    getArtworks('instructor'),
    getFAQs(),
    getHomepage(),
    getSettings(),
  ]);

  // Handle null responses (Strapi not available)
  const events = eventsRes?.data || [];
  const allStudentArtworks = studentArtworks?.data || [];
  const allInstructorArtworks = instructorArtworks?.data || [];
  const faqs = faqsRes?.data || [];
  const homepage = homepageRes?.data || null;
  const settings = settingsRes?.data || null;

  // Filter out past events
  const now = new Date();
  const activeEvents = events.filter((event: Event) => {
    const eventDate = new Date(event.date);
    return eventDate >= now && event.isActive;
  });

  return {
    events: activeEvents,
    regularEvents: events.filter((e: Event) => e.eventType === 'regular'),
    studentArtworks: allStudentArtworks,
    instructorArtworks: allInstructorArtworks,
    faqs,
    homepage,
    settings,
  };
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
