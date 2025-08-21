import { ConversationDashboard } from "@/components/dashboard/conversation-dashboard"
import { AnimatedBackground } from "@/components/animated-background"
import { HeroSection } from "@/components/hero-section"
import { Toaster } from "sonner"

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10">
        <HeroSection />
        <ConversationDashboard />
      </div>
      <Toaster />
    </>
  )
}