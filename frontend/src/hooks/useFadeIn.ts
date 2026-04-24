import { useEffect, useRef } from 'react';

/**
 * Returns a ref to attach to any element.
 * When the element enters the viewport the class `in-view` is
 * added which triggers the CSS fade-up animation defined in index.css.
 */
export function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.unobserve(el); // fire once
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
