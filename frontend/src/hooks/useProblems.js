import { useCallback, useEffect, useRef, useState } from "react";
import { getProblemsWithProgress } from "../api/problems";

// Fetches problems (with the current user's progress attached) for the given
// filter params. `loading` is only ever true on the very first fetch for a
// given filter set — later refreshes (e.g. after an edit) use `refreshing`
// instead, so the UI never unmounts the whole list just to update one row.
export function useProblems(params = {}) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedOnce = useRef(false);

  const key = JSON.stringify(params);

  const refresh = useCallback(async () => {
    if (hasLoadedOnce.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getProblemsWithProgress(params);
      setProblems(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to load problems.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    hasLoadedOnce.current = false;
    // Fetch-on-mount/filter-change: intentional data sync with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [key, refresh]);

  return { problems, setProblems, loading, refreshing, error, refresh };
}
