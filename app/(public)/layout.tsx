/**
 * Route group for the unauthenticated entry point. The sign-in page renders
 * its own minimal chrome, so this layout adds nothing.
 */
export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
