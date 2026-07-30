import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `false` during server render and the initial client hydration pass,
 * then `true` once the component is mounted on the client.
 *
 * Drop-in replacement for the `const [mounted, setMounted] = useState(false)` +
 * `useEffect(() => setMounted(true), [])` pattern, but without calling setState
 * inside an effect (which triggers react-hooks/set-state-in-effect).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
