import SceneLoader from "@/components/canvas/SceneLoader";
import Navigation from "@/components/ui/Navigation";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import SelectedWork from "@/components/sections/SelectedWork";
import BentoGrid from "@/components/sections/BentoGrid";
import GiganticCTA from "@/components/sections/GiganticCTA";
import SectionDivider from "@/components/ui/SectionDivider";
import BackgroundGlows from "@/components/ui/BackgroundGlows";
import CanvasErrorBoundary from "@/components/canvas/CanvasErrorBoundary";

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen bg-bg-primary">
      <CanvasErrorBoundary>
        <SceneLoader />
      </CanvasErrorBoundary>
      <BackgroundGlows />

      <ScrollProgress />
      <Navigation />

      <div className="relative z-10">
        <Hero />

        <SectionDivider />

        <SelectedWork />

        <SectionDivider />

        <BentoGrid />

        <SectionDivider />

        <Manifesto />

        <SectionDivider />

        <GiganticCTA />
      </div>
    </main>
  );
}
