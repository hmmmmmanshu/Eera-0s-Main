import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ComposedChart,
} from "recharts";
import { useCashFlow } from "@/hooks/useFinanceData";
import { format } from "date-fns";

export function CashFlowChart() {
  const { data: cashFlowData = [], isLoading } = useCashFlow(6);

  // Transform data for chart
  let data = cashFlowData.map((cf) => ({
    month: format(new Date(cf.month), "MMM"),
    inflow: Number(cf.inflow) / 1000, // Convert to thousands
    outflow: Number(cf.outflow) / 1000,
    net: Number(cf.net_cash_flow) / 1000,
  }));

  // If no data, use placeholder
  if (data.length === 0 && !isLoading) {
    // Show placeholder data structure
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    data = months.map((month) => ({ month, inflow: 0, outflow: 0, net: 0 }));
  }

  const avgInflow = data.length > 0 ? data.reduce((sum, d) => sum + d.inflow, 0) / data.length : 0;
  const avgOutflow = data.length > 0 ? data.reduce((sum, d) => sum + d.outflow, 0) / data.length : 0;
  const avgNet = data.length > 0 ? data.reduce((sum, d) => sum + d.net, 0) / data.length : 0;

  if (isLoading) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-2">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="font-bold">${entry.value}K</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Cash Flow Forecast
          </span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">Outflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Net</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(346, 77%, 49%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(346, 77%, 49%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Area for Inflow */}
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  fill="url(#colorInflow)"
                  name="Inflow"
                />
                
                {/* Area for Outflow */}
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="hsl(346, 77%, 49%)"
                  strokeWidth={2}
                  fill="url(#colorOutflow)"
                  name="Outflow"
                />
                
                {/* Line for Net */}
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Net"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Inflow</p>
              <p className="text-2xl font-bold text-emerald-500">${avgInflow.toFixed(0)}K</p>
              <p className="text-xs text-emerald-500/70">+12% growth</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Outflow</p>
              <p className="text-2xl font-bold text-rose-500">${avgOutflow.toFixed(0)}K</p>
              <p className="text-xs text-rose-500/70">+3% increase</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Net Positive</p>
              <p className="text-2xl font-bold text-accent">${avgNet.toFixed(0)}K</p>
              <p className="text-xs text-accent/70">+24% margin</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
