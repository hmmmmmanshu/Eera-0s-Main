import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const ChatBubble = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openCognitive = () => {
    // Prefer mini chat; for now deep-link to cognitive hub
    if (location.pathname !== "/cognitive") navigate("/cognitive");
    setOpen(false);
  };

  // Hide ChatBubble on CognitiveHub page
  if (location.pathname === "/cognitive") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Talk to Eera"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
      {open && (
        <div className="w-[320px] h-[420px] bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <img src="/Logo.png" alt="Eera" className="h-9 w-9" />
              <span className="text-sm font-medium">Talk to Eera</span>
            </div>
            <button className="p-1 hover:opacity-80" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 h-[calc(420px-48px-56px)] overflow-y-auto text-sm text-muted-foreground">
            Hi! I’m Eera. Ask me anything about your business context, or jump to the Cognitive Hub for full chat and planning.
          </div>
          <div className="p-3 border-t border-border flex justify-end">
            <Button size="sm" variant="default" onClick={openCognitive}>Open Cognitive Hub</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;


