import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Award, Clock } from "lucide-react";

export function PerformanceAppraisals() {
  const performanceData = [
    { name: "John Doe", role: "Engineering Lead", rating: 4.5, progress: 90, period: "Q4 2024", status: "Complete" },
    { name: "Jane Smith", role: "Product Manager", rating: 4.8, progress: 95, period: "Q4 2024", status: "Complete" },
    { name: "Mike Johnson", role: "Senior Developer", rating: 4.2, progress: 70, period: "Q4 2024", status: "In Progress" },
    { name: "Sarah Williams", role: "UX Designer", rating: 4.6, progress: 85, period: "Q4 2024", status: "Complete" },
  ];

  const metrics = [
    { label: "Average Performance", value: "4.2/5", icon: TrendingUp, color: "text-green-500" },
    { label: "On-Track OKRs", value: "87%", icon: Target, color: "text-blue-500" },
    { label: "Top Performers", value: "6", icon: Award, color: "text-amber-500" },
    { label: "Reviews Pending", value: "3", icon: Clock, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold mt-2">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Performance Reviews
            </CardTitle>
            <Button>
              <Award className="h-4 w-4 mr-2" />
              Generate Appraisals
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {performanceData.map((review, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border hover:border-accent/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.role}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{review.rating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <Badge variant={review.status === "Complete" ? "default" : "outline"}>
                    {review.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Review Progress</span>
                  <span className="font-medium">{review.progress}%</span>
                </div>
                <Progress value={review.progress} className="h-2" />
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">View Details</Button>
                <Button size="sm" variant="outline">Download Report</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* OKR Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            OKR Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-lg">
            <div className="text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Track team objectives and key results</p>
              <Button variant="outline" className="mt-4">Set Team OKRs</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
