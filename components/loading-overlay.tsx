"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Inner component that uses useSearchParams (requires Suspense boundary).
 */
function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousPath = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // When the route finishes changing, complete the progress bar
  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    const prevPath = previousPath.current;

    if (currentPath !== prevPath) {
      clearTimers();
      setProgress(100);
      setLoading(true);

      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400);

      previousPath.current = currentPath;
    }
  }, [pathname, searchParams, clearTimers]);

  // On internal link click, start the progress bar immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;

      // Internal navigation detected
      if (href !== pathname) {
        clearTimers();
        setLoading(true);
        setProgress(15);

        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return 90;
            return prev + Math.random() * 12;
          });
        }, 300);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, [pathname, clearTimers]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-9999 h-0.75">
      <div
        className="h-full rounded-r-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--primary), var(--accent))",
          boxShadow: "0 0 10px var(--primary), 0 0 5px var(--accent)",
        }}
      />
    </div>
  );
}

/**
 * Exported wrapper with Suspense boundary (required by useSearchParams).
 */
export default function LoadingOverlay() {
  return (
    <Suspense fallback={null}>
      <LoadingBar />
    </Suspense>
  );
}
