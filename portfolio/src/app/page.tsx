import Navigation from "@/components/ui/Navigation";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import SelectedWork from "@/components/sections/SelectedWork";
import Process from "@/components/sections/Process";
import GiganticCTA from "@/components/sections/GiganticCTA";
import SectionDivider from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen bg-bg-primary">
      <ScrollProgress />
      <Navigation />

      <div className="relative z-10">
        {/* Gemeinsamer Positions-Kontext: der Hero klebt per position:sticky darin,
            bis die cremefarbene Projekte-Section sich vollständig über ihn
            geschoben hat. Die Klammer muss hier enden - Process und alles
            danach haben keinen eigenen Hintergrund, dort dürfte kein Hero-Rest
            mehr dahinterstehen. */}
        <div className="relative">
          <Hero />

          {/* No dividers around SelectedWork — the cream section owns both edges */}
          <SelectedWork />
        </div>

        <Process />

        <SectionDivider />

        <Manifesto />

        <SectionDivider />

        <GiganticCTA />
      </div>
    </main>
  );
}
