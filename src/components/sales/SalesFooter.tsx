import { motion } from "framer-motion";
import { Zap, Clock, CheckCircle } from "lucide-react";

export const SalesFooter = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 bg-accent/10 backdrop-blur-lg border-t border-accent/30"
    >
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Sales AI Active</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-muted-foreground text-sm">3 Campaigns Running</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Sync: 2 mins ago</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span>Auto Follow-up Enabled</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
