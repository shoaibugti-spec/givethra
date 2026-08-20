import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (standalone) return; // already installed

    setIsIOS(ios);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS doesn't fire beforeinstallprompt — show manual guide button
    if (ios) setShowBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  }

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Download className="h-5 w-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Install Givethra App</p>
            <p className="text-xs opacity-90">Add to your home screen for quick access</p>
          </div>
          <Button size="sm" variant="secondary" onClick={handleInstall} className="shrink-0">
            Install
          </Button>
          <button onClick={() => setShowBanner(false)} className="shrink-0 opacity-80 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowIOSGuide(false)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Install on iPhone</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2"><span className="font-bold text-primary">1.</span> Tap the <strong>Share</strong> button (□↑) at the bottom of Safari</li>
              <li className="flex gap-2"><span className="font-bold text-primary">2.</span> Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li className="flex gap-2"><span className="font-bold text-primary">3.</span> Tap <strong>"Add"</strong> — done! 🎉</li>
            </ol>
            <Button className="w-full" onClick={() => setShowIOSGuide(false)}>Got it</Button>
          </div>
        </div>
      )}
    </>
  );
}
