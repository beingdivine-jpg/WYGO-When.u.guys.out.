import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import GoldenWindowsSection from "@/components/GoldenWindowsSection";
import CrewSection from "@/components/CrewSection";
import SquadSyncSection from "@/components/SquadSyncSection";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [activeNav, setActiveNav] = useState("pulse");

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <GoldenWindowsSection />
      <CrewSection />
      <SquadSyncSection />

      {/* Spacer for bottom nav */}
      <div className="h-24" />

      <BottomNav active={activeNav} onNavigate={setActiveNav} />
    </div>
  );
};

export default Index;
