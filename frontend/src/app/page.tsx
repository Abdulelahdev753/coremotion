import { Hero } from '@/components/site/hero';
import { Navbar } from '@/components/site/navbar';
import { PlaceholderSections } from '@/components/site/placeholder-sections';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <PlaceholderSections />
      </main>
    </>
  );
}
