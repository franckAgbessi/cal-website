import { useEffect, useState } from 'react';
import { client } from '../sanity/client';

export default function useSanityQuery(query, params = {}, fallback = null) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(Boolean(client));
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    let active = true;
    if (!client) { setLoading(false); return undefined; }
    setLoading(true);
    client.fetch(query, params).then((result) => { if (active) { setData(result ?? fallback); setError(null); } }).catch((err) => { if (active) setError(err); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  // paramsKey safely tracks URL-derived primitive query parameters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, paramsKey]);
  return { data, loading, error };
}
