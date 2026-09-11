// lib/shared/crossTabSync.ts

/**
 * Keeps a persisted zustand store in sync across browser tabs/windows.
 * Each game runs a host-controls screen and a public display screen as
 * separate tabs — this mirrors state changes from one into the other by
 * listening for the localStorage writes zustand's persist middleware makes.
 */
export function syncStoreAcrossTabs<T>(
  key: string,
  setState: (partial: Partial<T>) => void
) {
  if (typeof window === "undefined") return;
  window.addEventListener("storage", (event) => {
    if (event.key === key && event.newValue) {
      const newState = JSON.parse(event.newValue).state;
      setState(newState);
    }
  });
}
