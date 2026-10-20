import { LOOM_URLS, isLocalVideo, toEmbedUrl } from '../config/looms'

export function LoomEmbed({ step, label }: { step: number; label: string }) {
  const url = LOOM_URLS[step]

  if (!url) {
    return (
      <div className="video video-empty" role="img" aria-label={`Video coming soon: ${label}`}>
        <span className="video-badge">Video</span>
        <span className="video-label">{label}</span>
        <span className="video-soon">Coming soon</span>
      </div>
    )
  }

  if (isLocalVideo(url)) {
    return (
      <div className="video">
        <video src={url} title={`Video: ${label}`} controls preload="metadata" playsInline />
      </div>
    )
  }

  return (
    <div className="video">
      <iframe
        src={toEmbedUrl(url)}
        title={`Video: ${label}`}
        frameBorder="0"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
