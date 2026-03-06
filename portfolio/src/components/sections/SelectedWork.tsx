import FlipCard from "@/components/ui/FlipCard";
import TextReveal from "@/components/ui/TextReveal";
import { PROJECTS } from "@/lib/constants";

export default function SelectedWork() {
  return (
    <section id="work" className="relative py-section">
      <div className="container-custom">
        {/* Section Header */}
        <div className="mb-24 md:mb-32">
          <span className="text-caption font-mono uppercase tracking-widest text-text-muted block mb-4">
            01 — Was ich gebaut habe
          </span>
          <TextReveal
            as="h2"
            variant="words"
            className="text-display-sm md:text-display-md font-display font-bold tracking-tighter"
          >
            Was ich gebaut habe
          </TextReveal>
        </div>

        {/* Project Cards */}
        <div className="max-w-5xl mx-auto">
          {PROJECTS.map((project, index) => (
            <FlipCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
