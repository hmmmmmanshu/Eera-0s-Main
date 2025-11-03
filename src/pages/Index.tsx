import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HubsGrid from "@/components/HubsGrid";
import WhySection from "@/components/WhySection";
import BentoSection from "@/components/BentoSection";
import MarketingHub from "@/components/MarketingHub";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import WhyFoundersLove from "@/components/WhyFoundersLove";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HubsGrid />
      <WhySection />
      <BentoSection />
      <MarketingHub />
      <UnifiedDashboard />
      <WhyFoundersLove />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
