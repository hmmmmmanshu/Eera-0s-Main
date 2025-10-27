import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, FileSignature } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const revenueData = [
  { month: "Jan", revenue: 450 },
  { month: "Feb", revenue: 520 },
  { month: "Mar", revenue: 580 },
  { month: "Apr", revenue: 620 },
  { month: "May", revenue: 720 },
  { month: "Jun", revenue: 847 },
];

const emailFlows = [
  { name: "Cold Outreach Q2", status: "active", sent: 450, opened: 234 },
  { name: "Product Launch Campaign", status: "completed", sent: 890, opened: 567 },
  { name: "Re-engagement Series", status: "active", sent: 320, opened: 145 },
  { name: "Newsletter May", status: "scheduled", sent: 0, opened: 0 },
];

const quotes = [
  { client: "Acme Corp", value: 45000, status: "pending" },
  { client: "Digital Solutions", value: 62000, status: "sent" },
  { client: "Enterprise Co", value: 95000, status: "signed" },
  { client: "Global Tech", value: 120000, status: "signed" },
];

export const SalesReportsTabs = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          Reports & Summaries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="emails">Email Flows</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="reports">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Revenue Trend</h4>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={revenueData}>
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="hsl(var(--accent))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--accent))", r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Current Month</span>
                        <span className="font-bold">$847K</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Quick Stats</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">Deals Closed</span>
                          <span className="font-bold">23</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">Avg Close Time</span>
                          <span className="font-bold">18 days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">Win Rate</span>
                          <span className="text-green-500 font-bold">76%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="emails">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {emailFlows.map((flow, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-accent" />
                          <div>
                            <h4 className="text-sm font-semibold">{flow.name}</h4>
                            <p className="text-muted-foreground text-xs">
                              Sent: {flow.sent} | Opened: {flow.opened}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            flow.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : flow.status === "completed"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {flow.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="quotes">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-muted-foreground text-xs font-medium py-3 px-4">Client</th>
                      <th className="text-left text-muted-foreground text-xs font-medium py-3 px-4">Quote Value</th>
                      <th className="text-left text-muted-foreground text-xs font-medium py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileSignature className="h-4 w-4 text-accent" />
                            <span className="text-sm">{quote.client}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          ${(quote.value / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              quote.status === "signed"
                                ? "bg-green-500/20 text-green-400"
                                : quote.status === "sent"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }
                          >
                            {quote.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
};
