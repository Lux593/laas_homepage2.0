"use client";

import { motion } from "framer-motion";
import { Database, Cpu, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const COLORS = {
  primary: "#C49F7B",
  secondary: "#DFBE9F",
  warm: "#A07850",
};

const BAR_DURATION = 1.2;

function WorkflowScene() {
  const [activeStep, setActiveStep] = useState(0);
  const [reachedStep, setReachedStep] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (activeStep === 0) {
      setReachedStep(0);
    } else if (activeStep === 3) {
      setReachedStep(3);
    } else {
      timeoutRef.current = setTimeout(() => {
        setReachedStep(activeStep);
      }, BAR_DURATION * 1000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeStep]);

  const progress =
    activeStep === 0 ? 0 : activeStep === 1 ? 50 : activeStep === 2 ? 100 : 100;

  return (
    <div className="w-full px-6 md:px-10 py-2">
      {/* Wrapper mit fester Höhe für Icons + Labels */}
      <div className="relative flex items-start justify-between">

        {/* Linien-Container — zentriert auf Kachel-Mitte */}
        <div className="absolute left-5 right-5 sm:left-6 sm:right-6 top-5 sm:top-6 h-[2px]">
          {/* Statische Hintergrund-Linie */}
          <div className="absolute inset-0 bg-white/[0.06] rounded-full" />
          {/* Animierte Fortschrittslinie */}
          <motion.div
            className="absolute inset-y-0 left-0 right-0 origin-left rounded-full"
            style={{
              background: `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.primary}, ${COLORS.warm})`,
            }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: BAR_DURATION, ease: "easeInOut" }}
          />
        </div>

        {/* Nodes */}
        <WorkflowNode
          icon={Database}
          label="Daten"
          step={1}
          isActive={reachedStep === 0}
          isCompleted={reachedStep >= 1}
          color={COLORS.secondary}
        />
        <WorkflowNode
          icon={Cpu}
          label="Automation"
          step={2}
          isActive={reachedStep === 1}
          isCompleted={reachedStep >= 2}
          color={COLORS.primary}
        />
        <WorkflowNode
          icon={CheckCircle2}
          label="Ergebnis"
          step={3}
          isActive={reachedStep === 2}
          isCompleted={reachedStep >= 3}
          color={COLORS.warm}
        />
      </div>
    </div>
  );
}

function WorkflowNode({
  icon: Icon,
  label,
  step,
  isActive,
  isCompleted,
  color,
}: {
  icon: any;
  label: string;
  step: number;
  isActive: boolean;
  isCompleted?: boolean;
  color: string;
}) {
  const highlighted = isActive || isCompleted;

  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <div
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border transition-all duration-500"
        style={{
          borderColor: highlighted ? color : "rgba(255,255,255,0.08)",
          background: "#0a0a0a",
          boxShadow: isActive ? `0 0 16px ${color}15` : "none",
        }}
      >
        <Icon
          size={18}
          color={highlighted ? color : "#525252"}
          strokeWidth={1.5}
        />
      </div>
      <span
        className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider transition-all duration-500"
        style={{
          color: highlighted ? color : "#525252",
          opacity: highlighted ? 1 : 0.4,
        }}
      >
        {step}. {label}
      </span>
    </div>
  );
}

export default WorkflowScene;
