import { Hero } from '@/components/site/hero';
import { Navbar } from '@/components/site/navbar';
import { PlaceholderSections } from '@/components/site/placeholder-sections';
import { PricingCards } from '@/components/site/pricing-cards';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <PricingCards />
        <PlaceholderSections />
      </main>
    </>
  );
}
