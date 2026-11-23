import gsap from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

// ScrollTrigger supplies the actual cover boundaries, including any reading space.
// Only the overlap is timed. Within a tall chapter the browser scrolls normally.
export function paceSectionScroll(root: HTMLElement, covers: ScrollTrigger[]) {
  const settleMs = 2000;
  let readyAt = performance.now() + settleMs;
  let previousY = window.scrollY;
  let userScrolling = false;
  let transition: gsap.core.Tween | undefined;

  function cancel() {
    userScrolling = false;
    transition?.kill();
    transition = undefined;
    previousY = window.scrollY;
  }

  function moveTo(y: number) {
    window.scrollTo({ top: y, behavior: 'instant' });
    previousY = window.scrollY;
  }

  function cross(from: number, to: number) {
    const forward = to > from;
    const range = forward
      ? covers.find(c => from < c.end - 1 && to > c.start + 1)
      : covers.findLast(c => from > c.start + 1 && to < c.end - 1);
    if (!range) return false;

    const start = Math.max(range.start, Math.min(range.end, from));
    const end = forward ? range.end : range.start;
    moveTo(start);
    if (performance.now() < readyAt) return true;

    const position = { y: start };
    transition = gsap.to(position, {
      y: end, duration: 2, ease: 'sine.inOut',
      onUpdate: () => moveTo(position.y),
      onComplete: () => {
        transition = undefined;
        readyAt = performance.now() + settleMs;
        userScrolling = false;
      },
    });
    return true;
  }

  function inPage(target: EventTarget | null) {
    return target === document.body || target === document.documentElement || (target instanceof Node && root.contains(target));
  }

  function wheel(event: WheelEvent) {
    if (event.ctrlKey || !event.cancelable || !inPage(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    userScrolling = true;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    if (transition || cross(window.scrollY, window.scrollY + event.deltaY * unit)) event.preventDefault();
  }

  function touch(event: TouchEvent) {
    if (event.touches.length !== 1 || !inPage(event.target)) return;
    userScrolling = true;
    if (transition && event.cancelable) event.preventDefault();
  }

  function key(event: KeyboardEvent) {
    if (event.key === 'Escape') { cancel(); return; }
    if (!inPage(event.target) || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable=true],button')) return;
    if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '].includes(event.key)) { cancel(); return; }
    userScrolling = true;
    if (transition) event.preventDefault();
  }

  function scroll() {
    const y = window.scrollY;
    const from = previousY;
    previousY = y;
    if (userScrolling && !transition && Math.abs(y - from) > 0 && cross(from, y)) return;
  }

  window.addEventListener('wheel', wheel, { passive: false });
  window.addEventListener('touchmove', touch, { passive: false });
  window.addEventListener('keydown', key);
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('popstate', cancel);
  window.addEventListener('resize', cancel);
  document.addEventListener('pointerdown', cancel, true);
  document.addEventListener('click', cancel, true);
  return () => {
    cancel();
    window.removeEventListener('wheel', wheel);
    window.removeEventListener('touchmove', touch);
    window.removeEventListener('keydown', key);
    window.removeEventListener('scroll', scroll);
    window.removeEventListener('popstate', cancel);
    window.removeEventListener('resize', cancel);
    document.removeEventListener('pointerdown', cancel, true);
    document.removeEventListener('click', cancel, true);
  };
}
