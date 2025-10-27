import { DollarSign, TrendingDown, TrendingUp, MoreVertical, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const FinanceHubMockup = () => {
  return (
    <div className="w-full h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">OVERVIEW</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium">
              Dashboard
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Transactions
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Runway
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Reports
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">CATEGORIES</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Salaries
              <span className="text-xs text-muted-foreground">64%</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Infrastructure
              <span className="text-xs text-muted-foreground">21%</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Marketing
              <span className="text-xs text-muted-foreground">11%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-4">
          {/* Header Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Cash Balance", value: "$504K", change: "+8%", trend: "up" },
              { label: "Monthly Burn", value: "$28K", change: "-5%", trend: "down" },
              { label: "Runway", value: "18 mo", change: "Healthy", trend: "neutral" },
              { label: "MRR", value: "$45K", change: "+12%", trend: "up" },
            ].map((stat, i) => (
              <Card key={i} className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className={`text-xs flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-foreground' : 
                  stat.trend === 'down' ? 'text-muted-foreground' : 
                  'text-muted-foreground'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {stat.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
                View All
              </button>
            </div>
            
            <div className="space-y-2">
              {[
                { id: "TXN-1847", description: "AWS Cloud Services", category: "Infrastructure", amount: "-$2,450", date: "Today", status: "Completed" },
                { id: "TXN-1846", description: "Employee Salaries - December", category: "Salaries", amount: "-$18,000", date: "Today", status: "Completed" },
                { id: "TXN-1845", description: "Customer Payment - Acme Corp", category: "Revenue", amount: "+$12,500", date: "Yesterday", status: "Completed" },
                { id: "TXN-1844", description: "Google Ads Campaign", category: "Marketing", amount: "-$3,200", date: "2 days ago", status: "Completed" },
                { id: "TXN-1843", description: "Office Supplies", category: "Operations", amount: "-$450", date: "3 days ago", status: "Pending" },
              ].map((txn, i) => (
                <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{txn.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                          {txn.category}
                        </span>
                      </div>
                      <div className="text-sm font-medium mb-1">{txn.description}</div>
                      <div className="text-xs text-muted-foreground">{txn.date}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-base font-semibold ${
                        txn.amount.startsWith('+') ? 'text-foreground' : 'text-foreground'
                      }`}>
                        {txn.amount}
                      </div>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Alert */}
          <Card className="p-4 border-foreground/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium mb-1">Runway Update</div>
                <div className="text-xs text-muted-foreground">
                  Based on current burn rate, you have 18 months of runway. Consider reviewing expenses in the Infrastructure category.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinanceHubMockup;
