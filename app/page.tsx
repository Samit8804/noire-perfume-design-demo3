import MotionProvider from "@/components/motion-provider";
import SiteHeader from "@/components/site-header";
import Hero from "@/components/hero";
import Stats from "@/components/stats";
import BrandIntro from "@/components/brand-intro";
import StoryFilm from "@/components/story-film";
import Storytelling from "@/components/storytelling";
import BrandPillars from "@/components/brand-pillars";
import Collection from "@/components/collection";
import CraftJourney from "@/components/craft-journey";
import Journal from "@/components/journal";
import FinalCta from "@/components/final-cta";
import SiteFooter from "@/components/site-footer";

export default function Home() {
  return (
    <MotionProvider>
      <SiteHeader />
      <main>
        <Hero />
        <Stats />
        <BrandIntro />
        <StoryFilm />
        <Storytelling />
        <BrandPillars />
        <Collection />
        <CraftJourney />
        <Journal />
        <FinalCta />
      </main>
      <SiteFooter />
    </MotionProvider>
  );
}
