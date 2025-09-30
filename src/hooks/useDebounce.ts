import { useCallback, useRef } from "react";

export const useDebounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number = 500
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );

  return debouncedFn;
};
