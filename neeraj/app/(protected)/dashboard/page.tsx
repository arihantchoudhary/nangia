import { ConversationDashboard } from "@/components/dashboard/conversation-dashboard"
import { AnimatedBackground } from "@/components/animated-background"
import { HeroSection } from "@/components/hero-section"
import { Header } from "@/components/header"
import { Toaster } from "sonner"

export default function DashboardPage() {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <ConversationDashboard />
      </div>
      <Toaster />
    </>
  )
}