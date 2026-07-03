"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { UpgradeModal } from "./upgrade-modal";

interface OpenUpgradeOptions {
  /** Called when the modal is dismissed without proceeding to checkout. */
  onClose?: () => void;
}

interface UpgradeModalContextValue {
  /** Open the shared upgrade modal, optionally with a contextual feature name. */
  openUpgrade: (feature?: string, options?: OpenUpgradeOptions) => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

/**
 * Mounts a single {@link UpgradeModal} and exposes {@link useUpgradeModal} so
 * any descendant CTA can trigger it. Mount once, high in the dashboard tree.
 */
export function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>(undefined);
  const onCloseRef = useRef<(() => void) | null>(null);

  const openUpgrade = useCallback(
    (nextFeature?: string, options?: OpenUpgradeOptions) => {
      setFeature(nextFeature);
      onCloseRef.current = options?.onClose ?? null;
      setOpen(true);
    },
    []
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      onCloseRef.current?.();
      onCloseRef.current = null;
    }
  }, []);

  return (
    <UpgradeModalContext.Provider value={{ openUpgrade }}>
      {children}
      <UpgradeModal open={open} onOpenChange={handleOpenChange} feature={feature} />
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal(): UpgradeModalContextValue {
  const ctx = useContext(UpgradeModalContext);
  if (!ctx) {
    throw new Error("useUpgradeModal must be used within an UpgradeModalProvider");
  }
  return ctx;
}
