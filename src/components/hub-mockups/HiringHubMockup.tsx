import { Users, Star, MoreVertical, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";

const HiringHubMockup = () => {
  return (
    <div className="w-full h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">PIPELINE</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium">
              All Candidates
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Shortlisted
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Interviews
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Offers
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">OPEN ROLES</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Senior Engineer
              <span className="text-xs text-muted-foreground">45</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Product Designer
              <span className="text-xs text-muted-foreground">32</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Marketing Lead
              <span className="text-xs text-muted-foreground">28</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Sales Manager
              <span className="text-xs text-muted-foreground">43</span>
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
              <h3 className="text-lg font-semibold">Hiring Pipeline</h3>
              <p className="text-sm text-muted-foreground">148 total candidates • 23 shortlisted • 8 interviews scheduled</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
                Filter
              </button>
              <button className="px-4 py-2 rounded-lg bg-foreground text-background text-sm">
                Add Candidate
              </button>
            </div>
          </div>

          {/* Candidate Sections */}
          <div className="space-y-4">
            {/* Interview Scheduled */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Interview Scheduled</span>
                <span className="text-xs text-muted-foreground">8</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "HRE-328", name: "Sarah Chen", role: "Senior Engineer", score: 95, interview: "Today, 2:00 PM", stage: "Technical Interview" },
                  { id: "HRE-329", name: "Michael Park", role: "Product Designer", score: 92, interview: "Tomorrow, 10:00 AM", stage: "Portfolio Review" },
                  { id: "HRE-330", name: "Emily Wilson", role: "Marketing Lead", score: 88, interview: "Dec 25, 3:00 PM", stage: "Culture Fit" },
                ].map((candidate, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{candidate.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {candidate.role}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-foreground text-foreground" />
                            <span className="text-xs text-foreground">{candidate.score}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium mb-2">{candidate.name}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{candidate.interview}</span>
                          <span className="px-2 py-0.5 rounded bg-foreground/10 text-foreground">
                            {candidate.stage}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-muted rounded">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Shortlisted */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Shortlisted</span>
                <span className="text-xs text-muted-foreground">23</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "HRE-325", name: "David Kumar", role: "Sales Manager", score: 85, experience: "8 years", location: "Remote" },
                  { id: "HRE-326", name: "Lisa Martinez", role: "Senior Engineer", score: 91, experience: "10 years", location: "San Francisco" },
                  { id: "HRE-327", name: "James Anderson", role: "Product Designer", score: 87, experience: "6 years", location: "New York" },
                ].map((candidate, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{candidate.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {candidate.role}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-foreground text-foreground" />
                            <span className="text-xs text-foreground">{candidate.score}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium mb-2">{candidate.name}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{candidate.experience}</span>
                          <span>{candidate.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-muted rounded">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* New Applicants */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">New Applicants</span>
                <span className="text-xs text-muted-foreground">117</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "HRE-331", name: "Rachel Thompson", role: "Marketing Lead", applied: "2 hours ago", experience: "5 years" },
                  { id: "HRE-332", name: "Kevin Zhang", role: "Senior Engineer", applied: "5 hours ago", experience: "7 years" },
                ].map((candidate, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{candidate.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {candidate.role}
                          </span>
                          <span className="text-xs text-muted-foreground">{candidate.applied}</span>
                        </div>
                        <div className="text-sm font-medium mb-2">{candidate.name}</div>
                        <div className="text-xs text-muted-foreground">{candidate.experience} experience</div>
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

export default HiringHubMockup;
