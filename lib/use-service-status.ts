"use client";

import { useCallback, useEffect, useState } from "react";

export type ServiceStatus = "checking" | "online" | "offline";
export type OfflineReason = "unconfigured" | "unreachable";

/** Returns parsed data when the probe says the service is usable, else why not. */
export type ProbeReader<T> = (res: Response) => Promise<T | OfflineReason>;

export const healthOk: ProbeReader<true> = async (res) =>
  res.ok ? true : "unreachable";

/**
 * Probes a demo backend once on mount (and on retry). A missing URL is
 * reported as "unconfigured"; a timeout or network/CORS failure is
 * "unreachable". Callers can also flip to offline when a real request fails
 * mid-session.
 */
export function useServiceStatus<T extends object | true>(
  probeUrl: string | null,
  read: ProbeReader<T>,
  timeoutMs = 10_000,
) {
  const [status, setStatus] = useState<ServiceStatus>(
    probeUrl ? "checking" : "offline",
  );
  const [reason, setReason] = useState<OfflineReason>(
    probeUrl ? "unreachable" : "unconfigured",
  );
  const [data, setData] = useState<T | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!probeUrl) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    fetch(probeUrl, { signal: controller.signal, cache: "no-store" })
      .then(read)
      .catch((): OfflineReason => "unreachable")
      .then((result) => {
        if (cancelled) return;
        if (typeof result === "string") {
          setData(null);
          setReason(result);
          setStatus("offline");
        } else {
          setData(result);
          setStatus("online");
        }
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [probeUrl, read, timeoutMs, attempt]);

  const retry = useCallback(() => {
    setStatus("checking");
    setAttempt((n) => n + 1);
  }, []);

  const markOffline = useCallback((why: OfflineReason = "unreachable") => {
    setReason(why);
    setStatus("offline");
  }, []);

  return {
    status,
    reason: status === "offline" ? reason : null,
    data,
    retry: probeUrl ? retry : undefined,
    markOffline,
  };
}

/** fetch() rejects with a TypeError on DNS, connection, and CORS failures. */
export function isNetworkError(err: unknown): boolean {
  return (
    err instanceof TypeError ||
    (err instanceof Error &&
      /failed to fetch|networkerror|load failed|fetch failed/i.test(
        err.message,
      ))
  );
}
