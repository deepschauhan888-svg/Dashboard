import { redirect } from "next/navigation";

/** Sign-in now lives at the root URL; keep old /login links working. */
export default function LoginRedirect() {
  redirect("/");
}
