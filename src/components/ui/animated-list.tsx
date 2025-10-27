import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

export interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList = ({
  className,
  children,
  delay = 1000,
}: AnimatedListProps) => {
  const [messages, setMessages] = useState<ReactNode[]>([]);
  const childrenArray = Array.isArray(children) ? children : [children];

  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length < childrenArray.length) {
        setMessages((prev) => [...prev, childrenArray[messages.length]]);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [messages.length, childrenArray.length, delay, childrenArray]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <AnimatePresence>
        {messages.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
