import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import { motion } from "framer-motion";

export function WorkflowGraph() {
  const nodes = [
    { id: 1, label: "Start", status: "completed", x: 50, y: 50 },
    { id: 2, label: "Marketing", status: "completed", x: 150, y: 50 },
    { id: 3, label: "Finance", status: "active", x: 250, y: 30 },
    { id: 4, label: "Legal", status: "pending", x: 250, y: 70 },
    { id: 5, label: "Complete", status: "pending", x: 350, y: 50 },
  ];

  const connections = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-500";
      case "active":
        return "bg-accent border-accent animate-pulse";
      case "pending":
        return "bg-muted border-muted";
      default:
        return "bg-muted border-muted";
    }
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitBranch className="h-5 w-5 text-accent" />
          Workflow Execution Graph
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 bg-background/30 rounded-lg p-4">
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className={`absolute w-16 h-16 rounded-full border-2 ${getStatusColor(node.status)} flex items-center justify-center text-xs font-semibold text-center`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: "translate(-50%, -50%)"
              }}
              whileHover={{ scale: 1.1 }}
            >
              {node.label}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
