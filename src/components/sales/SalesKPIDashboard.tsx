import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  delay: number;
}

const KPICard = ({ icon: Icon, label, value, change, isPositive, delay }: KPICardProps) => {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value.replace(/[^0-9]/g, ""));

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = targetValue / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="hover:border-accent/50 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold">
                {label.includes("Revenue") || label.includes("Deal") ? `$${count}K` : count}
              </p>
              <p className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {change}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent/20">
              <Icon className="h-6 w-6 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SalesKPIDashboard = ({ timeRange }: { timeRange: string }) => {
  const kpis = [
    {
      icon: Users,
      label: "Leads Generated",
      value: "342",
      change: "+18% vs last period",
      isPositive: true,
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: "24%",
      change: "+3.2% vs last period",
      isPositive: true,
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: "847K",
      change: "+22% vs last period",
      isPositive: true,
    },
    {
      icon: Target,
      label: "Avg Deal Size",
      value: "12K",
      change: "-2% vs last period",
      isPositive: false,
    },
    {
      icon: Megaphone,
      label: "Active Campaigns",
      value: "7",
      change: "3 performing above target",
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, idx) => (
        <KPICard key={idx} {...kpi} delay={idx * 0.1} />
      ))}
    </div>
  );
};
