import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { useCreateCandidate, useHRRoles } from "@/hooks/useHRData";
import { toast } from "sonner";

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedRoleId?: string;
  onCandidateAdded?: () => void;
}

export function AddCandidateDialog({
  open,
  onOpenChange,
  preselectedRoleId,
  onCandidateAdded,
}: AddCandidateDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(preselectedRoleId);
  
  const { data: roles = [] } = useHRRoles();
  const createCandidate = useCreateCandidate();

  // Update selected role when preselectedRoleId changes
  useEffect(() => {
    if (preselectedRoleId) {
      setSelectedRoleId(preselectedRoleId);
    }
  }, [preselectedRoleId]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      await createCandidate.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        role_id: selectedRoleId && selectedRoleId !== "none" ? selectedRoleId : null,
        resume_url: null,
        score: null,
        status: "applied",
        interview_notes: null,
        screening_results: null,
      });

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSelectedRoleId(preselectedRoleId);
      
      onOpenChange(false);
      if (onCandidateAdded) {
        onCandidateAdded();
      }
    } catch (error) {
      // Error already handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-accent" />
            Add Candidate
          </DialogTitle>
          <DialogDescription>
            Add a candidate showing interest for this position.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="candidate-name">Name *</Label>
            <Input
              id="candidate-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate-email">Email *</Label>
            <Input
              id="candidate-email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate-phone">Phone</Label>
            <Input
              id="candidate-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate-role">Position</Label>
            <Select 
              value={selectedRoleId || "none"} 
              onValueChange={(value) => setSelectedRoleId(value === "none" ? undefined : value)}
            >
              <SelectTrigger id="candidate-role">
                <SelectValue placeholder="Select a position (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Position</SelectItem>
                {roles.filter(r => r.status === 'open').map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title} {role.department ? `- ${role.department}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || createCandidate.isPending}
          >
            {createCandidate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Candidate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

