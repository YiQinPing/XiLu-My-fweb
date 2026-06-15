import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ParticleCanvas } from "@/components/overlay/ParticleCanvas";
import { BottomRightWidget } from "@/components/overlay/BottomRightWidget";

export function AppLayout() {
  return (
    <div className="relative h-full w-full">
      {/* Layer 0: Particle background */}
      <ParticleCanvas />

      {/* Layer 10: Main layout */}
      <div className="relative z-10 flex h-full w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Content area */}
        <div className="relative flex-1 overflow-hidden">
          <main className="h-full overflow-auto">
            <Outlet />
          </main>

          {/* Bottom-right: AI entry + progress */}
          <BottomRightWidget />
        </div>
      </div>
    </div>
  );
}
