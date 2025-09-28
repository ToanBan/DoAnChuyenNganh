import { useEffect, useRef, useState } from "react";

export default function VideoPlayer({
  videoUrl,
  onWatchedEnough,
}: {
  videoUrl: string;
  onWatchedEnough: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const handleTimeUpdate = () => {
        const percentWatched = (video.currentTime / video.duration) * 100;
        if (percentWatched >= 80) {
          onWatchedEnough(); 
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onWatchedEnough]);

  return (
    <video
      ref={videoRef}
      className="w-100 h-auto"
      controls
      poster="/images/video-poster.png"
    >
      <source src={videoUrl} type="video/mp4" />
      Trình duyệt không hỗ trợ video.
    </video>
  );
}
