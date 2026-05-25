"use client";

import { useState, useEffect } from "react";
import {
  hasPart1Access,
  hasPart2Access,
  setPart1Purchased,
  setPart2Purchased,
} from "@/lib/access";

interface PurchaseAccess {
  hasPart1: boolean;
  hasPart2: boolean;
  isLoading: boolean;
  unlockPart1: () => void;
  unlockPart2: () => void;
}

/**
 * Hook that reads purchase access state from localStorage.
 * isLoading = true during SSR/hydration (localStorage not available server-side).
 */
export function usePurchaseAccess(): PurchaseAccess {
  const [hasPart1, setHasPart1] = useState(false);
  const [hasPart2, setHasPart2] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasPart1(hasPart1Access());
    setHasPart2(hasPart2Access());
    setIsLoading(false);
  }, []);

  const unlockPart1 = () => {
    setPart1Purchased(true);
    setHasPart1(true);
  };

  const unlockPart2 = () => {
    setPart2Purchased(true);
    setHasPart2(true);
  };

  return { hasPart1, hasPart2, isLoading, unlockPart1, unlockPart2 };
}
