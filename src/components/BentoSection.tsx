import { FileText, Bell, Share2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import AnimatedBeamMultipleOutputDemo from "@/components/AnimatedBeamDemo";
import AnimatedListDemo from "@/components/AnimatedListDemo";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";

const files = [
  {
    name: "marketing-strategy.pdf",
    body: "Comprehensive content marketing plan with platform-specific strategies for LinkedIn, Instagram, and YouTube.",
  },
  {
    name: "financial-projections.xlsx",
    body: "18-month runway forecast with burn rate analysis and revenue projections across all customer segments.",
  },
  {
    name: "brand-assets.svg",
    body: "Complete brand kit including logos, color palettes, typography guidelines, and visual identity system.",
  },
  {
    name: "hiring-pipeline.doc",
    body: "Active candidate tracking with interview schedules, assessment scores, and offer preparation timelines.",
  },
  {
    name: "sales-playbook.txt",
    body: "Scripted outreach templates, objection handling guides, and proven closing techniques for enterprise deals.",
  },
];

const features = [
  {
    Icon: FileText,
    name: "Built-in Publishing",
    description: "Automatically create and schedule content across all platforms from one dashboard.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-border bg-card hover:bg-secondary/50",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs text-muted-foreground">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Bell,
    name: "Real-time Notifications",
    description: "Get instant updates on marketing posts, finance changes, ops tasks, legal documents, and sales wins.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2,
    name: "Unified Hub System",
    description: "All six hubs connected in one operating system - Marketing, Sales, Finance, Tech, Ops, and Legal.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute top-4 right-2 h-[300px] border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: "Smart Scheduling",
    description: "AI-powered calendar that optimizes your content posting, meetings, and task management.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <Calendar
        mode="single"
        selected={new Date(2025, 4, 15, 0, 0, 0)}
        className="absolute top-10 right-0 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
      />
    ),
  },
];

const BentoSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-up">
            <h2 className="text-balance">
              The future belongs to small, powerful teams.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              The next billion-dollar companies will be built by teams of 2–3 people. EERA is the tool that makes it possible.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto pt-4">
              EERA combines the intelligence of a 10-member team in one adaptive workspace. It's not just AI - it's your co-founder, coach, mentor, and friend.
            </p>
          </div>

          <BentoGrid>
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
};

export default BentoSection;
