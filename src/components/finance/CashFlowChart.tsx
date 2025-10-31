import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2, RefreshCw } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { syncCashFlow } from "@/lib/virtualCFO";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function CashFlowChart() {
  const { data: cashFlowData = [], isLoading, refetch } = useCashFlow(6);
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const handleSyncCashFlow = async () => {
    try {
      setSyncing(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await syncCashFlow(user.id, 6);
      await queryClient.invalidateQueries({ queryKey: ["cash-flow"] });
      await refetch();
      toast.success("Cash flow data synced successfully!");
    } catch (error: any) {
      console.error("Error syncing cash flow:", error);
      toast.error(`Failed to sync cash flow: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Transform data for chart
  let data = cashFlowData.map((cf) => ({
    month: format(new Date(cf.month), "MMM"),
    inflow: Number(cf.inflow) / 1000, // Convert to thousands
    outflow: Number(cf.outflow) / 1000,
    net: Number(cf.net_cash_flow) / 1000,
  }));

  // If no data, show empty state instead of placeholder
  if (data.length === 0 && !isLoading) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Cash Flow Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No cash flow data available</p>
            <p className="text-xs mt-2">Cash flow data will appear here once transactions are recorded</p>
          </div>
        </CardContent>
      </Card>
    );
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
                <span className="font-bold">₹{entry.value}K</span>
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
          <div className="flex items-center gap-4">
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
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncCashFlow}
              disabled={syncing}
              className="gap-2"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync Data
                </>
              )}
            </Button>
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
                  tickFormatter={(value) => `₹${value}K`}
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
              <p className="text-2xl font-bold text-emerald-500">₹{(avgInflow * 1000).toFixed(0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Outflow</p>
              <p className="text-2xl font-bold text-rose-500">₹{(avgOutflow * 1000).toFixed(0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Net Cash Flow</p>
              <p className={`text-2xl font-bold ${avgNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ₹{(avgNet * 1000).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
