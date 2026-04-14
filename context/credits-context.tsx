"use client";

import { createContext, useContext, useState, useEffect } from "react";

export const CREDITS_TOTAL = 5;

interface CreditsContextValue {
  remaining: number | null;
  update: (remaining: number) => void;
}

const CreditsContext = createContext<CreditsContextValue>({
  remaining: null,
  update: () => {},
});

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/credits")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setRemaining(data.remaining); })
      .catch(() => {});
  }, []);

  return (
    <CreditsContext.Provider value={{ remaining, update: setRemaining }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
