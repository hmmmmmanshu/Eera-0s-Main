import { Target, DollarSign, MoreVertical, Phone, Mail, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

const SalesHubMockup = () => {
  return (
    <div className="w-full h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">VIEWS</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium">
              All Deals
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              My Pipeline
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Outreach
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Won Deals
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">STAGES</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Qualified
              <span className="text-xs text-muted-foreground">64</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Demo
              <span className="text-xs text-muted-foreground">32</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Proposal
              <span className="text-xs text-muted-foreground">18</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Negotiation
              <span className="text-xs text-muted-foreground">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Sales Pipeline</h3>
              <p className="text-sm text-muted-foreground">$245K pipeline value • 28 active deals</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
                Filter
              </button>
              <button className="px-4 py-2 rounded-lg bg-foreground text-background text-sm">
                New Deal
              </button>
            </div>
          </div>

          {/* Deal Sections */}
          <div className="space-y-4">
            {/* Negotiation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Negotiation</span>
                <span className="text-xs text-muted-foreground">8 deals • $96K</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "SAL-542", company: "TechCorp Inc", contact: "Sarah Johnson", value: "$45K", probability: 85, nextAction: "Contract review", date: "Today, 3PM" },
                  { id: "SAL-543", company: "StartupXYZ", contact: "Michael Chen", value: "$28K", probability: 70, nextAction: "Pricing discussion", date: "Tomorrow, 10AM" },
                  { id: "SAL-544", company: "Enterprise Co", contact: "Emily Brown", value: "$65K", probability: 90, nextAction: "Final approval", date: "Dec 25, 2PM" },
                ].map((deal, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{deal.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-foreground/10 text-foreground">
                            {deal.probability}% likely
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">{deal.company}</div>
                        <div className="text-xs text-muted-foreground mb-2">{deal.contact}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {deal.date}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-muted text-foreground">
                            {deal.nextAction}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-base font-semibold">{deal.value}</div>
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-muted rounded">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Proposal Sent */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Proposal Sent</span>
                <span className="text-xs text-muted-foreground">18 deals • $162K</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "SAL-540", company: "InnovateLabs", contact: "David Kim", value: "$32K", sent: "2 days ago", followUp: "Tomorrow" },
                  { id: "SAL-541", company: "GrowthHub", contact: "Lisa Wang", value: "$28K", sent: "3 days ago", followUp: "In 2 days" },
                ].map((deal, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{deal.id}</span>
                          <span className="text-xs text-muted-foreground">Sent {deal.sent}</span>
                        </div>
                        <div className="text-sm font-medium mb-1">{deal.company}</div>
                        <div className="text-xs text-muted-foreground mb-2">{deal.contact}</div>
                        <div className="text-xs text-muted-foreground">
                          Follow up: {deal.followUp}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-base font-semibold">{deal.value}</div>
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-muted rounded">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Demo Scheduled */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Demo Scheduled</span>
                <span className="text-xs text-muted-foreground">32 deals • $256K</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "SAL-538", company: "CloudScale", contact: "Alex Rivera", value: "$38K", demo: "Today, 4PM", type: "Product Demo" },
                  { id: "SAL-539", company: "DataFlow Inc", contact: "Jordan Lee", value: "$42K", demo: "Tomorrow, 11AM", type: "Technical Demo" },
                ].map((deal, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{deal.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {deal.type}
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">{deal.company}</div>
                        <div className="text-xs text-muted-foreground mb-2">{deal.contact}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {deal.demo}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-base font-semibold">{deal.value}</div>
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-muted rounded">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesHubMockup;
