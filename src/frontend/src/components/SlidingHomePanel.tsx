import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, DollarSign, HandHelping, WalletCards } from "lucide-react";

type PanelTab = "earning" | "support" | "wallet";

interface SlidingHomePanelProps {
  children: ReactNode;
  onTabChange?: (tab: PanelTab) => void;
}

const TABS: Array<{ id: PanelTab; label: string; icon: typeof DollarSign }> = [
  { id: "earning", label: "Earning", icon: DollarSign },
  { id: "support", label: "Support", icon: HandHelping },
  { id: "wallet", label: "Wallet", icon: WalletCards },
];

const TAB_TARGETS: Record<PanelTab, string> = {
  earning: "home-support-summary",
  support: "home-support-summary",
  wallet: "home-wallet-summary",
};

/**
 * Home shell for the existing functional HomeSocialDashboard.
 *
 * Collapsed: the existing Home Page remains a normal, fully visible page and
 * the compact header floats above its bottom edge.
 * Expanded: the same React content moves into a 90dvh scrollable sheet. It is
 * not duplicated, so posting, support, feed tabs and wallet state stay intact.
 */
export default function SlidingHomePanel({ children, onTabChange }: SlidingHomePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("support");
  const dragStartY = useRef<number | null>(null);
  const dragStartExpanded = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDragging]);

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartY.current = event.clientY;
    dragStartExpanded.current = expanded;
    setDragOffset(0);
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const delta = event.clientY - dragStartY.current;
    setDragOffset(dragStartExpanded.current ? delta : Math.max(0, delta));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const delta = event.clientY - dragStartY.current;
    const threshold = Math.min(110, window.innerHeight * 0.14);
    if (Math.abs(delta) >= threshold) setExpanded(delta < 0);
    dragStartY.current = null;
    setDragOffset(0);
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const togglePanel = () => setExpanded((value) => !value);

  const chooseTab = (tab: PanelTab) => {
    setActiveTab(tab);
    setExpanded(true);
    onTabChange?.(tab);
    window.requestAnimationFrame(() => {
      document.getElementById(TAB_TARGETS[tab])?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const shellClass = expanded
    ? "fixed inset-x-0 bottom-0 z-40 h-[90dvh] max-h-[900px] min-h-[260px] overflow-hidden rounded-t-[2rem] border border-b-0 border-primary/15 bg-background/95 shadow-[0_-18px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    : "relative min-h-0 bg-transparent";
  const headerClass = expanded
    ? "shrink-0 border-b border-border/80 bg-card/95 px-3 pb-3 pt-2"
    : "fixed inset-x-0 bottom-0 z-50 border-t border-primary/15 bg-card/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.16)] backdrop-blur-xl";
  const bodyClass = expanded
    ? "min-h-0 flex-1 overflow-y-auto overscroll-contain"
    : "hidden";

  return (
    <div className={shellClass} style={{ transform: expanded && dragOffset ? `translateY(${dragOffset}px)` : undefined, transition: isDragging ? "none" : "transform 260ms cubic-bezier(0.23, 1, 0.32, 1)" }} data-testid="home-bottom-sheet" aria-label="Givethra home content panel">
      <div className={`${headerClass} touch-none select-none`} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <button type="button" onClick={togglePanel} className="mx-auto flex w-full flex-col items-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-expanded={expanded} aria-controls="givethra-home-panel-content">
          <span className="flex h-7 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ChevronUp className={`h-5 w-5 animate-bounce transition-transform ${expanded ? "rotate-180" : ""}`} />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{expanded ? "Swipe down to close" : "Swipe up to explore"}</span>
        </button>
        <div className="mx-auto mt-2 grid max-w-xl grid-cols-3 gap-2" role="tablist" aria-label="Home summary tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => chooseTab(id)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition active:scale-[0.97] ${activeTab === id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div id="givethra-home-panel-content" className={bodyClass} style={{ WebkitOverflowScrolling: "touch" }}>
        {children}
      </div>
    </div>
  );
}

export type { PanelTab };
