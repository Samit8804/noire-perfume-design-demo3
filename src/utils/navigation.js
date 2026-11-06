import { scrollToTarget } from '../hooks/useScrollProgress';

/** Smoothly navigate to an in-page anchor without leaving a jumping hash in history. */
export function navigateToAnchor(event, href) {
  if (!href?.startsWith('#')) return;
  event.preventDefault();
  window.history.replaceState(null, '', href);
  scrollToTarget(href);
}
