import { useRef, useState } from "react";

export default function ProtectedVideoPlayer({ src, className = "" }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function seek(value: string) {
    const video = videoRef.current;
    const nextTime = Number(value);
    if (!video || !Number.isFinite(nextTime)) return;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onContextMenu={(event) => event.preventDefault()}
        className="block max-h-80 w-full select-none"
      />
      <div className="flex items-center gap-3 px-3 py-2" aria-label="Video controls">
        <button type="button" onClick={togglePlayback} className="min-w-16 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25" aria-label={playing ? "Pause video" : "Play video"}>
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seek(event.target.value)}
          className="min-w-0 flex-1 accent-white"
          aria-label="Video timeline"
        />
      </div>
    </div>
  );
}
