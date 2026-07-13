import { useEffect, useState } from 'react';

export function useContent(lang) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const file = lang === 'es' ? '/data/content.es.json' : '/data/content.json';

    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load ' + file);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        console.error('Data Visionary content error:', err);
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  return { data, error };
}
