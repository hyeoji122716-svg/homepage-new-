import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AchievementsSection from "@/components/AchievementsSection";
import PortfolioSection from "@/components/PortfolioSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <AboutSection />
        <AchievementsSection />
        <PortfolioSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
