import Navigation from "@/components/ui/Navigation";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import SelectedWork from "@/components/sections/SelectedWork";
import Process from "@/components/sections/Process";
import GiganticCTA from "@/components/sections/GiganticCTA";

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen bg-bg-primary">
      <ScrollProgress />
      <Navigation />

      <div className="relative z-10">
        {/* Gemeinsamer Positions-Kontext: der Hero klebt per position:sticky darin,
            bis die cremefarbene Leistungen-Section sich vollständig über ihn
            geschoben hat. Die Klammer muss hier enden - Process und alles
            danach haben keinen eigenen Hintergrund, dort dürfte kein Hero-Rest
            mehr dahinterstehen. */}
        <div className="relative">
          <Hero />
          <Services />
        </div>

        <Process />

        {/* Cream über dunklem Prozess; About folgt flach ohne zweites Panel-Slide. */}
        <SelectedWork />

        {/* Keine Divider um „Über mich": Cream-Naht zu Projekte ist flach —
            About besitzt nur noch die untere Kante Richtung CTA. */}
        <About />

        <GiganticCTA />
      </div>
    </main>
  );
}
