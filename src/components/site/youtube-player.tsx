"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/** Vervangt <custom-youtube-player>: eerst een poster, pas na een klik laadt de video. */
export function YoutubePlayer({
  videoId,
  poster,
}: {
  videoId: string;
  poster?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const cover =
    poster ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: "inherit",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {playing ? (
        <iframe
          title="YouTube-video"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Video afspelen"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            padding: 0,
            cursor: "pointer",
            background: `center / cover no-repeat url("${cover}")`,
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              margin: "auto",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#E6007E",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
            }}
          >
            <Play size={30} fill="#fff" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
