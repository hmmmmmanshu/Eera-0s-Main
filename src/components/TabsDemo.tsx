import { AnimatedTabs } from "@/components/ui/animated-tabs";
import MarketingHubMockup from "@/components/hub-mockups/MarketingHubMockup";
import FinanceHubMockup from "@/components/hub-mockups/FinanceHubMockup";
import OpsHubMockup from "@/components/hub-mockups/OpsHubMockup";
import HiringHubMockup from "@/components/hub-mockups/HiringHubMockup";
import SalesHubMockup from "@/components/hub-mockups/SalesHubMockup";

export default function TabsDemo() {
  const tabs = [
    {
      title: "Marketing Hub",
      value: "marketing",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl text-foreground bg-card shadow-2xl border border-border backdrop-blur">
          <MarketingHubMockup />
        </div>
      ),
    },
    {
      title: "Finance Hub",
      value: "finance",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl text-foreground bg-card shadow-2xl border border-border backdrop-blur">
          <FinanceHubMockup />
        </div>
      ),
    },
    {
      title: "Ops Hub",
      value: "ops",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl text-foreground bg-card shadow-2xl border border-border backdrop-blur">
          <OpsHubMockup />
        </div>
      ),
    },
    {
      title: "Hiring Hub",
      value: "hiring",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl text-foreground bg-card shadow-2xl border border-border backdrop-blur">
          <HiringHubMockup />
        </div>
      ),
    },
    {
      title: "Sales Hub",
      value: "sales",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl text-foreground bg-card shadow-2xl border border-border backdrop-blur">
          <SalesHubMockup />
        </div>
      ),
    },
  ];

  return (
    <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative flex flex-col max-w-5xl mx-auto w-full items-start justify-start my-20">
      <AnimatedTabs tabs={tabs} />
    </div>
  );
}
