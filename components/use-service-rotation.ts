'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useServiceRotation(root: RefObject<HTMLElement | null>, advance: () => void, paused: boolean) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      const play = visible && !paused && !reduced.matches && document.visibilityState === 'visible';
      setRunning(play);
      if (play) timer = setInterval(advance, 4000);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.2 });
    observer.observe(element);
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      reduced.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [root, advance, paused]);

  return running;
}
