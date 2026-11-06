import { scrollState } from '../hooks/useScrollProgress';

/**
 * Scrub a video in response to page scroll.
 *
 * The video only moves while the user scrolls. Playback position is mapped
 * onto the section lifecycle (start: section top reaches bottom of viewport →
 * end: section bottom reaches top of viewport) and written to `currentTime`.
 * When scrolling stops the video freezes on the current frame — no passive
 * playback, looping or autoplay.
 */
export function seekVideoToScroll(video, section) {
  if (!video || !section) return;
  if (scrollState.reducedMotion) {
    video.pause();
    return;
  }
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;

  const rect = section.getBoundingClientRect();
  const start = rect.top - window.innerHeight;
  const end = rect.top + rect.height;
  const span = Math.max(end - start, 1);
  const progress = Math.min(Math.max((window.scrollY - start) / span, 0), 1);
  const target = Math.min(progress * video.duration, Math.max(video.duration - 0.05, 0));

  if (Math.abs(video.currentTime - target) > 0.05) {
    video.currentTime = target;
  }
}

/**
 * Attaches a passive scroll listener that scrubs the video via requestAnimationFrame.
 * Returns a cleanup function.
 */
export function startScrollVideoScrub(video, section) {
  if (!video || !section) return () => {};

  let frame = null;

  const tick = () => {
    frame = null;
    seekVideoToScroll(video, section);
  };

  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(tick);
  };
  const onResize = () => tick();
  const onMetadata = () => tick();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  video.addEventListener('loadedmetadata', onMetadata);
  tick();

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    video.removeEventListener('loadedmetadata', onMetadata);
    if (frame) cancelAnimationFrame(frame);
  };
}
