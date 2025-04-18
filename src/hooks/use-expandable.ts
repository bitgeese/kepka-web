import { useState, useRef } from "react";
import { useMotionValue } from "framer-motion";

export function useExpandable(initialState = false) {
  const [isExpanded, setIsExpanded] = useState(initialState);
  const animatedHeight = useMotionValue(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return {
    isExpanded,
    setIsExpanded,
    toggleExpand,
    animatedHeight,
    contentRef,
  };
} 