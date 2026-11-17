/**
 * Retired in the white-and-red redesign: the configuration module is now
 * BhkModule in ./bhk-module.tsx (route /dashboard/analyst/bhk).
 * Kept only as a re-export so that Next.js type-checking passes on
 * repositories updated through GitHub "Add files via upload", which cannot
 * delete files. It is safe to delete this file at any time.
 */
export { BhkModule as ConfigurationModule } from "./bhk-module";
