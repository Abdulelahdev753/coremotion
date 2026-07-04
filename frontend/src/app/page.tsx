import { AboutSection } from '@/components/site/about-section';
import { FaqSection } from '@/components/site/faq-section';
import { Hero } from '@/components/site/hero';
import { Navbar } from '@/components/site/navbar';
import { PackagesSection } from '@/components/site/packages-section';
import { SiteFooter } from '@/components/site/site-footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <PackagesSection />
        <FaqSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </>
  );
}
