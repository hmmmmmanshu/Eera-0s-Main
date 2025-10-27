import { TrendingUp, MoreVertical, Calendar, Eye, Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const MarketingHubMockup = () => {
  return (
    <div className="w-full h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">CONTENT</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium">
              Posts
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Calendar
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Analytics
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Brand Kit
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">PLATFORMS</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              LinkedIn
              <span className="text-xs text-muted-foreground">45</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Instagram
              <span className="text-xs text-muted-foreground">78</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              YouTube
              <span className="text-xs text-muted-foreground">33</span>
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
              <h3 className="text-lg font-semibold">Content Pipeline</h3>
              <p className="text-sm text-muted-foreground">156 posts • 12.3% avg engagement</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
                Filter
              </button>
              <button className="px-4 py-2 rounded-lg bg-foreground text-background text-sm">
                New Post
              </button>
            </div>
          </div>

          {/* Status Sections */}
          <div className="space-y-4">
            {/* Scheduled */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Scheduled</span>
                <span className="text-xs text-muted-foreground">8</span>
              </div>
              <div className="space-y-2">
                {[
                  { platform: "LinkedIn", title: "Launch announcement for Q1 feature", date: "Today, 2:00 PM", status: "Ready" },
                  { platform: "Instagram", title: "Behind the scenes: team culture", date: "Tomorrow, 9:00 AM", status: "Rendering" },
                  { platform: "YouTube", title: "Product demo walkthrough", date: "Dec 25, 3:00 PM", status: "Processing" },
                ].map((post, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {post.platform}
                          </span>
                          <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <div className="text-sm font-medium mb-2">{post.title}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Est. 2.4K
                          </span>
                          <span className={`px-2 py-0.5 rounded ${
                            post.status === 'Ready' ? 'bg-foreground/10 text-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Published */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Published</span>
                <span className="text-xs text-muted-foreground">145</span>
              </div>
              <div className="space-y-2">
                {[
                  { platform: "LinkedIn", title: "Year in review: 2024 milestones", engagement: "12.8%", views: "8.2K", date: "2 days ago" },
                  { platform: "Instagram", title: "Customer success story", engagement: "15.2%", views: "5.4K", date: "3 days ago" },
                ].map((post, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {post.platform}
                          </span>
                          <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                        <div className="text-sm font-medium mb-2">{post.title}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.engagement}
                          </span>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
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

export default MarketingHubMockup;
