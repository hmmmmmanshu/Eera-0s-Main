import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Brain, Calendar, BarChart3 } from "lucide-react";

const mockDeals = {
  lead: [
    { id: 1, company: "Acme Corp", value: 45000, progress: 10, confidence: 65 },
    { id: 2, company: "TechStart Inc", value: 28000, progress: 15, confidence: 72 },
  ],
  contacted: [
    { id: 3, company: "Digital Solutions", value: 62000, progress: 35, confidence: 78 },
    { id: 4, company: "Cloud Systems", value: 38000, progress: 40, confidence: 81 },
  ],
  proposal: [
    { id: 5, company: "Enterprise Co", value: 95000, progress: 60, confidence: 88 },
  ],
  negotiation: [
    { id: 6, company: "Global Tech", value: 120000, progress: 85, confidence: 92 },
  ],
  won: [
    { id: 7, company: "Success Ltd", value: 78000, progress: 100, confidence: 100 },
  ],
};

const DealCard = ({ deal, stage }: { deal: any; stage: string }) => {
  const getStageColor = () => {
    if (stage === "won") return "bg-green-500/20 text-green-400 border-green-500/50";
    if (stage === "lost") return "bg-red-500/20 text-red-400 border-red-500/50";
    return "bg-[#007AFF]/20 text-[#007AFF] border-[#007AFF]/50";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-move"
    >
      <Card className="hover:border-accent/50 transition-all">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{deal.company}</h4>
              <p className="text-muted-foreground text-sm">${(deal.value / 1000).toFixed(0)}K</p>
            </div>
            <Badge className={getStageColor()}>
              {deal.progress}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span>{deal.progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${deal.progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Brain className="h-3 w-3 text-accent" />
            <span className="text-muted-foreground">AI Confidence:</span>
            <span className="text-accent font-semibold">{deal.confidence}%</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const PipelineBoard = () => {
  const stages = [
    { key: "lead", label: "Lead", color: "#6B7280" },
    { key: "contacted", label: "Contacted", color: "#3B82F6" },
    { key: "proposal", label: "Proposal Sent", color: "#8B5CF6" },
    { key: "negotiation", label: "Negotiation", color: "#F59E0B" },
    { key: "won", label: "Won", color: "#10B981" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          Smart Pipeline Tracking
        </CardTitle>
        <Tabs defaultValue="pipeline" className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pipeline" className="mt-6">
            <div className="grid grid-cols-5 gap-4">
              {stages.map((stage) => (
                <div key={stage.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{stage.label}</h4>
                    <Badge variant="outline" className="text-xs">
                      {mockDeals[stage.key as keyof typeof mockDeals].length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {mockDeals[stage.key as keyof typeof mockDeals].map((deal) => (
                      <DealCard key={deal.id} deal={deal} stage={stage.key} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4" />
              <p>Calendar view coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <Brain className="h-12 w-12 mb-4" />
              <p>AI insights loading...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};
