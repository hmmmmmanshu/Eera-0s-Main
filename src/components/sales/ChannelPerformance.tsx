import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const channelData = [
  { channel: "LinkedIn", conversion: 32, leads: 145, revenue: 284 },
  { channel: "Email", conversion: 24, leads: 203, revenue: 198 },
  { channel: "Website", conversion: 18, leads: 167, revenue: 156 },
  { channel: "Referrals", conversion: 42, leads: 89, revenue: 342 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-accent/50 rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{data.channel}</p>
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground">Conversion: <span className="font-bold">{data.conversion}%</span></p>
          <p className="text-muted-foreground">Total Leads: <span className="font-bold">{data.leads}</span></p>
          <p className="text-muted-foreground">Revenue: <span className="font-bold">${data.revenue}K</span></p>
        </div>
        {data.channel === "LinkedIn" && (
          <p className="text-accent text-xs mt-2 italic">
            LinkedIn performing 12% better than Email this week.
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const ChannelPerformance = () => {
  const colors = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--muted))"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Top Performing Channels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="channel"
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
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="conversion" radius={[8, 8, 0, 0]}>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Leads by Channel</p>
              <div className="space-y-2">
                {channelData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span>{item.channel}</span>
                    <span className="text-accent font-semibold">{item.leads}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Revenue by Channel</p>
              <div className="space-y-2">
                {channelData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span>{item.channel}</span>
                    <span className="text-accent font-semibold">${item.revenue}K</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
