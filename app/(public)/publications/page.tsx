import { notFound } from "next/navigation";

/**
 * Retired in the login-first restructure: this page no longer exists and
 * returns 404. It is kept only because GitHub "Add files via upload" cannot
 * delete files. Safe to delete at any time.
 */
export default function RetiredPage(): never {
  notFound();
}
