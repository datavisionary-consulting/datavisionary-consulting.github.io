import { useEffect, useState } from 'react';

export function useActiveSection(enabled) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const sections = document.querySelectorAll('main section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));

    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 80;
      if (nearBottom) setActiveId('contact');
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled]);

  return activeId;
}
