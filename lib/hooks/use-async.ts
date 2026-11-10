"use client";

import { useEffect, useRef, useState, type DependencyList } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an async loader whenever deps change. Keeps the previous data visible
 * while reloading (no layout flash) and ignores out-of-order responses.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const seq = useRef(0);

  useEffect(() => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => {
        if (id === seq.current) setState({ data, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (id === seq.current) setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : "Unknown error" }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
